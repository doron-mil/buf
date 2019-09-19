import {Component, OnDestroy, OnInit, QueryList, ViewChildren} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {NgRedux} from '@angular-redux/store';

import {Color, Group, Layer, PaperScope, Path, Point, Project} from 'paper';
import {DataService} from 'src/app/shared/services/data.service';
import {PlayerComponent} from './player/player.component';
import {PathKeyframeData, playerExtraData, set, SetPlayer, SetPlayerSimple} from '../../../shared/dataModels/dynamicData.model';
import {ToolbarControllerService} from '../../../shared/services/toolbar-controller.service';
import {AnimationPath, Coords} from '../../../shared/dataModels/toolbar.model';
import {StoreService} from '../../../shared/services/store.service';

import {FieldProps, ModeType} from '../../../shared/dataModels/general.model';
import {StoreDataTypeEnum} from '../../../store/storeDataTypeEnum';
import {InnerDataState} from '../../../store/states/inner.data.state';
import {DynamicDataState} from '../../../store/states/dynamic.data.state';
import {AnimationControlData} from '../../../shared/dataModels/innerData.model';
import {ActionGenerator} from '../../../store/actions/action';
import {StaticDataState} from '../../../store/states/static.data.state';
import {player} from '../../../shared/dataModels/staticData.model';

const PLAYER_EXTRA_DATA_PROPERTY = 'playerExtraData';
const MAX_ANIMATION_TIME = 15000;

@Component({
  selector: 'app-field-players',
  templateUrl: './field-players.component.html',
  styleUrls: ['./field-players.component.scss']
})
export class FieldPlayersComponent implements OnInit, OnDestroy {

  players: SetPlayer[] = [];
  simplePlayersArray: SetPlayerSimple[] = [];

  @ViewChildren('appPlayer') playerElements: QueryList<PlayerComponent>;

  currentSetId: string;
  currentStep = 0;

  animationTime = 2000;

  private scope: PaperScope;
  private paperProject: Project;
  private pathDrawingLayer: Layer;


  fieldProps: FieldProps;

  private playInterval: number;

  tmpPathForNewStep: { [key: number]: PathKeyframeData };

  animationMode = false;

  private onDestroy$ = new Subject<boolean>();

  constructor(private data: DataService,
              private storeService: StoreService,
              private ngRedux: NgRedux<any>,
              private toolbarControllerService: ToolbarControllerService) {

  }

