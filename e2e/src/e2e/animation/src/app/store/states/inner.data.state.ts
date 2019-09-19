import {Dimensions, FieldProps, ModeType, Pos} from '../../shared/dataModels/general.model';
import {
  AnimationControlData,
  DrawingParameters,
  DrawingActionRequestType
} from '../../shared/dataModels/innerData.model';

export interface InnerDataState {
  adminMode: boolean;
  currentMode: ModeType;
  fieldsProps: FieldProps;
  drawingParameters: DrawingParameters;
  openMenuPlayerId: string;
  withBallPlayerId: string;
  passSourcePlayerId: string;
  passTargetPlayerId: string;
  animationSpeed: number;
  selectedSetId: string;
  animationControlData: AnimationControlData;
}

const initialFieldProps = new FieldProps();
initialFieldProps.dimensions = Dimensions.createInstance();
initialFieldProps.offset = Pos.createInstance();

export const INITIAL_INNER_DATA_STATE: InnerDataState = {
  adminMode: false,
  currentMode: ModeType.NONE,
  fieldsProps: initialFieldProps,
  drawingParameters: {drawActionType: DrawingActionRequestType.NONE, color: ''},
  openMenuPlayerId: '',
  withBallPlayerId: '',
  passSourcePlayerId: '',
  passTargetPlayerId: '',
  animationControlData: new AnimationControlData(0, 0),
  animationSpeed: 10,
  selectedSetId: undefined,
};

