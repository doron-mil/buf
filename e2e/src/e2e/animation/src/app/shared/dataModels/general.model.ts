export enum ModeType {
  NONE,
  DRAWING,
  DRAGGING,
  RECORD_ANIMATION,
  PLAY_ANIMATION,
}

export class Pos {
  x: number;
  y: number;


  static createInstance(x: number = 0, y: number = 0) {
    const newPos = new Pos();
    newPos.x = x;
    newPos.y = y;
    return newPos;
  }
}

export class Dimensions {
  clientWidth: number;
  clientHeight: number;
  scale: number;


  static createInstance(fieldWidth: number = 0, fieldHehight: number = 0, scale: number = 1) {
    const newDimensions = new Dimensions();
    newDimensions.clientWidth = fieldWidth;
    newDimensions.clientHeight = fieldHehight;
    newDimensions.scale = scale;
    return newDimensions;
  }
}

export class FieldProps {
  dimensions: Dimensions;
  offset: Pos;

  static createInstance() {
    const newFieldProps = new FieldProps();
    newFieldProps.dimensions = Dimensions.createInstance();
    newFieldProps.offset = Pos.createInstance();
    return newFieldProps;
  }

}
