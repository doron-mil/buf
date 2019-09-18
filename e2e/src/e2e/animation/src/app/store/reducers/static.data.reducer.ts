import {
  AppAction,
  LOAD_STORE_DATA,
  SET_ALL_PLAYERS_DATA,
  SET_PLAYERS_DATA,
  SET_PLAYERS_TEAMS_DATA,
  SET_TEAMS_DATA
} from '../actions/action';
import {INITIAL_STATIC_DATA_STATE, StaticDataState} from '../states/static.data.state';
import {StoreDataTypeEnum} from '../storeDataTypeEnum';

export function staticDataReducer(state: StaticDataState = INITIAL_STATIC_DATA_STATE,
                                  action: AppAction): any {

  let retState;

  switch (action.type) {
    case LOAD_STORE_DATA:
      state = action.payload[StoreDataTypeEnum.STATIC_DATA];
      retState = state;
      break;
    case SET_TEAMS_DATA:
      state.teams = action.payload;
      retState = state;
      break;
    case SET_PLAYERS_DATA:
    case SET_ALL_PLAYERS_DATA:
      state.players = action.payload;
      retState = state;
      break;
    case SET_PLAYERS_TEAMS_DATA:
      state.playersTeamMap = action.payload;
      retState = state;
      break;
    default:
      retState = state;
  }

  return retState;
}

