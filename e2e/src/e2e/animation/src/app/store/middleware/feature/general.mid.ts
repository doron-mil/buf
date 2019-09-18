import {Injectable} from '@angular/core';
import {
  ActionGenerator,
  ActionTypesEnum,
  ADD_NEW_PLAYERS_SET,
  GET_BASIC_DATA,
  PLAYERS_SET_SELECTED
} from '../../actions/action';
import {API_ERROR} from '../../actions/api.actions';
import {StoreDataTypeEnum} from '../../storeDataTypeEnum';
import {DynamicDataState} from '../../states/dynamic.data.state';
import {AnimationControlData, UpdatedStepForSet} from '../../../shared/dataModels/innerData.model';
import {ModeType} from '../../../shared/dataModels/general.model';


@Injectable()
export class GeneralMiddlewareService {
  constructor() {
  }

  generalMiddleware = ({getState, dispatch}) => (next) => (action) => {
    next(action);

    switch (action.type) {
      case GET_BASIC_DATA:
        break;
      case ActionTypesEnum.UPDATE_ANIMATION_STEP_DATA:
        const setWithUpdatedStep = action.payload as UpdatedStepForSet;
        if (!setWithUpdatedStep.isUpdate) {
          dispatch(ActionGenerator.markCurrentStepAsRecorded());
        }
        dispatch(ActionGenerator.markCurrentSetAsDirty());
        break;
      case PLAYERS_SET_SELECTED:
        const selectedSetId = action.payload;
        const dynamicDataState = getState()[StoreDataTypeEnum.DYNAMIC_DATA] as DynamicDataState;
        const playersSets = (dynamicDataState).playersSets;
        const foundSet = playersSets.find(setItem => setItem.id === selectedSetId);
        const animationControlData = new AnimationControlData(0, 0);
        if (foundSet && foundSet.players && foundSet.players.length && foundSet.players[0].animation) {
          const noOfSteps = foundSet.players[0].animation.length;
          if (noOfSteps) {
            animationControlData.currentStep = 1;
            animationControlData.recordedSteps = noOfSteps;
          }
        }
        dispatch(ActionGenerator.setAnimationControlData(animationControlData));
        break;
      case ADD_NEW_PLAYERS_SET:
        dispatch(ActionGenerator.playersSetUpdate(action.payload));
        dispatch(ActionGenerator.playersSetSelected(action.payload.id));
        dispatch(ActionGenerator.setAnimationControlData(new AnimationControlData(1, 1)));
        break;
      case ActionTypesEnum.SET_DRAWING_ACTION:
        dispatch(ActionGenerator.setMode(ModeType.DRAWING, true));
        break;
    }

    if (action.type.includes(API_ERROR)) {
      console.error('Error in  processing API middleware : ', action);
    }
  };
}
