import {MatDialog, MatSelectChange} from '@angular/material';
import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import * as _ from 'lodash';

import {NgRedux} from '@angular-redux/store';

import {player, team} from '../../../../shared/dataModels/staticData.model';
import {DataService} from '../../services/data.service';
import {StoreDataTypeEnum} from '../../../../store/storeDataTypeEnum';
import {
  PathKeyframeData,
  playerExtraData,
  PlayerStepAnimation,
  set,
  SetPlayer
} from '../../../../shared/dataModels/dynamicData.model';
import {TeamSetProps} from '../../shared/dataModels/admin.model';
import {ActionGenerator} from '../../../../store/actions/action';
import {EditSetNameDialogComponent} from '../../dialogs/edit-set-name-dialog/edit-set-name-dialog.component';
import {StaticDataState} from '../../../../store/states/static.data.state';
import {AnimationControlData, PlayerFieldDataInterface} from '../../../../shared/dataModels/innerData.model';
import {FieldTrackingService} from '../../../field/field-tracking.service';
import {MessagesService} from '../../services/messages.service';

const NEW_SET_TMP_ID = 'NEW_SET_TMP_ID';

const PLAYER_EXTRA_DATA_PROPERTY = 'playerExtraData';


@Component({
  selector: 'app-set-builder',
  templateUrl: './set-builder.component.html',
  styleUrls: ['./set-builder.component.scss']
})
export class SetBuilderComponent implements OnInit, OnDestroy {

  teams: team[];

  setsArray: set[];

  selectedSetId: string;
  selectedSet: set;
  lastSelectedSet: set;

  leftTeamProps: TeamSetProps;
  rightTeamProps: TeamSetProps;

