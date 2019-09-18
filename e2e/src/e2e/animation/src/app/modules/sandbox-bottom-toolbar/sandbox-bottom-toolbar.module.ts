import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {Ng5SliderModule} from 'ng5-slider';
import {MaterialModule} from '../material/material.module';
import {SetSelectionDialogComponent} from './dialogs/set-selection-dialog/set-selection-dialog.component';
import {BottomToolbarComponent} from './components/bottom-toolbar/bottom-toolbar.component';


@NgModule({
  declarations: [
    SetSelectionDialogComponent,
    BottomToolbarComponent,

  ],
  imports: [
    CommonModule,
    MaterialModule,
    Ng5SliderModule,
  ],
  exports: [BottomToolbarComponent],
  entryComponents: [SetSelectionDialogComponent],
})
export class SandboxBottomToolbarModule {
}
