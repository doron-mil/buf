import {Injectable, OnDestroy} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Observable, Subject} from 'rxjs';

import {FieldProps, ModeType} from '../dataModels/general.model';
import {ActionGenerator} from '../../store/actions/action';
import {StoreDataTypeEnum} from '../../store/storeDataTypeEnum';
import {set} from '../dataModels/dynamicData.model';
import {player, playerState} from '../dataModels/staticData.model';
import {takeUntil} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StoreService implements OnDestroy {

  private modeTypeChangeObservable: Observable<ModeType>;
  private fieldPropsChangeObservable: Observable<FieldProps>;

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>) {
    this.modeTypeChangeObservable =
      this.ngRedux.select<ModeType>([StoreDataTypeEnum.INNER_DATA, 'currentMode'])
        .pipe(takeUntil(this.onDestroy$));
    this.fieldPropsChangeObservable =
      this.ngRedux.select<FieldProps>([StoreDataTypeEnum.INNER_DATA, 'fieldsProps'])
        .pipe(takeUntil(this.onDestroy$));
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  getModeTypeChangeObservable(): Observable<ModeType> {
    return this.modeTypeChangeObservable;
  }

  getFieldPropsChangeObservable(): Observable<FieldProps> {
    return this.fieldPropsChangeObservable;
  }

  setMode(aMode: ModeType, aIsOn: boolean = true) {
    this.ngRedux.dispatch(ActionGenerator.setMode(aMode, aIsOn));
  }

  setPlayersData(aPlayers: player[]) {
    this.ngRedux.dispatch(ActionGenerator.setPlayersData(aPlayers));
  }

  setPlayersSetsData(aPlayerSets: set[]) {
    this.ngRedux.dispatch(ActionGenerator.setPlayersSetsData(aPlayerSets));
  }

  setStatesData(aPlayerStates: playerState[]) {
    this.ngRedux.dispatch(ActionGenerator.setStatesData(aPlayerStates));
  }

  updateFieldProps(aFieldProps: FieldProps) {
    this.ngRedux.dispatch(ActionGenerator.setFieldProps(aFieldProps));
  }
}
