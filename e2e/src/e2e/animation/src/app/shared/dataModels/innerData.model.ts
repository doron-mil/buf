import {PlayerStepAnimation} from './dynamicData.model';

export class AnimationControlData {
  currentStep: number;
  recordedSteps: number;
  isDirty = false;

  constructor(currentStep: number, recordedSteps: number) {
    this.currentStep = currentStep;
    this.recordedSteps = recordedSteps;
  }
}

export class UpdatedStepForSet {
  setId: string;
  step: number;
  isUpdate: boolean;
  stepAnimationsMap: { [key: string]: PlayerStepAnimation } = {}; // <playerId,jsonPaperPath>
}

export interface PlayerFieldDataInterface {
  posX: number;
  posY: number;
  rotation: number;
  visible: boolean;
  state: string;
}

export enum DrawingActionRequestType {
  NONE,
  FREE_DRAWING,
  LINE_DRAWING,
  ARROW_LINE_DRAWING,
  AREA_DRAWING,
  CHANGE_DRAWING_COLOR,
  TOGGLE_SCRIMMAGE_VISIBILITY,
  UNDO_LAST_DRAWING,
  RESET_DRAWING,
  DRAGGING_MODE,
  DRAWING_OFF,
  DRAW_PATH,
  DRAW_PATH_PERCENTAGE,
  START_RECORD_PATH,
  ADD_POINT_TO_RECORD_PATH,
  END_RECORD_PATH,
  PLAY,
  RECORD,
  STOP,
  STEP_CHANGE,
}

export class ToolbarActionRequest {
  type: DrawingActionRequestType;
  payload: any;
}

export interface DrawingParameters {
  drawActionType: DrawingActionRequestType;
  color: string;
}
