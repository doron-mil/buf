import {player, team} from '../../../../shared/dataModels/staticData.model';

export class TeamSetProps {
  selectedTeam: team;
  playersObjectMap: { [key: string]: player } = {};
  selectedKitId: string;
  placedPlayersArray: string[] = [];
  isLocked = false;

  getSelectedTeamId = () => this.selectedTeam ? this.selectedTeam.id : '';
}
