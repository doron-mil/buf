import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {NgRedux} from '@angular-redux/store';

import {
  Color,
  Group,
  Item,
  Layer,
  PaperScope,
  Path,
  Point,
  Project,
  Raster,
  Rectangle,
  Shape,
  Size,
  Tool,
  ToolEvent
} from 'paper';

import {StoreService} from '../../../../shared/services/store.service';
import {FieldProps, ModeType} from '../../../../shared/dataModels/general.model';
import {StoreDataTypeEnum} from '../../../../store/storeDataTypeEnum';
import {DrawingActionRequestType, DrawingParameters} from '../../../../shared/dataModels/innerData.model';

const STROKE_WIDTH = 6;

@Component({
  selector: 'app-paper-draw-canvas',
  templateUrl: './paper-draw-canvas.component.html',
  styleUrls: ['./paper-draw-canvas.component.scss']
})
export class PaperDrawCanvasComponent implements OnInit, OnDestroy {

  fieldProps: FieldProps;

  currentDrawTool = DrawingActionRequestType.NONE;

  private scope: PaperScope;
  private paperProject: Project;
  private paperTool: Tool;
  private drawingLayer: Layer;
  private scrimmageLayer: Layer;

  isDrawingCursor = false;
  isDraggingCursor = false;

  newPath: Path;
  newRectangle: Shape.Rectangle;
  firstPoint: Point;

  currentColor: string;