  private needsSaving = false;

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>,
              private dataService: DataService,
              private fieldTrackingService: FieldTrackingService,
              private dialog: MatDialog,
              private messagesService: MessagesService,
              private router: Router) {
    this.ngRedux.dispatch(ActionGenerator.setAdminMode());

    this.leftTeamProps = new TeamSetProps();
    this.rightTeamProps = new TeamSetProps();
  }

  ngOnInit() {
    this.subscribeToActions();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  private subscribeToActions() {
    this.ngRedux.select<team[]>([StoreDataTypeEnum.STATIC_DATA, 'teams'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((aTeamsArray: team[]) => {
        this.teams = aTeamsArray;
      });

    this.ngRedux.select<set[]>([StoreDataTypeEnum.DYNAMIC_DATA, 'playersSets'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((aSetsArray: set[]) => {
        this.setsArray = aSetsArray.sort((a: set, b: set) => (a.name > b.name) ? 1 : -1)
          .map(setObj => Object.assign(new set(), setObj));
        if (this.selectedSet) {
          this.selectedSet = this.setsArray.find(setObj => setObj.id === this.selectedSet.id);
        }
      });

    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA, 'selectedSetId'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((selectedSetId: string) => {
        this.selectedSetId = selectedSetId;
        this.loadSelectedSet();
      });

    this.ngRedux.select<boolean>([StoreDataTypeEnum.INNER_DATA, 'animationControlData', 'isDirty'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((isDirty: boolean) => {
        this.needsSaving = isDirty;
      });
  }


  private fillTeamsPropsData() {
    const newLeftTeamSetProps = new TeamSetProps();
    const newRightTeamSetProps = new TeamSetProps();

    if (this.selectedSet) {
      const staticDataState = this.ngRedux.getState()[StoreDataTypeEnum.STATIC_DATA] as StaticDataState;

      const leftTeamPlayersArray: player[] = staticDataState.playersTeamMap[this.selectedSet.leftTeamId];
      const rightTeamPlayersArray: player[] = staticDataState.playersTeamMap[this.selectedSet.rightTeamId];

      newLeftTeamSetProps.selectedTeam = this.teams.find(teamObject => teamObject.id === this.selectedSet.leftTeamId);
      newRightTeamSetProps.selectedTeam = this.teams.find(teamObject => teamObject.id === this.selectedSet.rightTeamId);

      this.selectedSet.players.forEach((setPlayerObj, index) => {
        const foundLeftPlayer = leftTeamPlayersArray.find(playerObj => playerObj.id === setPlayerObj.id);

        const matchedProps = foundLeftPlayer ? newLeftTeamSetProps : newRightTeamSetProps;

        matchedProps.playersObjectMap[setPlayerObj.id] = foundLeftPlayer ? foundLeftPlayer :
          rightTeamPlayersArray.find(playerObj => playerObj.id === setPlayerObj.id);
        matchedProps.placedPlayersArray.push(setPlayerObj.id);

        if (!matchedProps.selectedKitId && setPlayerObj.kitId) {
          matchedProps.selectedKitId = setPlayerObj.kitId;
        }

        if (index === 0 && setPlayerObj.animation && setPlayerObj.animation.length > 0 &&
          setPlayerObj.animation[0].paperPath) {
          newLeftTeamSetProps.isLocked = true;
          newRightTeamSetProps.isLocked = true;
        }
      });
    }
    this.leftTeamProps = newLeftTeamSetProps;
    this.rightTeamProps = newRightTeamSetProps;
  }

  onSetSelectionChange(aMatSelectChangeEvent: MatSelectChange) {
    this.checkUserForDismissChanges().then((isDismissUnsavedData: boolean) => {
      if (isDismissUnsavedData) {
        if (this.needsSaving && this.lastSelectedSet && this.lastSelectedSet.id) {
          this.reloadSetFromDb(this.lastSelectedSet.id);
          this.needsSaving = false;
        }
        this.loadSelectedSet();

        this.ngRedux.dispatch(ActionGenerator.playersSetSelected(this.selectedSet.id));
      } else {
        this.selectedSetId = this.lastSelectedSet.id;
      }
    });
  }

  private reloadSetFromDb(aSetId: string) {
    if (aSetId === NEW_SET_TMP_ID) {
      this.ngRedux.dispatch(ActionGenerator.playersSetRemove(NEW_SET_TMP_ID));
      this.needsSaving = false;
    } else {
      this.dataService.updateReduxFromDbForSet(aSetId);
    }
  }

  private loadSelectedSet() {
    // Making sure we work on a different data then the Redux
    this.lastSelectedSet = this.setsArray.find(setObj => setObj.id === this.selectedSetId);
    this.selectedSet = this.cloneSetObject(this.lastSelectedSet);

    this.fillTeamsPropsData();
  }

  private cloneSetObject(aSet: set): set {
    let retSetObj;
    if (aSet) {
      retSetObj = Object.assign(new set(), aSet);
      if (aSet.players) {
        retSetObj.players = [...aSet.players];
      }
    }
    return retSetObj;
  }

  private checkUserForDismissChanges(): Promise<boolean> {
    let needSavingPromise = Promise.resolve(true);
    if (this.needsSaving) {
      needSavingPromise = new Promise(resolve => {
        const retSnackBar = this.messagesService.openMessage(
          `There are unsaved changes in ${this.selectedSet.name} set.` +
          `<BR>Do you still wish leave the set and dismiss the changes?`,
          'Dismiss',
          'Cancel');
        retSnackBar.then((messageRetResult) => {
          resolve(messageRetResult);
        });
      });
    }
    return needSavingPromise;
  }

  addSetOpenDialog() {
    const needSavingPromise = this.checkUserForDismissChanges();

    needSavingPromise.then((isDismissUnsavedData: boolean) => {
      if (isDismissUnsavedData) {
        const setsNamesArray = this.setsArray.map(setObject => setObject.name);
        const dialogRef = this.dialog.open(EditSetNameDialogComponent, {
          position: {top: '25vh', left: '25vw'},
          height: '30vh',
          width: '50vw',
          data: {setsNamesArray, currentName: null},
        });

        dialogRef.afterClosed().subscribe((aNewSetName: string) => {
          if (aNewSetName) {
            if (this.needsSaving && this.lastSelectedSet && this.lastSelectedSet.id) {
              this.reloadSetFromDb(this.lastSelectedSet.id);
            }
            this.addSet(aNewSetName);
          }
        });
      }
    });
  }

  goAnimationEdit() {
    this.syncPlayersLocationIfNeeded();
    if (this.needsSaving) {
      this.ngRedux.dispatch(ActionGenerator.markCurrentSetAsDirty());
    }
    this.router.navigate(['recording']);
  }

  saveSet() {
    this.syncPlayersLocationIfNeeded();

    let savePromise;
    if (this.selectedSet.id === NEW_SET_TMP_ID) {
      savePromise = this.dataService.createNewSet(this.selectedSet);
      savePromise.then((createdSet: set) => this.ngRedux.dispatch(ActionGenerator.playersSetSelected(createdSet.id)));
    } else {
      savePromise = this.dataService.updateSet(this.selectedSet);
    }

    this.needsSaving = false;
    this.ngRedux.dispatch(ActionGenerator.markCurrentSetAsDirty(false));
  }

  deleteSet() {
    const retSnackBar = this.messagesService.openMessage(
      `Are you sure you want to delete ${this.selectedSet.name} set.`,
      'Delete',
      'Cancel');
    retSnackBar.then((messageRetResult) => {
      if (messageRetResult) {
        this.dataService.deleteSet(this.selectedSet);
      }
    });
  }

  /**
   * Saving players position only if animation was not recorded even once
   */
  private syncPlayersLocationIfNeeded() {
    if (this.selectedSet && this.selectedSet.players && this.selectedSet.players.length > 0) {
      const animation = this.selectedSet.players[0].animation;
      if (!animation || animation.length <= 0 || !animation[0].paperPath || animation[0].paperPath === '') {
        this.selectedSet.players.forEach(setPlayerObj => {
          const recentPlayerFieldData: PlayerFieldDataInterface = this.fieldTrackingService.recentPlayers[setPlayerObj.id];
          if (recentPlayerFieldData) {
            setPlayerObj.animation = [];
            const newPath: PathKeyframeData[] = [];
            newPath.push(new PathKeyframeData(recentPlayerFieldData.posX, recentPlayerFieldData.posY,
              recentPlayerFieldData.rotation, null));
            const playerStepAnimation = new PlayerStepAnimation(null, null, newPath);
            setPlayerObj.animation.push(playerStepAnimation);
          }
        });


      }
    }
  }

  private addSet(aNewSetName: string) {
    const newSet = new set();
    newSet.id = NEW_SET_TMP_ID;
    newSet.name = aNewSetName;
    newSet.players = [];

    this.selectedSet = newSet;
    this.leftTeamProps = new TeamSetProps();
    this.rightTeamProps = new TeamSetProps();

    this.needsSaving = true;

    this.ngRedux.dispatch(ActionGenerator.addNewPlayersSet(newSet));

  }

  onTeamChanged(aNewSelectedLeftTeam: team, aIsLeft: boolean = true) {
    const matchedProps = this.getMatchingProps(aIsLeft);
    matchedProps.selectedTeam = aNewSelectedLeftTeam;

    let keys: Array<string>;
    if (this.selectedSet.players && this.selectedSet.players.length > 0 &&
      matchedProps.playersObjectMap && (keys = _.keys(matchedProps.playersObjectMap)).length > 0) {
      _.remove(this.selectedSet.players, setPlayerObj => keys.some(key => setPlayerObj.id === key));
    }

    matchedProps.playersObjectMap = {};
    matchedProps.placedPlayersArray = [];

    const teamIdClause = aIsLeft ? {leftTeamId: aNewSelectedLeftTeam.id} : {rightTeamId: aNewSelectedLeftTeam.id};
    this.selectedSet = Object.assign(this.selectedSet, teamIdClause);

    this.updateSelectedSet();
  }

  onTeamKitChanged(aNewSelectedLeftTeamKit: string, aIsLeft: boolean = true) {
    const matchedProps = this.getMatchingProps(aIsLeft);
    const matchedPlayersObjectMap = matchedProps.playersObjectMap;

    this.selectedSet.players.forEach((setPlayer: SetPlayer) => {
      if (matchedPlayersObjectMap[setPlayer.id]) {
        setPlayer.kitId = aNewSelectedLeftTeamKit;
      }
    });
    this.updateSelectedSet();
  }

  onPlayerAddedOrRemoved(aSelectedUnselectedPlayer: player, aIsLeft: boolean = true) {
    const foundPlayerIndex = this.selectedSet.players.findIndex((playerObj) =>
      playerObj.id === aSelectedUnselectedPlayer.id);
    const initialPlayersCount = this.selectedSet.players.length;
    if (foundPlayerIndex >= 0) {
      this.deleteSetPlayer(aSelectedUnselectedPlayer, foundPlayerIndex, aIsLeft);
    } else {
      this.addNewSetPlayer(aSelectedUnselectedPlayer, aIsLeft);
    }
    this.updateSelectedSet();
    if (initialPlayersCount === 0 && this.selectedSet.players.length > 0) {
      this.ngRedux.dispatch(
        ActionGenerator.setAnimationControlData(new AnimationControlData(1, 1)));
    }
  }

  private deleteSetPlayer(aUnselectedPlayer: player, aPlayerIndexOnSet: number, aIsLeft: boolean) {
    this.selectedSet.players.splice(aPlayerIndexOnSet, 1);
    const placedPlayersArray = this.getMatchingPlacedPlayersArray(aIsLeft);
    const foundIndex = placedPlayersArray.findIndex((indexItem) => indexItem === aUnselectedPlayer.id);
    if (foundIndex >= 0) {
      placedPlayersArray[foundIndex] = null;
    }

    const matchedProps = this.getMatchingProps(aIsLeft);
    delete matchedProps.playersObjectMap[aUnselectedPlayer.id];
  }

  private addNewSetPlayer(aSelectedUnselectedPlayer: player, aIsLeft: boolean): SetPlayer {
    const matchedProps = this.getMatchingProps(aIsLeft);
    const positionIndex = this.computePositionIndexForNewPlayer(aSelectedUnselectedPlayer, aIsLeft);
    const animationObj = this.computeStartingAnimationForNewPlayer(positionIndex, aIsLeft);
    const newSetPlayer = new SetPlayer(aSelectedUnselectedPlayer.id, this.leftTeamProps.selectedKitId, animationObj);
    if (matchedProps.selectedKitId) {
      newSetPlayer.kitId = matchedProps.selectedKitId;
    }
    const extraData = new playerExtraData(aSelectedUnselectedPlayer.jerseyName,
      aSelectedUnselectedPlayer.number, '');
    newSetPlayer[PLAYER_EXTRA_DATA_PROPERTY] = extraData;

    this.selectedSet.players.push(newSetPlayer);

    matchedProps.playersObjectMap[aSelectedUnselectedPlayer.id] = aSelectedUnselectedPlayer;

    return newSetPlayer;
  }

  private computePositionIndexForNewPlayer(aSelectedPlayer: player, aIsLeft: boolean): number {
    const placedPlayersArray = this.getMatchingPlacedPlayersArray(aIsLeft);
    let foundIndex = placedPlayersArray.findIndex((indexItem) => !indexItem);
    if (foundIndex >= 0) {
      placedPlayersArray[foundIndex] = aSelectedPlayer.id;
    } else {
      placedPlayersArray.push(aSelectedPlayer.id);
      foundIndex = placedPlayersArray.length - 1;
    }
    return foundIndex;
  }

  private getMatchingPlacedPlayersArray(aIsLeft: boolean): string[] {
    const matchedPlacedPlayersArray = this.getMatchingProps(aIsLeft).placedPlayersArray;
    return matchedPlacedPlayersArray;
  }

  private getMatchingProps(aIsLeft: boolean): TeamSetProps {
    return aIsLeft ? this.leftTeamProps : this.rightTeamProps;
  }

  private computeStartingAnimationForNewPlayer(aPositionIndex: number, aIsLeft: boolean): PlayerStepAnimation[] {
    const animation = new Array<PlayerStepAnimation>();
    const x = (aIsLeft ? 45 : 55) + Math.floor(aPositionIndex / 5) * 8 * (aIsLeft ? -1 : 1);
    const y = 15 + (aPositionIndex % 5) * 10;
    const initialPoint = new PathKeyframeData(x, y, 0, null);
    const initialStep = new PlayerStepAnimation(null, null, [initialPoint]);
    animation[0] = initialStep;
    return animation;
  }

  private updateSelectedSet(aIsDirty: boolean = true) {
    this.needsSaving = aIsDirty;
    this.ngRedux.dispatch(ActionGenerator.playersSetUpdate(this.selectedSet));
  }

  logout() {
    this.router.navigate(['logout']);
  }

  /**
   * OBSOLETE
   * @param aSelectedSetId
   * @param aIteration
   */
  private setSelectedSet(aSelectedSetId: string, aIteration: number) {
    if (this.setsArray) {
      this.selectedSet = this.setsArray.find((setObject) => setObject.id === aSelectedSetId);
      this.fillTeamsPropsData();
    } else if (aIteration < 20) {
      setTimeout(this.setSelectedSet.bind(this)(), 100, aSelectedSetId, aIteration + 1);
    } else {
      console.error(`SetBuilderComponent.setSelectedSet failed with selectedID = ${aSelectedSetId}`);
    }
  }
}
