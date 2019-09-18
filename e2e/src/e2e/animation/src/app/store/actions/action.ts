import {Action} from 'redux';
import {FieldProps, ModeType} from '../../shared/dataModels/general.model';
import {set} from '../../shared/dataModels/dynamicData.model';
import {player, playerState, team} from '../../shared/dataModels/staticData.model';
import {AnimationControlData, DrawingParameters, UpdatedStepForSet} from '../../shared/dataModels/innerData.model';

export enum ActionTypesEnum {
  SET_DRAWING_ACTION = 'SET_DRAWING_ACTION',
  MARK_CURRENT_STEP_AS_RECORDED = 'MARK_CURRENT_STEP_AS_RECORDED',
  MARK_CURRENT_SET_AS_DIRTY = 'MARK_CURRENT_STEP_AS_DIRTY',
  UPDATE_ANIMATION_STEP_DATA = 'UPDATE_ANIMATION_STEP_DATA',
  PLAYERS_SET_REMOVE = 'PLAYERS_SET_REMOVE',
  SET_FIELD_PROPS = 'SET_FIELD_PROPS',
}

export const BASIC_DATA_FEATURE = '[BASIC_DATA]';

export const GET_BASIC_DATA = 'GET_BASIC_DATA';
export const LOAD_STORE_DATA = 'LOAD_STORE_DATA';

export const SET_MODE = 'SET_MODE';
export const SET_ADMIN_MODE = 'SET_ADMIN_MODE';

export const SET_ANIMATION_SPEED = 'SET_ANIMATION_SPEED';
export const SET_ANIMATION_STEP = 'SET_ANIMATION_STEP';
export const SET_ANIMATION_CONTROL_DATA = 'SET_ANIMATION_CONTROL_DATA';

export const PLAYERS_SET_SELECTED = 'PLAYERS_SET_SELECTED';
export const PLAYERS_SET_UPDATE = 'PLAYERS_SET_UPDATE';
export const ADD_NEW_PLAYERS_SET = 'ADD_NEW_PLAYERS_SET';

export const SET_PLAYERS_SETS_DATA = 'SET_PLAYERS_SETS_DATA';
export const SET_PLAYERS_DATA = 'SET_PLAYERS_DATA';
export const SET_STATES_DATA = 'SET_STATES_DATA';

export const SET_TEAMS_DATA = 'SET_TEAMS_DATA';
export const SET_ALL_PLAYERS_DATA = 'SET_ALL_PLAYERS_DATA'; // similar to SET_PLAYERS_DATA but intended for static
export const SET_PLAYERS_TEAMS_DATA = 'SET_PLAYERS_TEAMS_DATA';

export const UPDATE_ANIMATION = 'UPDATE_ANIMATION';

export const UPDATE_PLAYER_MENU_STATE = 'UPDATE_PLAYER_MENU_STATE';
export const UPDATE_PLAYER_WITH_BALL = 'UPDATE_PLAYER_WITH_BALL';
export const PASS_WAINTING_FOR_TARGET_SELECT = 'PASS_WAINTING_FOR_TARGET_SELECT';
export const PASS_TARGET_SELECTED = 'PASS_TARGET_SELECTED';

export interface AppAction extends Action {
  payload: any;
}

export const setBasicData = (aBasicServerData: any) => ({
  type: GET_BASIC_DATA,
  payload: null,
  meta: {feature: BASIC_DATA_FEATURE}
});

export const setMode = (aModeType: ModeType, aIsOn: boolean = true) => ({
  type: SET_MODE,
  payload: {modeType: aModeType, isOn: aIsOn},
});

export const setPlayersData = (aPlayers: player[]) => ({
  type: SET_PLAYERS_DATA,
  payload: aPlayers,
});

export const setPlayersSetsData = (aPlayerSets: set[]) => ({
  type: SET_PLAYERS_SETS_DATA,
  payload: aPlayerSets,
});

export const setStatesData = (aPlayerStates: playerState[]) => ({
  type: SET_STATES_DATA,
  payload: aPlayerStates,
});

export const updatePlayerMenuState = (playerId: string) => ({
  type: UPDATE_PLAYER_MENU_STATE,
  payload: playerId
});

