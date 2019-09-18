import {Component, HostListener, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {MatDialog} from '@angular/material';
import {Router} from '@angular/router';
import {Subject} from 'rxjs';
import {take, takeUntil} from 'rxjs/operators';
import {Options} from 'ng5-slider';

import * as _ from 'lodash';

import {NgRedux} from '@angular-redux/store';

import {SetSelectionDialogComponent} from '../../dialogs/set-selection-dialog/set-selection-dialog.component';
import {ToolbarControllerService} from '../../../../shared/services/toolbar-controller.service';
import {DataService} from 'src/app/shared/services/data.service';
import {StoreService} from '../../../../shared/services/store.service';
import {ModeType} from '../../../../shared/dataModels/general.model';
import {ActionGenerator} from '../../../../store/actions/action';
import {StoreDataTypeEnum} from '../../../../store/storeDataTypeEnum';
import {AnimationControlData, DrawingActionRequestType} from '../../../../shared/dataModels/innerData.model';
import {InnerDataState} from '../../../../store/states/inner.data.state';

const SETS_COUNT_PER_ROW = 3;
const SETS_ROW_HEIGHT = 34;

@Component({
  selector: 'app-bottom-toolbar',
  templateUrl: './bottom-toolbar.component.html',
  styleUrls: ['./bottom-toolbar.component.scss']
})
export class BottomToolbarComponent implements OnInit, OnDestroy {

  @Input()
  controlsTemplate: TemplateRef<any>;

  isAdminMode = false;
  animationSpeed = 40;
  animationSpeedOptions: Options = {
    floor: 0,
    ceil: 100,
    step: 10,
    showTicks: true,
    vertical: true,
  };
  animationStepOptions: Options = {
    floor: 0,
    ceil: 0,
    step: 1,
    showTicks: true,
    showTicksValues: true,
    translate: (value: number): string => {
      return (((value === this.lastRecordedStep + 1) || (value === 0)) ? '' : '' + value);
    }
  };

  colorsPalette: Array<string> = [];
  colorPaletteIsOpened = false;
  selectedColor: string;

  drawingActionRequestType = DrawingActionRequestType;
  currentSelectedDrawAction: DrawingActionRequestType;
  CanvasActionRequestTypeEnum = DrawingActionRequestType;
  scrimmageIsOn = false;

  isRecording = false;
  isPlaying = false;
  isPlayMode = true;

  selectedStep: number;
  lastRecordedStep: number;
  availableSteps: number;

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>,
              private toolbarControllerService: ToolbarControllerService,
              private dialog: MatDialog,
              private data: DataService,
              private storeService: StoreService,
              private router: Router
  ) {
  }

  ngOnInit() {
    const innerDataState = this.ngRedux.getState()[StoreDataTypeEnum.INNER_DATA] as InnerDataState;
    this.isAdminMode = innerDataState.adminMode;

    this.getColorsPalette();

    this.listenToAnimationControlDataChange();

    this.onModeTypeChange();
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  private listenToAnimationControlDataChange() {
    this.ngRedux.select<AnimationControlData>([StoreDataTypeEnum.INNER_DATA, 'animationControlData'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((aAnimationControlData: AnimationControlData) => {
        this.lastRecordedStep = aAnimationControlData.recordedSteps;
        this.selectedStep = aAnimationControlData.currentStep;
        this.availableSteps = this.lastRecordedStep;

        let stepOptions = {ceil: 0};
        if (this.lastRecordedStep) {
          stepOptions = Object.assign({}, {
            floor: 1,
            // maxLimit: this.lastRecordedStep,
            ceil: this.lastRecordedStep + 1,
            disabled: this.isPlaying || this.isRecording,
          });
        }
        this.animationStepOptions = Object.assign({}, this.animationStepOptions, stepOptions);
      });
  }

  private onModeTypeChange() {
    this.storeService.getModeTypeChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((modeType: ModeType) => {
        if (modeType !== ModeType.PLAY_ANIMATION && this.isPlaying === true) {
          this.setPlayRecordOnOff(false);
        }
      });
  }

  goToAdmin() {
    this.router.navigate(['admin']);
  }

  goToRecording() {
    this.router.navigate(['recording']);
  }

  goToDrawing() {
    this.router.navigate(['/']);
  }

  selectSet() {
    const playSets = this.data.getSetsForMenu();
    const noOfRows = playSets ? Math.ceil(playSets.length / SETS_COUNT_PER_ROW) : 0;
    const dialogRef = this.dialog.open(SetSelectionDialogComponent, {
      height: `${SETS_ROW_HEIGHT * noOfRows + 5}px`,
      width: '55vw',
      maxWidth: '55vw',
      panelClass: 'set-select-dialog',
      position: {bottom: '130px', left: '0'},
      data: {playSets, rowHeight: SETS_ROW_HEIGHT}
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe((selectedSet: { id: string, name: string }) => {
      if (selectedSet !== undefined) {
        if (selectedSet) {
          this.data.selectSet(selectedSet.id);
          // this.ngRedux.dispatch(ActionGenerator.playersSetSelected(selectedSet.id));
        }
      }
    });
  }

  zoomToAction() {
    console.log('zoomToAction');
  }

  resetZoom() {
    this.data.resetZoomBehaviour.next('reset');
    console.log('resetZoom');
  }

  play() {
    this.storeService.setMode(ModeType.PLAY_ANIMATION);
    this.setPlayRecordOnOff(true);
  }

  stop() {
    this.storeService.setMode(ModeType.NONE);
    this.setPlayRecordOnOff(false);
  }

  addStep() {
    this.selectedStep = this.availableSteps += 1;
    this.ngRedux.dispatch(ActionGenerator.setAnimationStep(this.selectedStep));
  }

  record() {
    this.setPlayRecordOnOff(!this.isRecording, false);
    this.storeService.setMode(this.isRecording ? ModeType.RECORD_ANIMATION : ModeType.NONE);
  }

  private setPlayRecordOnOff(aIsOn: boolean, aIsPlay: boolean = true) {
    this.isPlaying = aIsPlay ? aIsOn : this.isPlaying;
    this.isRecording = aIsPlay ? this.isRecording : aIsOn;

    this.animationStepOptions = Object.assign({}, this.animationStepOptions, {disabled: aIsOn});
  }

  toggleScrimmageVisibility() {
    this.scrimmageIsOn = !this.scrimmageIsOn;
    this.toolbarControllerService.toggleScrimmageVisibility();
  }

  animationStepChanged() {
    if (this.animationStepOptions.floor === 1 && this.animationStepOptions.ceil >= 1) {
      this.ngRedux.dispatch(ActionGenerator.setAnimationStep(this.selectedStep));
    }
  }

  animationSpeedChanged() {
    this.ngRedux.dispatch(ActionGenerator.setAnimationSpeed(this.animationSpeed));
  }

  resetDrawing() {
    this.toolbarControllerService.resetDrawing();
  }

  undoLastObject() {
    this.toolbarControllerService.undoLastObject();
  }

  logout() {
    this.router.navigate(['logout']);
  }

  toggleDraw() {
    this.toggleSelectedDrawAction(DrawingActionRequestType.DRAGGING_MODE);
    this.toolbarControllerService.toggleDraggingMode(this.currentSelectedDrawAction === DrawingActionRequestType.DRAGGING_MODE);
  }

  toggleFreeDrawing() {
    this.toggleSelectedDrawAction(DrawingActionRequestType.FREE_DRAWING);
    this.toolbarControllerService.toggleFreeDrawingMode(
      this.currentSelectedDrawAction === DrawingActionRequestType.FREE_DRAWING);
  }

  toggleLineDrawing() {
    this.toggleSelectedDrawAction(DrawingActionRequestType.LINE_DRAWING);
    this.toolbarControllerService.toggleLineDrawingMode(
      this.currentSelectedDrawAction === DrawingActionRequestType.LINE_DRAWING);
  }

  toggleArrowLineDrawing() {
    this.toggleSelectedDrawAction(DrawingActionRequestType.ARROW_LINE_DRAWING);
    this.toolbarControllerService.toggleArrowLineDrawingMode(
      this.currentSelectedDrawAction === DrawingActionRequestType.ARROW_LINE_DRAWING);
  }

  createArea() {
    this.toggleSelectedDrawAction(DrawingActionRequestType.AREA_DRAWING);
    this.toolbarControllerService.createArea(
      this.currentSelectedDrawAction === DrawingActionRequestType.AREA_DRAWING);
  }

  private toggleSelectedDrawAction(aToggledDrawAction: DrawingActionRequestType) {
    if (aToggledDrawAction !== this.currentSelectedDrawAction) {
      this.currentSelectedDrawAction = aToggledDrawAction;
    } else {
      this.currentSelectedDrawAction = null;
    }
  }


  selectColor() {
    this.colorPaletteIsOpened = !this.colorPaletteIsOpened;
  }

  colorSelected(aSelectedColor: string) {
    console.log('SelectedColor', aSelectedColor);
    this.selectedColor = aSelectedColor;
    this.toolbarControllerService.changeDrawingColor(aSelectedColor);
    this.colorPaletteIsOpened = false;

  }

  private getColorsPalette() {
    this.colorsPalette = this.toolbarControllerService.getColorsPalette();
    this.selectedColor = this.toolbarControllerService.getSelectedColor();
  }

  getFilteredColorsPalette(): string[] {
    return _.filter(this.colorsPalette, color => color !== this.selectedColor);
  }

  @HostListener('window:click', ['$event'])
  onClick(targetElement: any) {
    if (this.colorPaletteIsOpened && targetElement.path) {
      const isColorOpener = (targetElement.path as []).some((pathItem: { id: string }) => pathItem.id === 'colorOpener');
      if (!isColorOpener) {
        this.colorPaletteIsOpened = false;
      }
    }
  }
}
