import {Component, Input, OnDestroy, OnInit, TemplateRef} from '@angular/core';
import {Router} from '@angular/router';
import {NgRedux} from '@angular-redux/store';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import * as _ from 'lodash';

import {ActionGenerator} from '../../../../store/actions/action';
import {PageTypeEnum} from '../../../../shared/dataModels/general.model';
import {StoreDataTypeEnum} from '../../../../store/storeDataTypeEnum';
import {DrawingActionRequestType} from '../../../../shared/dataModels/innerData.model';
import {ToolbarControllerService} from '../../../../shared/services/toolbar-controller.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  @Input()
  headerTemplate: TemplateRef<any>;

  pageType = PageTypeEnum.PRESENTATION;

  drawingActionRequestType = DrawingActionRequestType;
  currentSelectedDrawAction: DrawingActionRequestType;
  colorPaletteIsOpened = false;
  selectedColor: string;
  colorsPalette: Array<string> = [];

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>,
              private router: Router,
              private toolbarControllerService: ToolbarControllerService) {
  }

  ngOnInit() {
    this.getColorsPalette();

    if (this.router.url.indexOf('recording') >= 0) {
      this.ngRedux.dispatch(ActionGenerator.setAdminMode());
    }

    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA, 'selectedSetId'])
      .pipe(takeUntil(this.onDestroy$))
      .subscribe((selectedSetId: string) => {
        if (!selectedSetId || selectedSetId === '') {
          this.router.navigate(['admin']);
        }
      });
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }

  private getColorsPalette() {
    this.colorsPalette = this.toolbarControllerService.getColorsPalette();
    this.selectedColor = this.toolbarControllerService.getSelectedColor();
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

  colorSelected(aSelectedColor: string, aaa) {
    console.log('11111', (aaa as HTMLElement).offsetLeft);
    this.selectedColor = aSelectedColor;
    this.toolbarControllerService.changeDrawingColor(aSelectedColor);
    this.colorPaletteIsOpened = false;

  }

  resetDrawing() {
    this.toolbarControllerService.resetDrawing();
  }

  undoLastObject() {
    this.toolbarControllerService.undoLastObject();
  }

  getFilteredColorsPalette(): string[] {
    return _.filter(this.colorsPalette, color => color !== this.selectedColor);
  }


}
