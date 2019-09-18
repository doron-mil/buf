import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {NgRedux} from '@angular-redux/store';

import {AnimationPath, Coords} from '../dataModels/toolbar.model';
import {ActionGenerator} from '../../store/actions/action';
import {ToolbarActionRequest, DrawingActionRequestType} from '../dataModels/innerData.model';
import {ModeType} from '../dataModels/general.model';

@Injectable({
  providedIn: 'root'
})
export class ToolbarControllerService {

  private actionObservable: Subject<ToolbarActionRequest> = new Subject<ToolbarActionRequest>();

  colorsPalette: Array<string> = [];
  selectedColor: string;

  constructor(private ngRedux: NgRedux<any>) {
    this.initColorsPalette();
  }

  private initColorsPalette() {
    this.colorsPalette.push('red');
    this.colorsPalette.push('#f3df00');
    this.colorsPalette.push('blue');

    this.selectedColor = this.colorsPalette[0];

    const drawingParameters = {drawActionType: null, color: this.selectedColor};
    this.ngRedux.dispatch(ActionGenerator.setDrawingAction(drawingParameters));
  }

  getColorsPalette() {
    return this.colorsPalette;
  }

  getSelectedColor() {
    return this.selectedColor;
  }

  getActionObservable(): Observable<ToolbarActionRequest> {
    return this.actionObservable;
  }

  private appendEvent(aRequestType: DrawingActionRequestType, aPayload: any, aIsOn: boolean = true) {
    const newCanvasActionRequest = new ToolbarActionRequest();
    newCanvasActionRequest.type = aRequestType;
    newCanvasActionRequest.payload = aPayload;
    this.actionObservable.next(newCanvasActionRequest);

    // New Redux mechanism to replace in future code above
    if (aIsOn) {
      const drawingParameters = {drawActionType: aRequestType, color: aPayload};
      this.ngRedux.dispatch(ActionGenerator.setDrawingAction(drawingParameters));
    }
    // Shutting down the drawing mode
    if (!aIsOn) {
      this.ngRedux.dispatch(ActionGenerator.setMode(ModeType.DRAWING, false));
    }
  }

  toggleDraggingMode(aIsOn: boolean = true) {
    this.appendEvent(DrawingActionRequestType.DRAGGING_MODE, null, aIsOn);
  }

  toggleFreeDrawingMode(aIsOn: boolean = true) {
    this.appendEvent(DrawingActionRequestType.FREE_DRAWING, null, aIsOn);
  }

  toggleLineDrawingMode(aIsOn: boolean = true) {
    this.appendEvent(DrawingActionRequestType.LINE_DRAWING, null, aIsOn);
  }

  toggleArrowLineDrawingMode(aIsOn: boolean = true) {
    this.appendEvent(DrawingActionRequestType.ARROW_LINE_DRAWING, null, aIsOn);
  }

  createArea(aIsOn: boolean = true) {
    this.appendEvent(DrawingActionRequestType.AREA_DRAWING, null, aIsOn);
  }

  changeDrawingColor(aNewSelectedColr: string) {
    this.appendEvent(DrawingActionRequestType.CHANGE_DRAWING_COLOR, aNewSelectedColr);
  }

  undoLastObject() {
    this.appendEvent(DrawingActionRequestType.UNDO_LAST_DRAWING, null);
  }

  resetDrawing() {
    this.appendEvent(DrawingActionRequestType.RESET_DRAWING, null);
  }

  toggleScrimmageVisibility() {
    this.appendEvent(DrawingActionRequestType.TOGGLE_SCRIMMAGE_VISIBILITY, null);
  }

  recordPathStart(aPosition: Coords) {
    this.appendEvent(DrawingActionRequestType.START_RECORD_PATH, aPosition);
  }

  recordPathAddPoint(aPosition: Coords) {
    this.appendEvent(DrawingActionRequestType.ADD_POINT_TO_RECORD_PATH, aPosition);
  }

  recordPathEnd(aPosition: Coords) {
    this.appendEvent(DrawingActionRequestType.END_RECORD_PATH, aPosition);
  }

  play() {
    this.appendEvent(DrawingActionRequestType.PLAY, null);
  }

  toggleRecord(aIsRecordOn: boolean) {
    this.appendEvent(DrawingActionRequestType.RECORD, aIsRecordOn);
  }

  stop() {
    this.appendEvent(DrawingActionRequestType.STOP, null);
  }

  changeStep(aNewStepValue: number) {
    this.appendEvent(DrawingActionRequestType.STEP_CHANGE, aNewStepValue);
  }

  drawPath(aCoordsArray: Coords[]) {
    this.appendEvent(DrawingActionRequestType.DRAW_PATH, aCoordsArray);
  }

  drawPathPercentageData(aAnimationPath: AnimationPath) {
    this.appendEvent(DrawingActionRequestType.DRAW_PATH_PERCENTAGE, aAnimationPath);
  }
}
