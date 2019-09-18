import {MatSelectChange, MatSelectionListChange} from '@angular/material';
import {FormControl} from '@angular/forms';
import {NgRedux} from '@angular-redux/store';
import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';

import {player, team} from '../../../../shared/dataModels/staticData.model';
import {StoreDataTypeEnum} from '../../../../store/storeDataTypeEnum';
import {StaticDataState} from '../../../../store/states/static.data.state';
import {TeamSetProps} from '../../shared/dataModels/admin.model';

interface KitData {
  value: string;
  label: string;
  kitId: string;
}

@Component({
  selector: 'app-team-list',
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit, OnChanges {

  @Input()
  teams: team[];

  @Input()
  otherTeamProps: TeamSetProps;

  @Input()
  selectedTeamProps: TeamSetProps;

  @Input()
  isLeft: boolean;

  @Output() teamChange = new EventEmitter<team>();
  @Output() playerStateChange = new EventEmitter<player>();
  @Output() teamKitChange = new EventEmitter<string>();

  selectedTeam: team;
  selectedKit: KitData;
  kitHomeData: KitData = {value: 'H', label: ' Home', kitId: ''};
  kitAwayData: KitData = {value: 'A', label: ' Away', kitId: ''};

  teamPlayers: player[];

  constructor(private ngRedux: NgRedux<any>) {
  }

  ngOnInit() {
  }

  onTeamSelectionChange(aEvent: MatSelectChange) {
    this.refreshList();
    this.teamChange.emit(this.selectedTeam);
    this.resetSelectedKit();
  }

  onTeamKitSelectionChange(aEvent: MatSelectChange) {
    this.onSelectedKitChanged();
  }

  onPlayersSelectionChange(aEvent: MatSelectionListChange) {
    this.playerStateChange.emit(aEvent.option.value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.selectedTeamProps) {
      this.selectedTeam = this.selectedTeamProps.selectedTeam;
      this.refreshList();
    }
  }

  private refreshList() {

    if (this.selectedTeam) {
      const staticDataState = this.ngRedux.getState()[StoreDataTypeEnum.STATIC_DATA] as StaticDataState;
      this.teamPlayers = staticDataState.playersTeamMap[this.selectedTeam.id];
      this.kitHomeData.kitId = this.selectedTeam.kitHomeId;
      this.kitAwayData.kitId = this.selectedTeam.kitAwayId;
      this.selectedKit = (this.selectedTeamProps.selectedKitId === this.kitHomeData.kitId) ? this.kitHomeData :
        this.kitAwayData;
    } else {
      this.teamPlayers = [];
      this.kitHomeData.kitId = '';
      this.kitAwayData.kitId = '';
      this.selectedKit = null;
    }
  }

  private resetSelectedKit() {
    if (this.selectedTeam) {
      const otherTeamHomeKitId = this.otherTeamProps.selectedTeam ? this.otherTeamProps.selectedTeam.kitHomeId : '';
      const isOtherTeamSelectedHomeKit = this.otherTeamProps.selectedKitId === otherTeamHomeKitId;
      this.selectedKit = isOtherTeamSelectedHomeKit ? this.kitAwayData : this.kitHomeData;

      this.onSelectedKitChanged();
    }
  }

  private onSelectedKitChanged() {
    this.selectedTeamProps.selectedKitId = this.selectedKit.kitId;
    this.teamKitChange.emit(this.selectedKit.kitId);
  }
}
