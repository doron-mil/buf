import {Component, OnInit} from '@angular/core';
import {fabric} from 'fabric';
import {IObjectAnimation, Rect} from 'fabric/fabric-impl';
import * as _ from 'lodash';

import {AnimationPath, Coords,} from '../../../../shared/dataModels/toolbar.model';
import {ToolbarControllerService} from '../../../../shared/services/toolbar-controller.service';
import {DataService} from '../../../../shared/services/data.service';
import {StoreService} from '../../../../shared/services/store.service';
import {FieldProps, ModeType} from '../../../../shared/dataModels/general.model';
import {DrawingActionRequestType, ToolbarActionRequest} from '../../../../shared/dataModels/innerData.model';

const CATEGORY_PROPERTY = 'category';
const POINTA_COORDS_PROPERTY = 'pointA';
const SCRIMMAGE_WIDTH = 13;
const SCRIMMAGE_COLOR = 'yellow';

@Component({
  selector: 'app-canvas',
  templateUrl: './canvas.component.html',
  styleUrls: ['./canvas.component.scss']
})
export class CanvasComponent implements OnInit {

  canvas: any;

  lineWidth = 6;

  modesMap = new Map<DrawingActionRequestType, (aIsOn) => void>();

  drawingColor: string;
  areaColor: string;

  lineMode = false;
  arrowMode = false;
  areaMode = false;
  newLine: fabric.Line;
  newArea: fabric.Rect;

  newRecordedPath: fabric.Path;
  animationPathMap = new Map<string, fabric.Path>();

  newPattern: fabric.Pattern;

  scrimmageObject: fabric.Object;

  fabricObjectDefaultOptions: any;

  fieldProps: FieldProps;

  constructor(private canvasControllerService: ToolbarControllerService,
              private dataService: DataService,
              private storeService: StoreService,
  ) {
    this.areaColor = 'lightgreen';
    this.initModesMap();
  }

  ngOnInit() {
    this.canvas = new fabric.Canvas('mainCanvas');

    this.storeService.getFieldPropsChangeObservable().subscribe((fieldProps: FieldProps) => {
      this.fieldProps = fieldProps;
      this.canvas.setWidth(fieldProps.dimensions.clientWidth);
      this.canvas.setHeight(fieldProps.dimensions.clientHeight);
    });

    this.setDrawingColor(this.canvasControllerService.getSelectedColor());

    this.canvas.freeDrawingBrush.width = this.lineWidth;

    this.listenToEvents();
    this.createPattern();
    // this.testDrawOnCanvas();
  }

  private initModesMap() {
    this.modesMap.set(DrawingActionRequestType.FREE_DRAWING, this.toggleFreeDrawing);
    this.modesMap.set(DrawingActionRequestType.LINE_DRAWING, this.toggleLineDrawing);
    this.modesMap.set(DrawingActionRequestType.ARROW_LINE_DRAWING, this.toggleArrowLineDrawing);
    this.modesMap.set(DrawingActionRequestType.AREA_DRAWING, this.toggleAreaDrawing);
  }

