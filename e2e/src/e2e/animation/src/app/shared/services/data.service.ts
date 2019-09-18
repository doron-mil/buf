import {Injectable} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {BehaviorSubject} from 'rxjs';
import {Path, Point} from 'paper';

import {
  PathKeyframeData,
  playerExtraData,
  PlayerStepAnimation,
  set,
  setBall,
  SetPlayer,
} from '../dataModels/dynamicData.model';
import {playerState} from '../dataModels/staticData.model';
import {StoreService} from './store.service';
import {ModeType} from '../dataModels/general.model';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {InnerDataState} from '../../store/states/inner.data.state';
import {ActionGenerator} from '../../store/actions/action';
import {UpdatedStepForSet} from '../dataModels/innerData.model';

export const ANIMATION_PATH_RECORD_RESOLUTION = 1.8;
export const OFFSET_STEP_ON_ANIMATION_PATH = 5;

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private sets = {};
  public currentSet: set;
  public players = {};
  private animationStates = {};
  public behaviours = {};

  //-- Shared data --
  public resetZoomBehaviour = new BehaviorSubject('reset');

  // -- Animation data --
  private lastAnimationMoveMap: Map<string, PathKeyframeData>; // by Player Id
  private animationMoveMap: Map<string, PathKeyframeData[]>; // by Player Id

  constructor(private ngRedux: NgRedux<any>,
              private storeService: StoreService) {

    this.initBehaviours();

    this.currentSet = new set('', '', new setBall(false), 0, '', '', []);

    this.listenToModeChange();
  }

  private listenToModeChange() {

    this.storeService.getModeTypeChangeObservable().subscribe((modeType: ModeType) => {
      if (this.animationMoveMap && modeType !== ModeType.RECORD_ANIMATION) {
        this.toggleRecordingMode(false);
      }

      switch (modeType) {
        case ModeType.RECORD_ANIMATION:
          this.toggleRecordingMode(true);
          break;
        default:
      }
    });
  }

  private initBehaviours() {
    this.behaviours['states'] = new BehaviorSubject([]);
  }


  // ------- ANIMATION STATES -------------------------------

  public getStateByName(stateName: string, ballStatus: boolean): playerState {
    let returnState = null;
    Object.values(this.animationStates).forEach((state: playerState) => {
      if (state.name == stateName && state.withBall == ballStatus) {
        returnState = state;
      }
    });
    return returnState;
  }

  public getStateById(stateId: string): string {
    return this.animationStates[stateId] || null;
  }


  private addPlayersData() {
    let addedPlayerData = [];

    Object.keys(this.currentSet['players']).forEach(playerId => {
      let player = this.currentSet['players'][playerId];
      let id = player['id'];
      let dbPlayer = this.players[id] || '';
      let extraData = new playerExtraData('', 0, '');
      if (dbPlayer != '') {
        extraData.jerseyName = dbPlayer['jerseyName'];
        extraData.number = dbPlayer['number'];
      }
      player['extraData'] = extraData;
      addedPlayerData.push(player);
    });
    // addedPlayerData.map((player: {}) => {
    // });
    return addedPlayerData;
  }

  // -----  SET CONTROLS ------
  selectSet(setId) {
    let newSet = new set('', '', new setBall(false), 0, '', '', []);
    this.currentSet = Object.assign(newSet, this.sets[setId]);

    //reset zoom
    this.resetZoomBehaviour.next('reset');

  }


  public getSetsForMenu(): { id: string, name: string }[] {

    let returnArray = [];
    Object.keys(this.sets).forEach(setId => {
      returnArray.push({id: setId, name: this.sets[setId].name});
    });
    return returnArray;
  }


  // ----- ANIMATION CONTROLS -----
  public toggleRecordingMode(aIsRecordOn: boolean) {
    if (aIsRecordOn) {
      this.lastAnimationMoveMap = new Map<string, PathKeyframeData>();
      this.animationMoveMap = new Map<string, PathKeyframeData[]>();
    } else {
      this.saveAnimationData();
      this.lastAnimationMoveMap = null;
      this.animationMoveMap = null;
    }
  }

  public recordAnimationData(step: number, frame: number, playerId: string,
                             percentX: number, percentY: number, rotation: number, state: string) {
    const lastPathKeyframeData = this.lastAnimationMoveMap.get(playerId);
    let deltaX;
    let deltaY;
    let deltaR;
    if (lastPathKeyframeData) {
      deltaX = Math.abs(lastPathKeyframeData.percentX - percentX);
      deltaY = Math.abs(lastPathKeyframeData.percentY - percentY);
      deltaR = Math.abs(lastPathKeyframeData.rotation - rotation);
    }
    if (!lastPathKeyframeData ||
      deltaX > ANIMATION_PATH_RECORD_RESOLUTION || deltaY > ANIMATION_PATH_RECORD_RESOLUTION) {
      const pathKeyframeData = new PathKeyframeData(percentX, percentY, rotation, null);
      this.addPlayerAnimationData(playerId, pathKeyframeData);
    }
  }

  private addPlayerAnimationData(aPlayerId: string, aPathKeyframeData: PathKeyframeData) {
    let pathDataArray = this.animationMoveMap.get(aPlayerId);
    if (!pathDataArray) {
      pathDataArray = new Array<PathKeyframeData>();
      this.animationMoveMap.set(aPlayerId, pathDataArray);
    }
    pathDataArray.push(aPathKeyframeData);
    this.lastAnimationMoveMap.set(aPlayerId, aPathKeyframeData);
  }

  private saveAnimationData() {
    const setPlayerArray = new Array<SetPlayer>();

    const innerDataState = this.ngRedux.getState()[StoreDataTypeEnum.INNER_DATA] as InnerDataState;

    const updatedStepForSet = new UpdatedStepForSet();
    updatedStepForSet.setId = innerDataState.selectedSetId;
    updatedStepForSet.step = innerDataState.animationControlData.currentStep;
    updatedStepForSet.isUpdate = innerDataState.animationControlData.recordedSteps === updatedStepForSet.step;

    this.animationMoveMap.forEach((aPathDataArray, aPlayerId) => {
      const paperPath = this.convertStreamedPointsToModelAnimaion(aPathDataArray);
      updatedStepForSet.stepAnimationsMap[aPlayerId] = paperPath;
    });

    // Updating redux with the new step annimation
    this.ngRedux.dispatch(ActionGenerator.updateAnimationStepData(updatedStepForSet));
  }

  private convertStreamedPointsToModelAnimaion(aPathKeyframeDataArray: PathKeyframeData[]): PlayerStepAnimation {
    const pointsArray = aPathKeyframeDataArray.map(pathKeyframeData =>
      new Point(pathKeyframeData.percentX, pathKeyframeData.percentY));

    const path = new Path();
    path.add(...pointsArray);
    // path.smooth({type: 'continuous'});
    path.flatten(20);

    const newPlayerStepAnimation = PlayerStepAnimation.createInstance();
    newPlayerStepAnimation.paperPath = path.exportJSON();
    // Saving the start and end position as point 0 and 1 respectively on the path array attribute
    newPlayerStepAnimation.path = new Array(aPathKeyframeDataArray[0]);
    newPlayerStepAnimation.path[1] = aPathKeyframeDataArray[aPathKeyframeDataArray.length - 1];

    return newPlayerStepAnimation;
  }

  /**
   * OBSOLETE
   * @param aPathKeyframeDataArray
   */
  private normelizePathDataArray(aPathKeyframeDataArray: PathKeyframeData[]): PathKeyframeData[] {
    const pointsArray = aPathKeyframeDataArray.map(pathKeyframeData =>
      new Point((pathKeyframeData.percentX * 100), (pathKeyframeData.percentY * 100)));

    const path = new Path();
    path.add(...pointsArray);
    path.smooth({type: 'continuous'});
    const pathLength = path.length;

    const normelizedPointsArray = new Array<Point>();
    let offset = 0;
    while (offset < pathLength) {
      normelizedPointsArray.push(path.getPointAt(offset));
      offset += OFFSET_STEP_ON_ANIMATION_PATH;
    }
    if (normelizedPointsArray.length > 0) {
      normelizedPointsArray.push(path.getPointAt(pathLength)); // Last point
    } else {
      normelizedPointsArray.push(...pointsArray); // In case there was no movement
    }

    let prevPoint;
    const retPathKeyframeDataArray = normelizedPointsArray.map(point => {
      const pathKeyframeData = new PathKeyframeData(point.x / 100, point.y / 100, 0, null);
      if (prevPoint) {
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        const angleRad = Math.atan2(dy, dx);
        const angle = angleRad * 180 / Math.PI;
        pathKeyframeData.rotation = angle + 90;
      }
      prevPoint = point;
      return pathKeyframeData;
    });

    return retPathKeyframeDataArray;
  }

}
