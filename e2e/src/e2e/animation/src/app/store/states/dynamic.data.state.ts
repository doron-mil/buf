import {player, playerState} from '../../shared/dataModels/staticData.model';
import {set} from '../../shared/dataModels/dynamicData.model';

export interface DynamicDataState {
  playersSets: set[];
  players: player[];
  states: playerState[];
}


export const INITIAL_DYNAMIC_DATA_STATE: DynamicDataState = {
  playersSets: [],
  players: [],
  states: [],
};
