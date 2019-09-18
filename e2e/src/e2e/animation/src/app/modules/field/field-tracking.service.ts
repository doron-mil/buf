import {Injectable, OnDestroy} from '@angular/core';

import {NgRedux} from '@angular-redux/store';

import {FieldPlayersComponent} from './field-players/field-players.component';
import {environment} from 'src/environments/environment';
import {DataService} from '../../shared/services/data.service';
import {StoreService} from '../../shared/services/store.service';
import {FieldProps, ModeType} from '../../shared/dataModels/general.model';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {PlayerFieldDataInterface} from '../../shared/dataModels/innerData.model';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FieldTrackingService implements OnDestroy {

  fieldPlayers: FieldPlayersComponent;
  fieldElement: any;

  fieldOriginalWidth: number;
  fieldOriginalHeight: number;

  renderCycle;
  cycleRequest;
  recentPayload = {};
  recentPlayers: { [key: string]: PlayerFieldDataInterface } = {};
  recentVelocities = {};
  recentField = {};
  fieldProps: FieldProps;

  isRecordAnimation = false;

  isAdminMode = false;

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>,
              private data: DataService,
              private storeService: StoreService) {

    this.storeService.getModeTypeChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((modeType: ModeType) => {
        this.isRecordAnimation = ModeType.RECORD_ANIMATION === modeType;
      });

    this.storeService.getFieldPropsChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((fieldProps: FieldProps) => {
        this.fieldProps = fieldProps;
      });

    this.ngRedux.select<boolean>([StoreDataTypeEnum.INNER_DATA, 'adminMode'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(isAdminMode => {
        this.isAdminMode = isAdminMode;
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  startFieldTracking(fieldPlayers: FieldPlayersComponent, fieldElement: any, fieldOriginalWidth: number, fieldOriginalHeight: number) {
    this.fieldPlayers = fieldPlayers;
    this.fieldElement = fieldElement;
    this.fieldOriginalWidth = fieldOriginalWidth;
    this.fieldOriginalHeight = fieldOriginalHeight;

    this.renderCycle = () => {
      this.cycleRequest = requestAnimationFrame(this.renderCycle);
      this.getDataToSend();
    };

    this.renderCycle();
  }

  stopFieldTracking() {
    cancelAnimationFrame(this.cycleRequest);
  }

  // ------ GET PLAYERS AND FIELD DATA ------
  getDataToSend() {

    // PLAYERS
    let playersPayload = {};
    let playerElements = this.fieldPlayers.playerElements;
    if (playerElements != undefined) {
      playerElements.forEach(player => {
        // Determine visibility
        let visibility = true;
        if (player.getBounding().left < 0 || player.getBounding().right > this.fieldOriginalWidth ||
          player.getBounding().top < 0 || player.getBounding().bottom > this.fieldOriginalHeight) {
          visibility = false;
        }

        // Position and Rotation
        player.computeCurrentPercentagePosition();
        let percentX = player.percentX;
        let percentY = player.percentY;
        if (percentY < 0) {
          percentY = 0;
        }
        if (percentY > 100) {
          percentY = 100;
        }
        if (percentX < 0) {
          percentX = 0;
        }
        if (percentX > 100) {
          percentX = 0;
        }

        // Velocity and State
        // let state = '-LlRAELPh7_HeKGUxH-E';
        let averageVelocity = 0;

        if (this.recentPlayers[player.id] !== undefined) {
          let localVelocity = 0;
          const dX = Math.abs(this.recentPlayers[player.id].posX - percentX);
          const dY = Math.abs(this.recentPlayers[player.id].posY - percentY);
          localVelocity = Math.max(dX, dY);

          if (this.recentVelocities[player.id] == undefined) {
            this.recentVelocities[player.id] = [localVelocity];
          } else {
            this.recentVelocities[player.id].push(localVelocity);
            if (this.recentVelocities[player.id].length > environment.playerVelocityStepsBack) {
              this.recentVelocities[player.id].splice(0, 1);
              this.recentVelocities[player.id].map(v => {
                averageVelocity += v;
              });
              averageVelocity = averageVelocity / environment.playerVelocityStepsBack;
            }
          }
        }


        if (averageVelocity > environment.minimumVelocityForState && player.playerState) {
          // Run
          player.playerState = this.data.getStateByName('run', player.playerState.withBall);
        } else if (player.playerState) {
          // Idle
          switch (player.playerState.name) {
            case 'kneel':
              player.playerState = this.data.getStateByName('kneel', player.playerState.withBall);
              console.log(player.playerState.id);
              break;
            default:
              player.playerState = player.playerState = this.data.getStateByName('idle', player.playerState.withBall);
          }

          //
        }
        const tempPlayerData: PlayerFieldDataInterface = {
          posX: percentX,
          posY: percentY,
          rotation: player.playerRotation,
          visible: visibility,
          state: player.playerState ? player.playerState.id : '',
          //  "passTarget":passTarget
        };


        if (this.isRecordAnimation) {
          this.data.recordAnimationData(0, 0, player.id, percentX, percentY, player.playerRotation, '');
        }

        // if (JSON.stringify(this.recentPlayers[player.id])!=JSON.stringify(tempPlayerData)){
        playersPayload[player.id] = tempPlayerData;
        // }
        playersPayload[player.id] = tempPlayerData;
        this.recentPlayers[player.id] = tempPlayerData;
      });
    }

    this.recentPayload = playersPayload;
    // }

    // FIELD
    const fieldRect = this.fieldElement.nativeElement.getBoundingClientRect();
    // console.log(fieldRect);
    // console.log(this.fieldX)
    const fieldPayload = {};
    // fieldPayload["posX"] = this.fieldX;
    // fieldPayload["posY"] = this.fieldY;
    // fieldPayload["rotation"] = 0;
    // fieldPayload["scale"] = this.scale;
    if (JSON.stringify(fieldPayload) !== JSON.stringify(this.recentField)) {
       this.recentField = fieldPayload;
    }
  }

}
