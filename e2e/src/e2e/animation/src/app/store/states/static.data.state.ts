import {player, team} from '../../shared/dataModels/staticData.model';

export interface StaticDataState {
  teams: team[];
  players: player[];
  playersTeamMap: { [key: string]: player[] } ; // By teamId
}

export const INITIAL_STATIC_DATA_STATE: StaticDataState = {
  teams: [],
  players: [],
  playersTeamMap: {},
};
