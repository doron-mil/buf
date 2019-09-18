import {
  ActionTypesEnum,
  AppAction,
  LOAD_STORE_DATA,
  PLAYERS_SET_UPDATE,
  SET_PLAYERS_SETS_DATA,
  SET_STATES_DATA
} from '../actions/action';
import {DynamicDataState, INITIAL_DYNAMIC_DATA_STATE} from '../states/dynamic.data.state';
import {set, SetPlayer} from '../../shared/dataModels/dynamicData.model';
import {UpdatedStepForSet} from '../../shared/dataModels/innerData.model';
import {StoreDataTypeEnum} from '../storeDataTypeEnum';

function removeSetFromListById(aPlayersSetsArray: Array<set>, aSetId2Remove: string) {
  const foundIndex = aPlayersSetsArray.findIndex((setItem) => setItem.id === aSetId2Remove);
  if (foundIndex >= 0) {
    aPlayersSetsArray.splice(foundIndex, 1);
  }
}

export function dynamicDataReducer(state: DynamicDataState = INITIAL_DYNAMIC_DATA_STATE,
                                   action: AppAction): any {

  switch (action.type) {
    case LOAD_STORE_DATA:
      state = action.payload[StoreDataTypeEnum.DYNAMIC_DATA];
      return state;
    case SET_PLAYERS_SETS_DATA:
      state.playersSets = [...action.payload];
      return Object.assign({}, state);
    // case SET_PLAYERS_DATA:
    //   // state.players = [...action.payload];
    //   return Object.assign({}, state);
    case SET_STATES_DATA:
      state.states = [...action.payload];
      return Object.assign({}, state);
    case ActionTypesEnum.UPDATE_ANIMATION_STEP_DATA:
      const setWithUpdatedStep = action.payload as UpdatedStepForSet;
      const setToModify = state.playersSets.find(setItem => setItem.id === setWithUpdatedStep.setId);

      setToModify.players.forEach((player: SetPlayer) => {
        if (setWithUpdatedStep.isUpdate) {
          player.animation[setWithUpdatedStep.step - 1] = setWithUpdatedStep.stepAnimationsMap[player.id];
          player.animation = [...player.animation];
        } else {
          player.animation.push(setWithUpdatedStep.stepAnimationsMap[player.id]);
        }
      });
      return state;
    case PLAYERS_SET_UPDATE:
      const setToUpdate = action.payload as set;
      removeSetFromListById(state.playersSets, setToUpdate.id);
      state.playersSets.push(setToUpdate);
      state.playersSets = [...state.playersSets];

      return state;
    case ActionTypesEnum.PLAYERS_SET_REMOVE:
      const setId2Remove = action.payload as string;
      removeSetFromListById(state.playersSets, setId2Remove);
      state.playersSets = [...state.playersSets];

      return state;
    default:
      return state;
  }
}