  private listenToEvents() {
    this.storeService.getModeTypeChangeObservable().subscribe(modeType => {
      if (modeType !== ModeType.DRAWING) {
        this.clearModes(null);
      }
    });

    this.canvasControllerService.getActionObservable().subscribe((actionRequest: ToolbarActionRequest) => {
      switch (actionRequest.type) {
        case DrawingActionRequestType.FREE_DRAWING:
          this.clearModes(DrawingActionRequestType.FREE_DRAWING);
          this.toggleFreeDrawing(null);
          break;
        case DrawingActionRequestType.LINE_DRAWING:
          this.clearModes(DrawingActionRequestType.LINE_DRAWING);
          this.toggleLineDrawing(null);
          break;
        case DrawingActionRequestType.ARROW_LINE_DRAWING:
          this.clearModes(DrawingActionRequestType.ARROW_LINE_DRAWING);
          this.toggleArrowLineDrawing(null);
          break;
        case DrawingActionRequestType.AREA_DRAWING:
          this.clearModes(DrawingActionRequestType.AREA_DRAWING);
          this.toggleAreaDrawing(null);
          break;
        case DrawingActionRequestType.CHANGE_DRAWING_COLOR:
          this.setDrawingColor(actionRequest.payload);
          break;
        case DrawingActionRequestType.TOGGLE_SCRIMMAGE_VISIBILITY:
          this.toggleScrimmageVisibility();
          break;
        case DrawingActionRequestType.UNDO_LAST_DRAWING:
          this.undoLastDrawingObject();
          break;
        case DrawingActionRequestType.RESET_DRAWING :
          this.resetDrawing();
          break;
        case DrawingActionRequestType.DRAWING_OFF:
          this.clearModes(null);
          break;
        case DrawingActionRequestType.START_RECORD_PATH:
          this.recordPathStart(actionRequest.payload);
          break;
        case DrawingActionRequestType.ADD_POINT_TO_RECORD_PATH:
          this.recordPathAddPoint(actionRequest.payload);
          break;
        case DrawingActionRequestType.END_RECORD_PATH:
          this.recordPathEnd(actionRequest.payload);
          break;
        case DrawingActionRequestType.DRAW_PATH:
          this.drawPath(actionRequest.payload);
          break;
        case DrawingActionRequestType.DRAW_PATH_PERCENTAGE:
          this.drawPathPercentageData(actionRequest.payload);
          break;
        default:
      }
    });
  }

  private clearModes(aExcept: DrawingActionRequestType) {
    this.modesMap.forEach((aMethod, aRequestType) => {
      if (aRequestType !== aExcept) {
        aMethod.call(this, false);
      }
    });
  }

  private toggleCanvasInteraction(aIsOn: boolean) {
    this.canvas.selection = aIsOn;
    this.canvas.defaultCursor = aIsOn ? 'default' : 'crosshair';
    this.canvas.hoverCursor = aIsOn ? 'move' : 'crosshair';

    this.canvas.forEachObject((object) => {
      if (object[CATEGORY_PROPERTY] !== 'system') {
        object.set('lockMovementX', !aIsOn);
        object.set('lockMovementY', !aIsOn);
        object.set('selectable', aIsOn);
      }
    });

    if (aIsOn) {
      this.canvas.off('mouse:move');
      this.canvas.off('mouse:down');
      this.canvas.off('mouse:up');
    }
  }

  private toggleFreeDrawing(aIsOn: boolean) {
    if (aIsOn !== null && aIsOn !== undefined) {
      this.canvas.isDrawingMode = aIsOn;
    } else {
      this.canvas.isDrawingMode = !this.canvas.isDrawingMode;
    }

    if (!this.canvas.isDrawingMode) {
      this.canvas.selection = true;

      const drawnObjects = this.canvas.getObjects();
      if (drawnObjects && drawnObjects.length > 0) {
        const drawnObject = drawnObjects[drawnObjects.length - 1];
        drawnObject.set('hasControls', false);
        drawnObject.set('hasBorders', false);
      }
    }
  }

  private toggleArrowLineDrawing(aIsOn: boolean) {
    if (aIsOn !== null && aIsOn !== undefined) {
      this.arrowMode = aIsOn;
    } else {
      this.arrowMode = !this.arrowMode;
    }
    this.genericLineDrawing(this.arrowMode);
  }

  private toggleLineDrawing(aIsOn: boolean) {
    if (aIsOn !== null && aIsOn !== undefined) {
      this.lineMode = aIsOn;
    } else {
      this.lineMode = !this.lineMode;
    }
    this.genericLineDrawing(this.lineMode);
  }