  ngOnInit() {
    // Paper setup
    this.scope = new PaperScope();
    this.scope.setup('paperPathCanvas');
    this.paperProject = this.scope.project;
    this.pathDrawingLayer = new Layer();
    this.paperProject.addLayer(this.pathDrawingLayer);
    this.pathDrawingLayer.activate();

    this.subscribeToActions();

  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  private subscribeToActions() {
    this.onFieldDimensionsChange();
    this.onModeTypeChange();
    this.onSelectedSetChange();
    this.onPlayersSetChange();
    this.onAnimationSpeedChange();
    this.onAnimationControlDataChange();
  }

  private onModeTypeChange() {
    this.storeService.getModeTypeChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((modeType: ModeType) => {
        if (modeType !== ModeType.NONE) {
          this.paperProject.activeLayer.removeChildren();
        }
        // In case animation-recording played and there is a request to stop
        if (modeType !== ModeType.PLAY_ANIMATION && this.animationMode) {
          this.clearPlayInterval();
          this.animationMode = false;
        }
        switch (modeType) {
          case ModeType.PLAY_ANIMATION:
            const currentAnimationControlData = this.getCurrentAnimationControlData();
            this.playAnimation(currentAnimationControlData);
            break;
          case ModeType.RECORD_ANIMATION:
            if (this.currentStep > 1) {
              this.updateAllPlayersData();
            }
            break;
          default:
        }
      });
  }

  private onAnimationControlDataChange() {
    this.ngRedux.select<AnimationControlData>([StoreDataTypeEnum.INNER_DATA, 'animationControlData'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((aAnimationControlData: AnimationControlData) => {
        if (!this.animationMode) {
          this.currentStep = aAnimationControlData.currentStep;
          this.paperProject.activeLayer.removeChildren();

          if (aAnimationControlData.currentStep > aAnimationControlData.recordedSteps) {
            this.initiateAnimationForNewStep(aAnimationControlData.currentStep);
          } else {
            setTimeout(this.updateAllPlayersData.bind(this), 0);
          }
        }
      });
  }

  private onAnimationSpeedChange() {
    this.ngRedux.select<number>([StoreDataTypeEnum.INNER_DATA, 'animationSpeed'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((aSpeed: number) => {
        this.changeAnimationTime(aSpeed);
      });
  }

  private onFieldDimensionsChange() {
    this.storeService.getFieldPropsChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((fieldProps: FieldProps) => {
        this.fieldProps = fieldProps;
        this.paperProject.view.viewSize.width = this.fieldProps.dimensions.clientWidth;
        this.paperProject.view.viewSize.height = this.fieldProps.dimensions.clientHeight;
      });
  }


  private onSelectedSetChange() {
    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA, 'selectedSetId'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((selectedSetId: string) => {
        if (selectedSetId) {
          this.currentSetId = selectedSetId;
          const dynamicDataState = this.ngRedux.getState()[StoreDataTypeEnum.DYNAMIC_DATA] as DynamicDataState;
          const playersSets = dynamicDataState.playersSets;
          const foundSet = playersSets.find(setItem => setItem.id === selectedSetId);
          this.buildPlayersDataStructure(selectedSetId, foundSet);
        }
      });
  }

  private onPlayersSetChange() {
    this.ngRedux.select<set[]>([StoreDataTypeEnum.DYNAMIC_DATA, 'playersSets'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((setsArray: set[]) => {
        if (this.currentSetId && this.currentSetId > '') {
          const foundSet = setsArray.find(setItem => setItem.id === this.currentSetId);
          this.updatePlayersDataStructure(foundSet);
        }
      });
  }

  private buildPlayersDataStructure(aSelectedSetId: string, aSourceSet: set) {
    const staticDataState = this.ngRedux.getState()[StoreDataTypeEnum.STATIC_DATA] as StaticDataState;
    const playersArray = staticDataState.players;

    if (aSourceSet && aSourceSet.players) {
      this.players = aSourceSet.players;

      this.simplePlayersArray = this.players.map((aSetPlayer: SetPlayer) =>
        this.createSimplePlayer(aSetPlayer, playersArray));

    } else {
      this.players = [];
      this.simplePlayersArray = [];
      console.error(`FieldPlayersComponent.ngOnInit::selectedSetId. set (${aSelectedSetId}) not found`);
    }
  }

  private updatePlayersDataStructure(aSourceSet: set) {
    const staticDataState = this.ngRedux.getState()[StoreDataTypeEnum.STATIC_DATA] as StaticDataState;
    const playersArray = staticDataState.players;

    if (aSourceSet && aSourceSet.players) {
      this.players = aSourceSet.players;
      const newSimplePlayersArray = [];
      const simplePlayersObjMap = this.simplePlayersArray.reduce((retObjMap: any, sPlayer: SetPlayerSimple) => {
        retObjMap[sPlayer.id] = sPlayer;
        return retObjMap;
      }, {});
      this.players.forEach((setPlayer: SetPlayer) => {
        let foundSimplePlayer = simplePlayersObjMap[setPlayer.id];
        if (foundSimplePlayer) {
          this.updateSimpleSetPlayer(foundSimplePlayer, setPlayer);
        } else {
          foundSimplePlayer = this.createSimplePlayer(setPlayer, playersArray);
        }
        newSimplePlayersArray.push(foundSimplePlayer);
      });
      this.simplePlayersArray = newSimplePlayersArray;
    } else {
      this.players = [];
      this.simplePlayersArray = [];
    }
  }

  private createSimplePlayer(aSetPlayer: SetPlayer, aPlayersArray: player[]) {
    const newSimpleSetPlayer = new SetPlayerSimple();
    newSimpleSetPlayer.id = aSetPlayer.id;
    newSimpleSetPlayer.kitId = aSetPlayer.kitId;

    // assigning extra data
    const dbPlayer = aPlayersArray.find(fullDataPlayerItem => fullDataPlayerItem.id === aSetPlayer.id);
    if (dbPlayer) {
      newSimpleSetPlayer.jerseyName = dbPlayer.jerseyName;
      newSimpleSetPlayer.number = dbPlayer.number;
    }

    // Assigning x and y
    this.updateSimpleSetPlayer(newSimpleSetPlayer, aSetPlayer);

    return newSimpleSetPlayer;
  }


  private updateSimpleSetPlayer(aSimpleSetPlayer4Update: SetPlayerSimple, aSetPlayer: SetPlayer) {
    aSimpleSetPlayer4Update.kitId = aSetPlayer.kitId;
    if (aSetPlayer.animation && aSetPlayer.animation[0] && aSetPlayer.animation[0].path &&
      aSetPlayer.animation[0].path.length > 0) {
      const pathKeyframeData = aSetPlayer.animation[0].path[0];
      aSimpleSetPlayer4Update.x = pathKeyframeData.percentX;
      aSimpleSetPlayer4Update.y = pathKeyframeData.percentY;
      aSimpleSetPlayer4Update.rotation = pathKeyframeData.rotation;
    }
  }

  private changeAnimationTime(aAnimationTimePercent: number) {
    this.animationTime = MAX_ANIMATION_TIME * Math.max(aAnimationTimePercent, 1) / 100;
  }

  public playAnimation(aAnimationControlData: AnimationControlData) {
    this.animationMode = true;
    const timeLimit = this.animationTime / 18;

    const currentStepToPlay = aAnimationControlData.currentStep - 1;

    const playersPaths = {};
    const nonVisiblePathsGroup = new Group();
    this.playerElements.forEach((aPlayerComponent: PlayerComponent) => {
      const playerIndex = aPlayerComponent.index;

      const paperPathJson = this.players[playerIndex].animation[currentStepToPlay].paperPath;

      if (paperPathJson) {
        const paperPath = new Path();
        paperPath.importJSON(paperPathJson);
        playersPaths[aPlayerComponent.id] = {path: paperPath};
        nonVisiblePathsGroup.addChild(paperPath);

        this.drawAnimationPath(paperPath, aPlayerComponent);
      }
    });

    let counter = 0;
    this.playInterval = setInterval(() => {
      this.playersInterval(counter, timeLimit, playersPaths);
      counter += 1;
      if (counter > timeLimit) {
        this.clearPlayInterval();
        nonVisiblePathsGroup.removeChildren();
        this.checkForNextStep(aAnimationControlData);
      }
    }, 20);
  }

  private checkForNextStep(aAnimationControlData: AnimationControlData) {
    this.currentStep = ++aAnimationControlData.currentStep;
    this.ngRedux.dispatch(ActionGenerator.setAnimationStep(this.currentStep));

    if (aAnimationControlData.currentStep <= aAnimationControlData.recordedSteps) {
      this.playAnimation(aAnimationControlData);
    } else {
      this.animationMode = false;
      this.storeService.setMode(ModeType.NONE);
    }
  }

  private clearPlayInterval() {
    clearInterval(this.playInterval);
    this.playInterval = 0;
  }

  private drawAnimationPath(aPaperPath: paper.Path, aPlayerComponent: PlayerComponent) {
    const pathLength = aPaperPath.length;

    if (pathLength) {
      const visiblePath = new Path();
      const pointsArray = [];
      const framesCount = 200;
      let counter = 0;
      while (counter <= framesCount) {
        const pathOffset = pathLength / framesCount * counter;
        const pointAt = aPaperPath.getPointAt(pathOffset);
        if (pointAt) {
          const pointAt4Field = aPlayerComponent.computeCenterFieldPositionFromPercentageData(pointAt);
          pointAt.x = pointAt4Field.x;
          pointAt.y = pointAt4Field.y;
          visiblePath.add(pointAt);
          pointsArray.push({pointA: pointAt, pointB: pointAt4Field});
        }
        counter++;
      }

      visiblePath.strokeColor = new Color('yellow');
      visiblePath.strokeWidth = 3;
      visiblePath.strokeCap = 'round';
      visiblePath.dashArray = [10, 6];
      this.pathDrawingLayer.addChild(visiblePath);
    }
  }

  playersInterval(counter, timeLimit, playersPaths) {
    this.playerElements.forEach((aPlayerComponent: PlayerComponent) => {
      if (playersPaths[aPlayerComponent.id] &&
        playersPaths[aPlayerComponent.id].path &&
        playersPaths[aPlayerComponent.id].path.length) {
        const tempPath = playersPaths[aPlayerComponent.id].path;
        if (tempPath) {
          const pathOffset = tempPath.length / timeLimit * counter;
          const pointAt = tempPath.getPointAt(pathOffset);
          if (pointAt != null) {
            aPlayerComponent.percentX = pointAt.x;
            aPlayerComponent.percentY = pointAt.y;
            aPlayerComponent.playerRotation = this.computeRotation(pointAt, playersPaths[aPlayerComponent.id]);
            aPlayerComponent.updatePlayerData();
          }
        }
      }
    });
  }

  private computeRotation(aCurrentPoint: Point, aPlayerPathObject: { prevAnimationPoints: Array<Point> }): number {
    let retRotation = 0;
    if (aPlayerPathObject.prevAnimationPoints) {
      const prevPoint = aPlayerPathObject.prevAnimationPoints[0];
      const dx = aCurrentPoint.x - prevPoint.x;
      const dy = aCurrentPoint.y - prevPoint.y;
      const angleRad = Math.atan2(dy, dx);
      const angle = angleRad * 180 / Math.PI;
      retRotation = angle + 90;
      aPlayerPathObject.prevAnimationPoints.push(aCurrentPoint);
      if (aPlayerPathObject.prevAnimationPoints.length > 5) {
        aPlayerPathObject.prevAnimationPoints.shift();
      }
    } else {
      aPlayerPathObject.prevAnimationPoints = new Array<Point>(aCurrentPoint);
    }

    return retRotation;
  }

  /**
   * OBSOLETE - maybe will be needed for reference
   */
  private displayAnimationPath() {
    this.playerElements.forEach((aPlayerComponent: PlayerComponent) => {
      const playerIndex = aPlayerComponent.index;
      const animationPathInPercentage = this.players[playerIndex].animation[0].path;

      const animationPath = animationPathInPercentage.map((aPathKeyframeData: PathKeyframeData) => {
        const coords = this.convertPathKeyframeData2Coords(aPathKeyframeData);
        return coords;
      });

      this.toolbarControllerService.drawPathPercentageData(new AnimationPath(this.players[playerIndex].id, animationPath));
    });
  }

  /**
   * OBSOLETE - maybe will be needed for reference
   */
  private convertPathKeyframeData2Coords(aPathKeyframeData: PathKeyframeData): Coords {
    const coords = new Coords();
    coords.x = aPathKeyframeData.percentX;
    coords.y = aPathKeyframeData.percentY;
    return coords;
  }

  private getCurrentAnimationControlData(): AnimationControlData {
    const innerDataState = this.ngRedux.getState()[StoreDataTypeEnum.INNER_DATA] as InnerDataState;
    return Object.assign({}, innerDataState.animationControlData);
  }

  private updateAllPlayersData() {
    if (this.playerElements) {
      this.playerElements.forEach((aPlayerComponent: PlayerComponent) => {
        let point0;
        if (this.players[aPlayerComponent.index].animation[this.currentStep - 1]) {
          point0 = this.players[aPlayerComponent.index].animation[this.currentStep - 1].path[0];
        } else {
          point0 = this.tmpPathForNewStep[aPlayerComponent.index];
        }
        if (point0) {
          aPlayerComponent.percentX = point0.percentX;
          aPlayerComponent.percentY = point0.percentY;
          aPlayerComponent.updatePlayerData();
        } else {
          console.error('FieldPlayersComponent.updateAllPlayersData. Couldn\'t find initial point');
        }
      });
    }
  }

  private initiateAnimationForNewStep(aNewStepNumber: number) {
    this.tmpPathForNewStep = {};
    this.players.forEach((aSetPlayer: SetPlayer, index: number) => {
      if (aSetPlayer.animation && aSetPlayer.animation[this.currentStep - 2]) {
        this.tmpPathForNewStep[index] = aSetPlayer.animation[aNewStepNumber - 2].path[1];
      } else if (aSetPlayer.animation && aSetPlayer.animation[this.currentStep - 1]) {
        this.tmpPathForNewStep[index] = aSetPlayer.animation[this.currentStep - 1].path[0];
      }

      if (!this.tmpPathForNewStep[index]) {
        console.error('FieldPlayersComponent.initiateAnimationForNewStep.' +
          `problem with previous step path ${aSetPlayer.animation[aNewStepNumber - 2]}`);
        this.tmpPathForNewStep[index] = aSetPlayer.animation[aNewStepNumber - 2].path[0];
      }
    });
    this.updateAllPlayersData();
  }
}
