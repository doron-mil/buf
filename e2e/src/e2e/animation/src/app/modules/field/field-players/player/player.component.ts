import {Component, ElementRef, Input, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {NgRedux} from '@angular-redux/store';
import {Point} from 'paper';

import {DataService} from 'src/app/shared/services/data.service';
import {environment} from 'src/environments/environment.prod';
import {StoreService} from '../../../../shared/services/store.service';
import {Dimensions, FieldProps} from '../../../../shared/dataModels/general.model';
import {playerState} from 'src/app/shared/dataModels/staticData.model';
import {StoreDataTypeEnum} from 'src/app/store/storeDataTypeEnum';
import {passTargetSelected, updatePlayerMenuState} from 'src/app/store/actions/action';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';


@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss']
})
export class PlayerComponent implements OnInit, OnDestroy {

  @Input() id: string;
  @Input() name: string;
  @Input() number: number;
  @Input() index: number;
  @Input() percentX: number;
  @Input() percentY: number;
  @Input() playerRotation: number;
  @Input() showMenu: boolean;

  @ViewChild('player', {static: true}) playerElement: ElementRef<HTMLDivElement>;
  @ViewChild('playerSvg', {static: true}) playerSvg: ElementRef;


  x: number = 0;
  y: number = 0;
  lastX: number;
  lastY: number;
  previousPositions = [];
  scale: number = 0.6;
  zIndex = 1;
  duration: number = 0.05;

  playerState: playerState;

  firstDataUpdate = true;
  fieldProps: FieldProps;
  selfDimensions: Dimensions;

  isPassWaitingForTarget = false;
  passSourceId = '';

  transformationData: {
    transFieldDim: Dimensions;
    actualIconDim: Dimensions;
    iconSpaceDim: Dimensions;
    halfActualIconDim: Dimensions;  // saving calculating half each time
    halfIconSpaceDim: Dimensions;
  } = {
    transFieldDim: new Dimensions(),
    actualIconDim: new Dimensions(),
    iconSpaceDim: new Dimensions(),
    halfActualIconDim: new Dimensions(),
    halfIconSpaceDim: new Dimensions(),
  };

  private onDestroy$ = new Subject<boolean>();

  constructor(private data: DataService, private storeService: StoreService, private ngRedux: NgRedux<any>) {
  }