  scrimmageObject: Shape.Rectangle;

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>,
              private storeService: StoreService) {
  }

  ngOnInit() {
    this.scope = new PaperScope();
    this.scope.setup('paperCanvas');
    this.paperProject = this.scope.project;
    this.drawingLayer = new Layer();
    this.scrimmageLayer = new Layer();
    this.paperTool = new Tool();

    this.currentColor = '';

    this.listenToEvents();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  private listenToEvents() {
    this.storeService.getFieldPropsChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((fieldProps: FieldProps) => {
        this.fieldProps = fieldProps;
        this.paperProject.view.viewSize.width = this.fieldProps.dimensions.clientWidth;
        this.paperProject.view.viewSize.height = this.fieldProps.dimensions.clientHeight;
      });

    this.storeService.getModeTypeChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(modeType => {
        if (modeType !== ModeType.DRAWING) {
          this.clearDrawingModes();
        }
      });

    this.ngRedux.select<DrawingParameters>([StoreDataTypeEnum.INNER_DATA, 'drawingParameters'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((drawingParameters: DrawingParameters) => {
        switch (drawingParameters.drawActionType) {
          case DrawingActionRequestType.LINE_DRAWING:
            this.clearDrawingModes();
            this.currentDrawTool = DrawingActionRequestType.LINE_DRAWING;
            this.startLineDrawing();
            break;
          case DrawingActionRequestType.FREE_DRAWING:
            this.clearDrawingModes();
            this.currentDrawTool = DrawingActionRequestType.FREE_DRAWING;
            this.startLineDrawing(false);
            break;
          case DrawingActionRequestType.ARROW_LINE_DRAWING:
            this.clearDrawingModes();
            this.currentDrawTool = DrawingActionRequestType.ARROW_LINE_DRAWING;
            this.startLineDrawing(false, this.drawArrowOnEnd.bind(this));
            break;
          case DrawingActionRequestType.AREA_DRAWING:
            this.clearDrawingModes();
            this.currentDrawTool = DrawingActionRequestType.AREA_DRAWING;
            this.startAreaDrawing();
            break;
          case DrawingActionRequestType.TOGGLE_SCRIMMAGE_VISIBILITY:
            this.toggleScrimmageVisibility();
            break;
          case DrawingActionRequestType.CHANGE_DRAWING_COLOR:
            this.currentColor = drawingParameters.color;
            break;
          case DrawingActionRequestType.UNDO_LAST_DRAWING:
            this.undoLastDrawingObject();
            break;
          case DrawingActionRequestType.DRAGGING_MODE :
            this.clearDrawingModes();
            this.currentDrawTool = DrawingActionRequestType.DRAGGING_MODE;
            this.initiateDraggingCapabilities();
            break;
          default:
            if (!this.currentColor || this.currentColor === '') {
              this.currentColor = drawingParameters.color;
            }
            this.clearDrawingModes();
        }
      });
  }

  private startLineDrawing(aIsStraightLine: boolean = true, aOnMouseUpCallBack: (upEvent: ToolEvent) => void = null) {

    this.isDrawingCursor = true;

    this.paperTool.onMouseDown = (downEvent: ToolEvent) => {
      this.newPath = new Path();
      this.drawingLayer.addChild(this.newPath);
      this.newPath.strokeColor = new Color(this.currentColor);
      this.newPath.strokeWidth = STROKE_WIDTH;
      this.newPath.add(downEvent.downPoint);

      this.paperTool.onMouseMove = (moveEvent: ToolEvent) => {
        if (this.newPath) {
          if (aIsStraightLine) {
            this.newPath.removeSegment(1);
          }
          this.newPath.add(downEvent.point);
        }
      };

      this.paperTool.onMouseUp = (upEvent: ToolEvent) => {
        if (aIsStraightLine) {
          this.createStraightLineWrapGroup();
        }
        this.paperTool.onMouseUp = undefined;
        this.paperTool.onMouseMove = undefined;
        if (aOnMouseUpCallBack) {
          aOnMouseUpCallBack(upEvent);
        }
        this.newPath = null;
      };
    };
  }

  /**
   * This was done to add wrapping rect around the line so it would be recognized in the mouseOver method.
   * I could have used hitTest (in the mouseOver) but it added a bug of disappearing the items.
   */
  private createStraightLineWrapGroup() {
    const pointA = this.newPath.segments[0].point;
    const pointB = this.newPath.segments[1].point;
    const angle = Math.atan2(pointB.y - pointA.y, pointB.x - pointA.x) * 180 / Math.PI - 90;
    const rectStartPoint = new Point(pointA.x - STROKE_WIDTH / 2, pointA.y);
    const newRect = new Shape.Rectangle(rectStartPoint, new Size(STROKE_WIDTH, this.newPath.length));
    newRect.rotate(angle, pointA);
    this.newPath.remove();
    const newGroup = new Group([this.newPath, newRect]);
    this.drawingLayer.addChild(newGroup);
  }

  private drawArrowOnEnd(aUpEvent: ToolEvent) {
    const segmentsArray = this.newPath.segments;
    const aPointA = this.newPath.segments[segmentsArray.length - 5].point;
    const aPointB = aUpEvent.point;

    const angle = Math.atan2(aPointB.y - aPointA.y, aPointB.x - aPointA.x) * 180 / Math.PI + 90;

    // fix position due to stroke width
    aPointB.y = aPointB.y + STROKE_WIDTH / 2;

    const newTriangleArrow = new Path.RegularPolygon(aPointB, 3, 15);
    newTriangleArrow.fillColor = new Color(this.currentColor);
    newTriangleArrow.rotate(angle);

    this.newPath.remove();
    const newGroup = new Group([this.newPath, newTriangleArrow]);
    this.drawingLayer.addChild(newGroup);
  }

  private clearDrawingModes() {
    this.currentDrawTool = DrawingActionRequestType.NONE;
    this.isDrawingCursor = false;
    this.isDraggingCursor = false;
    this.paperTool.onMouseDown = undefined;
    this.paperTool.onMouseUp = undefined;
    this.paperTool.onMouseMove = undefined;
    this.paperTool.onMouseDrag = undefined;
  }

  private toggleScrimmageVisibility() {
    if (!this.scrimmageObject) {
      const currentLinePosOnCanvas = this.fieldProps.dimensions.clientWidth * 0.7;

      this.scrimmageObject = new Shape.Rectangle(
        new Point(currentLinePosOnCanvas, 0),
        new Size(STROKE_WIDTH * 2, this.fieldProps.dimensions.clientHeight));
      this.scrimmageObject.fillColor = new Color('yellow');
      this.scrimmageLayer.addChild(this.scrimmageObject);
    } else {
      this.scrimmageLayer.removeChildren();
      this.scrimmageObject = null;
    }
  }

  private undoLastDrawingObject() {
    const lastChild = this.drawingLayer.lastChild;
    if (lastChild) {
      lastChild.remove();
    }
  }

  private startAreaDrawing() {
    this.isDrawingCursor = true;

    this.paperTool.onMouseDown = ((downEvent: ToolEvent) => {
      this.firstPoint = downEvent.downPoint;

      this.newRectangle = new Shape.Rectangle(this.firstPoint, downEvent.downPoint);
      this.newRectangle.strokeColor = new Color('yellow');
      this.newRectangle.strokeWidth = STROKE_WIDTH / 2;
      this.newRectangle.dashArray = [4, 2];
      this.drawingLayer.addChild(this.newRectangle);

      this.paperTool.onMouseMove = (moveEvent: ToolEvent) => {
        if (this.newRectangle && this.firstPoint) {

          const newRectangleObj = new Rectangle(this.firstPoint, moveEvent.point);
          this.newRectangle.size = newRectangleObj.size;
          this.newRectangle.position = newRectangleObj.center;
        }
      };

      this.paperTool.onMouseUp = ((upEvent: ToolEvent) => {
        if (this.newRectangle && this.firstPoint) {
          this.replaceAreaWithPattern();
        }

        this.paperTool.onMouseUp = undefined;
        this.paperTool.onMouseMove = undefined;
        this.firstPoint = null;

      });
    });
  }

  private replaceAreaWithPattern() {

    const additionalSpace = 2;
    const patternWidth = 15;
    const nonPatternWidth = 25;

    const substructureRect = new Path();
    substructureRect.add(this.newRectangle.bounds.bottomLeft);
    substructureRect.add(this.newRectangle.bounds.bottomRight);
    substructureRect.add(this.newRectangle.bounds.topRight);
    substructureRect.add(this.newRectangle.bounds.topLeft);
    substructureRect.closed = true;

    const diagonal = Math.sqrt(Math.pow(this.newRectangle.bounds.width, 2) +
      Math.pow(this.newRectangle.bounds.height, 2));
    const startPoint = this.newRectangle.bounds.bottomLeft.clone();
    startPoint.x -= (diagonal - this.newRectangle.bounds.width) / 2 - additionalSpace;
    startPoint.y += (diagonal - this.newRectangle.bounds.height) / 2 + additionalSpace;

    const patternShape = new Path();
    patternShape.fillColor = new Color('black');
    patternShape.opacity = 0.3;

    const xLimit = startPoint.x + diagonal + additionalSpace * 2;
    patternShape.add(startPoint);
    startPoint.y -= additionalSpace * 2;
    patternShape.add(startPoint);
    while (startPoint.x < xLimit) {
      startPoint.y -= diagonal;
      patternShape.add(startPoint);
      startPoint.x += Math.min(patternWidth, xLimit - startPoint.x);
      patternShape.add(startPoint);
      startPoint.y += diagonal;
      patternShape.add(startPoint);
      startPoint.x += Math.min(nonPatternWidth, xLimit - startPoint.x);
      patternShape.add(startPoint);
    }
    startPoint.y += additionalSpace * 2;
    patternShape.add(startPoint);

    patternShape.closed = true;
    patternShape.rotate(45);
    const res = patternShape.intersect(substructureRect, {insert: false, trace: true});

    this.newRectangle.strokeWidth = 0;
    this.newRectangle.opacity = 0.3;
    this.newRectangle.fillColor = new Color('yellow');
    this.newRectangle.fillColor = new Color(this.currentColor);

    this.newRectangle.remove();
    patternShape.remove();
    substructureRect.remove();
    res.remove();

    const newGroup = new Group([this.newRectangle, res]);
    this.drawingLayer.addChild(newGroup);
    this.newRectangle = null;

  }

  /**
   * Trying to implement pattern - no success - for future use
   */
  private buildPatternTry() {
    const canvas = document.createElement('canvas');
    const size = this.newRectangle.size;
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    const img = new Image();
    img.src = '/assets/gong.png';
    img.onload = (() => {
      context.fillStyle = context.createPattern(img, 'repeat');
      context.fillRect(0, 0, size.width, size.height);
      context.fill();

      const raster = new Raster(canvas);
      raster.onLoad = (() => {
        raster.size = this.newRectangle.size;
        raster.position = this.newRectangle.position;
        raster.opacity = 0.3;

        this.newRectangle.strokeWidth = 0;
        this.newRectangle.opacity = 0.3;
        this.newRectangle.fillColor = new Color(this.currentColor);
        this.newRectangle.remove();

        const newGroup = new Group([raster]);
        this.drawingLayer.addChild(newGroup);
        this.newRectangle = null;
      });
    });
  }

  private initiateDraggingCapabilities() {
    this.paperTool.onMouseMove = (moveEvent: ToolEvent) => {
      const isHoverItem = this.drawingLayer.children.some((item: Item) => {
        // better to use hitTest - but it added a bug of disappearing the items.
        // this.isDraggingCursor = !_.isNil(item.hitTest(moveEvent.point));
        this.isDraggingCursor = item.contains(moveEvent.point);
        if (this.isDraggingCursor) {
          this.paperTool.onMouseDrag = (dragEvent: ToolEvent) => {
            item.position.x += dragEvent.point.x - dragEvent.lastPoint.x;
            item.position.y += dragEvent.point.y - dragEvent.lastPoint.y;
          };
        }
        return this.isDraggingCursor;
      });

      if (!isHoverItem && this.scrimmageObject && this.scrimmageObject.contains(moveEvent.point)) {
        this.isDraggingCursor = true;
        this.paperTool.onMouseDrag = (dragEvent: ToolEvent) => {
          this.scrimmageObject.position.x += dragEvent.point.x - dragEvent.lastPoint.x;
        };
      }

      this.paperTool.onMouseUp = (upEvent: ToolEvent) => {
        this.paperTool.onMouseUp = undefined;
        this.paperTool.onMouseDrag = undefined;
      };
    };
  }

  private resetDrawing() {
    this.drawingLayer.removeChildren();
  }


  private addCircleTest(x, y) {
    const circle = new Path.Ellipse(
      new Rectangle(x, y, 50, 50));
    // circle.strokeColor = new Color('yellow');
    circle.strokeWidth = 6;
    this.drawingLayer.addChild(circle);
    this.drawingLayer.strokeColor = new Color(this.currentColor);
  }

}