  private genericLineDrawing(aIsModeOn: boolean) {
    this.newLine = null;
    if (aIsModeOn) {
      this.toggleCanvasInteraction(false);

      this.canvas.on('mouse:down', (downEvent) => {
        const currentCoords = Coords.create(downEvent.pointer.x, downEvent.pointer.y);
        if (!this.newLine) {
          this.newLine = this.makeLine(currentCoords, currentCoords);
          this.canvas.add(this.newLine);

          this.canvas.on('mouse:move', (movingEvent) => {
            if (this.newLine) {
              const pointer = movingEvent.pointer;
              this.newLine.set({x2: pointer.x, y2: pointer.y});
              this.canvas.renderAll();
            }
          });

          this.canvas.on('mouse:up', (upEvent) => {
            if (this.arrowMode) {
              const os = -3;
              const arrowObject = this.makeArrow(
                Coords.create(this.newLine.x1 - os, this.newLine.y1 - os),
                Coords.create(this.newLine.x2 - os, this.newLine.y2 - os));
              this.canvas.remove(this.newLine);
              this.canvas.add(arrowObject);
            } else {
              this.canvas.remove(this.newLine);
              this.canvas.add(this.newLine);
            }
            this.canvas.off('mouse:up');
            this.canvas.off('mouse:move');
            this.newLine = null;
          });
        }
      });
    } else {
      this.toggleCanvasInteraction(true);
      this.newLine = null;
    }
  }

  makeLine(aPointA: Coords, aPointB: Coords): fabric.Line {
    const lineCoords = [...aPointA.values(), ...aPointB.values()];
    return new fabric.Line(lineCoords, this.fabricObjectDefaultOptions);
  }

  makeArrow(aPointA: Coords, aPointB: Coords): fabric.Polyline {
    let tox = aPointB.x;
    let toy = aPointB.y;
    // this.drawArrow(startX, startY, endX, endY);

    const angle = Math.atan2(toy - aPointA.y, tox - aPointA.x);

    const headlen = 12;  // arrow head size

    // bring the line end back some to account for arrow head.
    tox = tox - (headlen) * Math.cos(angle);
    toy = toy - (headlen) * Math.sin(angle);

    // calculate the points.
    const points = [
      {
        x: aPointA.x,  // start point
        y: aPointA.y
      }, {
        x: aPointA.x - (headlen / 4) * Math.cos(angle - Math.PI / 2),
        y: aPointA.y - (headlen / 4) * Math.sin(angle - Math.PI / 2)
      }, {
        x: tox - (headlen / 4) * Math.cos(angle - Math.PI / 2),
        y: toy - (headlen / 4) * Math.sin(angle - Math.PI / 2)
      }, {
        x: tox - (headlen) * Math.cos(angle - Math.PI / 2),
        y: toy - (headlen) * Math.sin(angle - Math.PI / 2)
      }, {
        x: tox + (headlen) * Math.cos(angle),  // tip
        y: toy + (headlen) * Math.sin(angle)
      }, {
        x: tox - (headlen) * Math.cos(angle + Math.PI / 2),
        y: toy - (headlen) * Math.sin(angle + Math.PI / 2)
      }, {
        x: tox - (headlen / 4) * Math.cos(angle + Math.PI / 2),
        y: toy - (headlen / 4) * Math.sin(angle + Math.PI / 2)
      }, {
        x: aPointA.x - (headlen / 4) * Math.cos(angle + Math.PI / 2),
        y: aPointA.y - (headlen / 4) * Math.sin(angle + Math.PI / 2)
      }, {
        x: aPointA.x,
        y: aPointA.y
      }
    ];
    const newPolyline = new fabric.Polyline(points, Object.assign({}, this.fabricObjectDefaultOptions, {
      strokeWidth: 0,
    }));

    return newPolyline;
  }

  private toggleAreaDrawing(aIsOn: boolean) {
    if (aIsOn !== null && aIsOn !== undefined) {
      this.areaMode = aIsOn;
    } else {
      this.areaMode = !this.areaMode;
    }

    this.newArea = null;
    if (this.areaMode) {
      this.toggleCanvasInteraction(false);

      this.canvas.on('mouse:down', (downEvent) => {
        const currentCoords = Coords.create(downEvent.pointer.x, downEvent.pointer.y);
        if (!this.newArea) {
          this.newArea = this.makeAreaObject(currentCoords, currentCoords);
          this.newArea[POINTA_COORDS_PROPERTY] = currentCoords;
          this.canvas.add(this.newArea);

          this.canvas.on('mouse:move', (upEvent) => {
            const moveCoords = Coords.create(upEvent.pointer.x, upEvent.pointer.y);
            this.newArea.set(this.getRectCoordsObject(this.newArea[POINTA_COORDS_PROPERTY], moveCoords));
            this.canvas.renderAll();
          });

          this.canvas.on('mouse:up', (upEvent) => {
            if (this.newArea) {
              this.canvas.remove(this.newArea);
              this.canvas.add(this.newArea);
              this.newArea = null;
              this.canvas.off('mouse:up');
              this.canvas.off('mouse:move');
            }
          });
        }
      });
    } else {
      this.toggleCanvasInteraction(true);
      this.newArea = null;
    }
  }

