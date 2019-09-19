import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireDatabase, AngularFireList} from '@angular/fire/database';
import {merge, Subject} from 'rxjs';
import {filter, take, takeUntil} from 'rxjs/operators';

import {NgRedux} from '@angular-redux/store';

import {AngularJsonClassConverterService} from 'angular-json-class-converter';
import {AuthService} from '../auth/services/auth.service';
import {player, team} from '../../../shared/dataModels/staticData.model';
import {ActionGenerator} from '../../../store/actions/action';
import {set} from '../../../shared/dataModels/dynamicData.model';
import {LoggedInInterface} from '../shared/dataModels/auth.model';


const TEAMS_TABLE_NAME = 'footballTeams';
const PLAYERS_TABLE_NAME = 'footballPlayers';
const SETS_TABLE_NAME = 'footballSets';

@Injectable({
  providedIn: 'root'
})
export class DataService implements OnDestroy {
  private itemsRefOMaps: { [key: string]: AngularFireList<any> } = {};

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>,
              private db: AngularFireDatabase,
              private authService: AuthService,
              private jsonConverterService: AngularJsonClassConverterService) {

    this.authService.isLoggedIn.pipe(takeUntil(this.onDestroy$)).subscribe((subscriptionObj: LoggedInInterface) => {
      if (subscriptionObj.isLogged) {
        this.retrieveData();
      }
    });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  private retrieveData() {
    const untilObservable = merge(this.onDestroy$, this.authService.isLoggedIn
      .pipe(filter((subscriptionObj: LoggedInInterface) => !subscriptionObj.isLogged)));

    // Retrieving teams
    this.db.list(TEAMS_TABLE_NAME).valueChanges()
      .pipe(takeUntil(untilObservable))
      .subscribe((teams) => {
        const convertedTeams = this.jsonConverterService.convert<team>(teams, 'team');
        this.ngRedux.dispatch(ActionGenerator.setTeamsData(convertedTeams));
      });

    // Retrieving players
    this.db.list(PLAYERS_TABLE_NAME).valueChanges()
      .pipe(takeUntil(untilObservable))
      .subscribe((jasonPlayers) => {
        const players = this.jsonConverterService.convert<player>(jasonPlayers, 'player');
        this.ngRedux.dispatch(ActionGenerator.setAllPlayersData(players));

        const playersTeamMap = players.reduce((prevObject, playerValue) => {
          const playerArray = prevObject[playerValue.teamId] ? prevObject[playerValue.teamId] :
            prevObject[playerValue.teamId] = new Array<player>();
          playerArray.push(playerValue);
          return prevObject;
        }, {});

        this.ngRedux.dispatch(ActionGenerator.setPlayersTeamsData(playersTeamMap));
      });

    // Retrieving sets
    this.itemsRefOMaps[SETS_TABLE_NAME] = this.db.list(SETS_TABLE_NAME);
    this.itemsRefOMaps[SETS_TABLE_NAME].valueChanges()
      .pipe(takeUntil(untilObservable))
      .subscribe((jsonSets) => {
        const convertedSets = this.jsonConverterService.convert<set>(jsonSets, 'set');

        // If need to fix data from db
        convertedSets.forEach(setObject => {
          if (setObject.players && !(setObject.players instanceof Array)) { // in case the data is not saved as an array

            setObject.players = [];
          }
        });

        this.ngRedux.dispatch(ActionGenerator.setPlayersSetsData(convertedSets));
      });
  }

  updateReduxFromDbForSet(aSetId: string) {
    const snapshotChanges = this.db.object(`${SETS_TABLE_NAME}/${aSetId}`).valueChanges();
    snapshotChanges.pipe(take(1)).subscribe((jsonSet) => {
      const convertedSet = this.jsonConverterService.convertOneObject<set>(jsonSet, 'set');
      this.ngRedux.dispatch(ActionGenerator.playersSetUpdate(convertedSet));
    });
  }

  createNewSet(aNewSet: set): Promise<set> {
    return new Promise<set>((resolve, reject) => {
      this.itemsRefOMaps[SETS_TABLE_NAME].push(aNewSet)
        .then(fbRef => {
          this.updateSet(aNewSet, fbRef.key).then(() => resolve(aNewSet))
            .catch((updateError) => reject(updateError));
        })
        .catch((err) => reject(err));
    });
  }

  updateSet(aSet2Update: set, aKey?: string): Promise<void> {
    const key = aKey ? (aSet2Update.id = aKey) : aSet2Update.id;
    return this.itemsRefOMaps[SETS_TABLE_NAME].update(key, aSet2Update);
  }

  deleteSet(aSet2Delete: set): Promise<void> {
    return this.itemsRefOMaps[SETS_TABLE_NAME].remove(aSet2Delete.id);
  }

}
