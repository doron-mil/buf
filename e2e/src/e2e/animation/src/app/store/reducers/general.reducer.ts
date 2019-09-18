import {INITIAL_GENERAL_STATE, MainState} from '../states/main.state';
import {AppAction} from '../actions/action';

export function generalReducer(state: MainState = INITIAL_GENERAL_STATE, action: AppAction): any {

  switch (action.type) {
    default:
      return Object.assign({}, state);
  }
}