export const updatePlayerWithBall = (playerId: string) => ({
  type: UPDATE_PLAYER_WITH_BALL,
  payload: playerId
});

export const passWaitForTarget = (playerId: string) => ({
  type: PASS_WAINTING_FOR_TARGET_SELECT,
  payload: playerId
});

export const passTargetSelected = (playerId: string) => ({
  type: PASS_TARGET_SELECTED,
  payload: playerId
});

export class ActionGenerator {
  static setBasicData = (aBasicServerData: any) => ({
    type: GET_BASIC_DATA,
    payload: null,
    meta: {feature: BASIC_DATA_FEATURE}
  });

  static loadStoreData = (aStoreData: any) => ({
    type: LOAD_STORE_DATA,
    payload: aStoreData,
  });

  static setMode = (aModeType: ModeType, aIsOn: boolean = true) => ({
    type: SET_MODE,
    payload: {modeType: aModeType, isOn: aIsOn},
  });

  static setAdminMode = () => ({
    type: SET_ADMIN_MODE,
  });

  static setDrawingAction = (aDrawingParameters: DrawingParameters) => ({
    type: ActionTypesEnum.SET_DRAWING_ACTION,
    payload: aDrawingParameters,
  });

  static setPlayersSetsData = (aPlayerSets: set[]) => ({
    type: SET_PLAYERS_SETS_DATA,
    payload: aPlayerSets,
  });

  static setPlayersData = (aPlayers: player[]) => ({
    type: SET_PLAYERS_DATA,
    payload: aPlayers,
  });

  static setStatesData = (aPlayerStates: playerState[]) => ({
    type: SET_STATES_DATA,
    payload: aPlayerStates,
  });

  static setFieldProps = (aFieldProps: FieldProps) => ({
    type: ActionTypesEnum.SET_FIELD_PROPS,
    payload: aFieldProps,
  });

  static updateAnimationStepData = (aUpdatedStepForSet: UpdatedStepForSet) => ({
    type: ActionTypesEnum.UPDATE_ANIMATION_STEP_DATA,
    payload: aUpdatedStepForSet,
  });

  static setAnimationSpeed = (aSpeed: number) => ({
    type: SET_ANIMATION_SPEED,
    payload: aSpeed,
  });

  static setAnimationControlData = (aAnimationControlData: AnimationControlData) => ({
    type: SET_ANIMATION_CONTROL_DATA,
    payload: aAnimationControlData,
  });

  static setAnimationStep = (aStep: number) => ({
    type: SET_ANIMATION_STEP,
    payload: aStep,
  });

  static markCurrentStepAsRecorded = () => ({
    type: ActionTypesEnum.MARK_CURRENT_STEP_AS_RECORDED,
  });

  static markCurrentSetAsDirty = (aIsDirty: boolean = true) => ({
    type: ActionTypesEnum.MARK_CURRENT_SET_AS_DIRTY,
    payload: aIsDirty,
  });

  static playersSetSelected = (aSelectedSetId: string) => ({
    type: PLAYERS_SET_SELECTED,
    payload: aSelectedSetId,
  });

  static playersSetUpdate = (aSetToUpdate: set) => ({
    type: PLAYERS_SET_UPDATE,
    payload: aSetToUpdate,
  });

  static playersSetRemove = (aSetId2Remove: string) => ({
    type: ActionTypesEnum.PLAYERS_SET_REMOVE,
    payload: aSetId2Remove,
  });

  static addNewPlayersSet = (aSetToUpdate: set) => ({
    type: ADD_NEW_PLAYERS_SET,
    payload: aSetToUpdate,
  });

  static setTeamsData = (aTeamsArray: team[]) => ({
    type: SET_TEAMS_DATA,
    payload: aTeamsArray,
  });

  static setAllPlayersData = (aPlayersArray: player[]) => ({
    type: SET_ALL_PLAYERS_DATA,
    payload: aPlayersArray,
  });

  static setPlayersTeamsData = (aPlayersTeamMap: { [key: string]: player[] }) => ({
    type: SET_PLAYERS_TEAMS_DATA,
    payload: aPlayersTeamMap,
  });
}
