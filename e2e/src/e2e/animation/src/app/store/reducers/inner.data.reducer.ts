import {INITIAL_INNER_DATA_STATE, InnerDataState} from '../states/inner.data.state';
import {
  ActionTypesEnum,
  AppAction,
  LOAD_STORE_DATA,
  PASS_TARGET_SELECTED,
  PASS_WAINTING_FOR_TARGET_SELECT,
  PLAYERS_SET_SELECTED,
  SET_ADMIN_MODE,
  SET_ANIMATION_CONTROL_DATA,
  SET_ANIMATION_SPEED,
  SET_ANIMATION_STEP,
  SET_MODE,
  UPDATE_PLAYER_MENU_STATE,
  UPDATE_PLAYER_WITH_BALL
} from '../actions/action';
import {ModeType} from '../../shared/dataModels/general.model';
import {StoreDataTypeEnum} from '../storeDataTypeEnum';
import {DrawingParameters} from '../../shared/dataModels/innerData.model';

export function innerReducer(state: InnerDataState = INITIAL_INNER_DATA_STATE,
                             action: AppAction): any {

  switch (action.type) {
    case LOAD_STORE_DATA:
      state = action.payload[StoreDataTypeEnum.INNER_DATA];
      return state;
    case SET_MODE :
      const {modeType, isOn} = action.payload;
      state.currentMode = isOn ? modeType : ((modeType === state.currentMode) ? ModeType.NONE : state.currentMode);
      return Object.assign({}, state);
      break;
    case ActionTypesEnum.SET_DRAWING_ACTION :
      const drawingParameters = action.payload as DrawingParameters;
      if (drawingParameters.drawActionType) {
        state.drawingParameters.drawActionType = drawingParameters.drawActionType;
      }
      if (drawingParameters.color) {
        state.drawingParameters.color = drawingParameters.color;
      }
      state.drawingParameters = Object.assign({}, state.drawingParameters);
      return state;
    case SET_ADMIN_MODE :
      state.adminMode = true;
      return state;
      break;
    case ActionTypesEnum.SET_FIELD_PROPS :
      state.fieldsProps = Object.assign({}, state.fieldsProps, action.payload);
      return Object.assign({}, state);
      break;
    case UPDATE_PLAYER_MENU_STATE:
      state.openMenuPlayerId = action.payload;
      return state;
      break;
    case UPDATE_PLAYER_WITH_BALL:
      state.withBallPlayerId = action.payload;
      return state;
      break;
    case PASS_WAINTING_FOR_TARGET_SELECT:
      state.passSourcePlayerId = action.payload;
      return state;
      break;
    case PASS_TARGET_SELECTED:
      state.passTargetPlayerId = action.payload;
      return state;
      break;
    case SET_ANIMATION_STEP :
      state.animationControlData.currentStep = action.payload;
      state.animationControlData = Object.assign({}, state.animationControlData);
      return state;
      break;
    case ActionTypesEnum.MARK_CURRENT_STEP_AS_RECORDED :
      state.animationControlData.recordedSteps = state.animationControlData.currentStep;
      state.animationControlData = Object.assign({}, state.animationControlData);
      return state;
      break;
    case ActionTypesEnum.MARK_CURRENT_SET_AS_DIRTY :
      state.animationControlData.isDirty = action.payload as boolean;
      return state;
      break;
    case SET_ANIMATION_CONTROL_DATA :
      state.animationControlData = action.payload;
      return state;
      break;
    case SET_ANIMATION_SPEED :
      state.animationSpeed = action.payload;
      return state;
      break;
    case PLAYERS_SET_SELECTED :
      state.selectedSetId = action.payload;
      return state;
      break;
    default:
      return Object.assign({}, state);
  }
}