  private getRectCoordsObject(aPointA: Coords, aPointB: Coords): any {
    return {
      top: Math.min(aPointA.y, aPointB.y),
      left: Math.min(aPointA.x, aPointB.x),
      width: Math.abs(aPointA.x - aPointB.x),
      height: Math.abs(aPointA.y - aPointB.y),
    };
  }

  private makeAreaObject(aPointA: Coords, aPointB: Coords): fabric.Rect {
    const rect = new fabric.Rect(Object.assign({}, this.fabricObjectDefaultOptions, {
      opacity: 0.3,
      strokeWidth: 0,
      fill: this.newPattern,
    }, this.getRectCoordsObject(aPointA, aPointB)));

    return rect;
  }

  private undoLastDrawingObject() {
    const drawnObjects = this.canvas.getObjects();
    if (drawnObjects && drawnObjects.length > 0) {
      const foundObject = _.findLast(drawnObjects, (object) => object[CATEGORY_PROPERTY] !== 'system');
      if (foundObject) {
        this.canvas.remove(foundObject);
      }
    }
  }

  private resetDrawing() {
    this.canvas.forEachObject((object) => {
      if (object[CATEGORY_PROPERTY] !== 'system') {
        this.canvas.remove(object);
      }
    });
  }

  private setDrawingColor(aNewDrawingColor: string) {
    this.drawingColor = aNewDrawingColor;
    this.canvas.freeDrawingBrush.color = this.drawingColor;

    this.fabricObjectDefaultOptions = {
      fill: this.drawingColor,
      stroke: this.drawingColor,
      strokeWidth: this.lineWidth,
      originX: 'left',
      originY: 'top',
      selectable: false,
      hasControls: false,
      hasBorders: false,
    };

    this.createPattern();
  }

  private createPattern() {
    fabric.Image.fromURL('/assets/diagonal-stripes.svg', (img) => {
      const patternSourceCanvas = new fabric.StaticCanvas(null);
      patternSourceCanvas.add(img);

      patternSourceCanvas.setBackgroundColor(this.drawingColor, () => null);
      this.newPattern = new fabric.Pattern({
        // @ts-ignore
        source: () => {
          patternSourceCanvas.setDimensions({
            width: img.getScaledWidth(),
            height: img.getScaledHeight()
          });
          patternSourceCanvas.renderAll();
          return patternSourceCanvas.getElement();
        },
        repeat: 'repeat'
      });
    });
  }

  private toggleScrimmageVisibility() {
    if (!this.scrimmageObject) {
      const currentLinePosOnCanvas = 700;
      const scrimmageLine = this.makeLine(
        Coords.create(currentLinePosOnCanvas, 0), Coords.create(currentLinePosOnCanvas, this.canvas.getHeight()));
      scrimmageLine.set('fill', SCRIMMAGE_COLOR);
      scrimmageLine.set('stroke', SCRIMMAGE_COLOR);
      scrimmageLine.set('strokeWidth', SCRIMMAGE_WIDTH);
      scrimmageLine.set('selectable', false);
      scrimmageLine[CATEGORY_PROPERTY] = 'system';
      this.scrimmageObject = scrimmageLine;
      this.canvas.add(scrimmageLine);
    } else {
      this.canvas.remove(this.scrimmageObject);
      this.scrimmageObject = null;
    }
  }

  private recordPathStart(aStartingPosition: Coords) {
    const pathArray = [['M', ...aStartingPosition.values()] as [string, number, number]];
    this.newRecordedPath = this.makePath(pathArray);

    this.canvas.add(this.newRecordedPath);
  }