  ngOnInit() {
    const selfBoundingClientRect = this.playerElement.nativeElement.getBoundingClientRect();
    this.selfDimensions = Dimensions.createInstance(selfBoundingClientRect.width, selfBoundingClientRect.height);

    this.storeService.getFieldPropsChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((fieldProps: FieldProps) => {
        this.fieldProps = fieldProps;
        this.computeScaleAndTransformation();
        this.updatePlayerData();
      });

    this.data.behaviours['states']
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(statesData => {
        if (this.playerState == undefined) {
          this.playerState = this.data.getStateByName('idle', false);
        }
      });

    // REDUX - PLAYER MENU
    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA, 'openMenuPlayerId'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(playerId => {
        this.showMenu = this.id == playerId;
      });

    // REDUX - PLAYER With ball
    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA, 'withBallPlayerId'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(playerId => {
        if (this.playerState) {
          this.playerState.withBall = this.id == playerId;
        }
      });

    // REDUX - PASS waiting for target
    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA, 'passSourcePlayerId'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(playerId => {
        if (playerId != '') {
          this.isPassWaitingForTarget = true;
        }
      });

    // REDUX - PASS on target selected
    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA, 'passTargetPlayerId'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(playerId => {
        if (playerId != '') {
          this.isPassWaitingForTarget = false;
          if (this.passSourceId == playerId) {
            this.playerState = this.data.getStateByName('pass', true);
          }
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }


  // ------ DATA CONNECTION ------
  // private updatePlayerState(e){
  //   this.playerState = e;
  // }


  public updatePlayerData() {
    if (this.fieldProps) {
      this.lastX = this.x = this.percentX * this.transformationData.transFieldDim.clientWidth / 100 -
        this.transformationData.halfIconSpaceDim.clientWidth;
      this.lastY = this.y = this.percentY * this.transformationData.transFieldDim.clientHeight / 100 -
        this.transformationData.halfIconSpaceDim.clientHeight;
    }
  }

  public computeCurrentPercentagePosition() {
    if (this.fieldProps) {
      this.percentX = (this.x + this.transformationData.halfIconSpaceDim.clientWidth) /
        this.transformationData.transFieldDim.clientWidth * 100;
      this.percentY = (this.y + this.transformationData.halfIconSpaceDim.clientHeight) /
        this.transformationData.transFieldDim.clientHeight * 100;
    }
  }

  public computeCenterFieldPositionFromPercentageData(aPercentagePoint: Point): Point {
    const retPoint = new Point(0, 0);
    if (aPercentagePoint && this.fieldProps) {
      retPoint.x = aPercentagePoint.x * this.transformationData.transFieldDim.clientWidth / 100 +
        this.transformationData.halfActualIconDim.clientWidth;
      retPoint.y = aPercentagePoint.y * this.transformationData.transFieldDim.clientHeight / 100 +
        this.transformationData.halfActualIconDim.clientHeight;
    }
    return retPoint;
  }


  private computeScaleAndTransformation() {
    if (this.fieldProps) {
      const clientWidth = this.fieldProps.dimensions.clientWidth;
      if (clientWidth > 1000) {
        this.scale = 0.6;
      } else if (clientWidth > 800) {
        this.scale = 0.5;
      } else {
        this.scale = 0.4;
      }
    }

    this.transformationData.actualIconDim.clientWidth = this.selfDimensions.clientWidth * this.scale;
    this.transformationData.actualIconDim.clientHeight = this.selfDimensions.clientHeight * this.scale;

    this.transformationData.iconSpaceDim.clientWidth = this.selfDimensions.clientWidth -
      this.transformationData.actualIconDim.clientWidth;
    this.transformationData.iconSpaceDim.clientHeight = this.selfDimensions.clientHeight -
      this.transformationData.actualIconDim.clientHeight;

    this.transformationData.transFieldDim.clientWidth = this.fieldProps.dimensions.clientWidth -
      this.transformationData.actualIconDim.clientWidth;
    this.transformationData.transFieldDim.clientHeight = this.fieldProps.dimensions.clientHeight -
      this.transformationData.actualIconDim.clientHeight;

    this.transformationData.halfActualIconDim.clientWidth = this.transformationData.actualIconDim.clientWidth / 2;
    this.transformationData.halfActualIconDim.clientHeight = this.transformationData.actualIconDim.clientHeight / 2;

    this.transformationData.halfIconSpaceDim.clientWidth = this.transformationData.iconSpaceDim.clientWidth / 2;
    this.transformationData.halfIconSpaceDim.clientHeight = this.transformationData.iconSpaceDim.clientHeight / 2;

  }

  public getBounding() {
    return this.playerElement.nativeElement.getBoundingClientRect();
  }


  // ------ PLAYER EVENTS ------

  onPress(e) {
    //console.log(e.type)
  }

  onPressUp(e) {
    //console.log(e.type)
  }


  onPanStart(e) {
    this.zIndex = 2;
  }

  onPanMove(e) {
    this.updateTransform(e.deltaX, e.deltaY);
  }

  onPanEnd(e) {
    this.updateTransform(e.deltaX, e.deltaY);

    this.lastX = this.x;
    this.lastY = this.y;

    this.zIndex = 1;
  }


  // Update player position and playerRotation
  updateTransform(deltaX: number, deltaY: number) {
    if (this.isPassWaitingForTarget) {
      return;
    }

    this.showMenu = false;

    const newX = this.lastX + deltaX / this.fieldProps.dimensions.scale;
    const newY = this.lastY + deltaY / this.fieldProps.dimensions.scale;

    const clientWidth = this.selfDimensions.clientWidth;
    const widthScaled = clientWidth * this.scale;
    const maxX = this.fieldProps.dimensions.clientWidth - ((clientWidth - widthScaled) / 2 + widthScaled);
    const minX = (widthScaled - clientWidth) / 2;
    if (newX >= minX && newX <= maxX) {
      this.x = newX;
    } else if (newX <= minX) {
      this.x = minX;
    } else {
      this.x = maxX;
    }

    const clientHeight = this.selfDimensions.clientHeight;
    const heightScaled = clientHeight * this.scale;
    const maxY = this.fieldProps.dimensions.clientHeight - ((clientHeight - heightScaled) / 2 + heightScaled);
    const minY = (heightScaled - clientHeight) / 2;
    if (newY >= minY && newY <= maxY) {
      this.y = newY;
    } else if (newY <= minY) {
      this.y = minY;
    } else {
      this.y = maxY;
    }

    // playerRotation
    this.previousPositions.push({x: this.x, y: this.y});
    if (this.previousPositions.length > environment.playerPositionStepsBack) {
      this.previousPositions.splice(0, 1);
    }
    const dx = this.x - this.previousPositions[0].x;
    const dy = this.y - this.previousPositions[0].y;
    let theta = Math.atan2(dy, dx);
    theta *= 180 / Math.PI;
    this.playerRotation = theta + 90;
  }


  onTap(e) {
    if (this.isPassWaitingForTarget) {
      this.ngRedux.dispatch(passTargetSelected(this.id));
      this.ngRedux.dispatch(updatePlayerMenuState(''));
    } else {
      this.showMenu = !this.showMenu;
      if (this.showMenu) {
        this.ngRedux.dispatch(updatePlayerMenuState(this.id));
        this.zIndex = 2;
      } else {
        this.ngRedux.dispatch(updatePlayerMenuState(''));
        this.zIndex = 1;
      }
    }
  }


  // onPress(e){
  //   console.log(this.id,e.type)
  //   this.data.updatePlayersLock(true);
  //   this.bgColor = 'rgba(255,255,255,0.5)';
  // }

  // onPressUp(e){
  //   console.log(this.id,e.type)
  //   this.data.updatePlayersLock(false);
  //   this.bgColor = 'rgba(255,255,255,0)';
  // }


}