  private recordPathEnd(aStartingPosition: Coords) {
    const pathLength = this.newRecordedPath.path.length;
    const lastPoint = this.newRecordedPath.path[pathLength - 1];
    if (lastPoint[1] !== aStartingPosition.x || lastPoint[2] !== aStartingPosition.y) {
      this.recordPathAddPoint(aStartingPosition);
    }
    console.log('End', this.newRecordedPath);
    this.newRecordedPath.setCoords();
    this.canvas.renderAll();
    this.newRecordedPath = null;
  }

  private recordPathAddPoint(aStartingPosition: Coords) {
    if (this.newRecordedPath) {
      // @ts-ignore
      this.newRecordedPath.path.push(['L', aStartingPosition.x, aStartingPosition.y]);
      this.canvas.renderAll();
    }
  }

  private drawPathPercentageData(aAnimationPath: AnimationPath) {
    const coordsConvertedArray = aAnimationPath.path.map(coordsInPercentage => {
      return Coords.create(
        coordsInPercentage.x * this.canvas.width / 100,
        coordsInPercentage.y * this.canvas.height / 100
      );
    });
    const oldPathObj = this.animationPathMap.get(aAnimationPath.playerId);
    if (oldPathObj) {
      this.canvas.remove(oldPathObj);
    }
    const newPathObj = this.drawPath(coordsConvertedArray);
    this.animationPathMap.set(aAnimationPath.playerId, newPathObj);
  }

  private drawPath(aCoordsArray: Coords[]): fabric.Path {
    const path = aCoordsArray.map((coords, index) => {
      const actionChar = index ? 'L' : 'M';
      return [actionChar, ...coords.values()] as [string, number, number];
    });

    const fabPathObject = this.makePath(path);
    fabPathObject.calcCoords();
    this.canvas.add(fabPathObject);
    return fabPathObject;
  }

  makePath(aPathArray: [string, number, number][]): fabric.Path {
    // @ts-ignore
    const newPathObject = new fabric.Path(aPathArray);
    // newPathObject[CATEGORY_PROPERTY] = 'system';
    newPathObject.set({
      objectCaching: false,
      fill: 'transparent',
      stroke: 'blue',
      strokeWidth: 3,
      strokeDashArray: [5, 5],
    });

    return newPathObject;
  }


  private testDrawOnCanvas() {
    const rect: Rect = new fabric.Rect({
      top: 500,
      left: 100,
      width: 60,
      height: 70,
      fill: 'yellow',
      borderColor: 'black',
      hasBorders: true,
      padding: 5,
      stroke: 'black',
      strokeWidth: 10,
      strokeLineJoin: 'round',
      angle: 30,
      selectable: false
    });

    const circle = new fabric.Circle({
      radius: 60, left: 200, top: 450, hasBorders: true,
      selectable: true
    });

    circle.setGradient('fill', {
      // @ts-ignore
      x1: 0,
      y1: 0,
      x2: circle.height,
      y2: circle.height
      ,
      colorStops: {
        0: 'red',
        0.2: 'orange',
        0.4: 'yellow',
        0.6: 'green',
        0.8: 'blue',
        1: 'purple'
      }
    });

    fabric.Image.fromURL('/assets/gong.png', ((oImg) => {
      oImg.set('top', 500);
      oImg.set('left', 500);
      oImg.set('width', 512);
      oImg.set('height', 512);
      oImg.scale(0.2);

      oImg.filters.push(new fabric.Image.filters.Grayscale());
      // oImg.filters.push(new fabric.Image.filters.Sepia());
      oImg.applyFilters();

      this.canvas.add(oImg);
    }).bind(this));

    const path = new fabric.Path('M 0 0 L 200 100  L 50 50 L 170 200 z');
    path.set({left: 720, top: 120});

    this.canvas.add(circle);
    this.canvas.add(rect);
    this.canvas.add(path);

    (rect as IObjectAnimation<Rect>).animate('angle', '-=180', {
      onChange: this.canvas.renderAll.bind(this.canvas),
      duration: 3000,
      easing: fabric.util.ease.easeOutBounce
    });

  }

  private test() {
    this.canvas.forEachObject((obj) => {
      console.log(obj);
    });
  }

  private test2() {
    const drawnObjects = this.canvas.getObjects();
    const lastObject = drawnObjects[drawnObjects.length - 1];
    console.log('Last object = ', lastObject);
  }

}
