import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {CanvasComponent} from './components/canvas/canvas.component';
import {PaperDrawCanvasComponent} from './components/paper-draw-canvas/paper-draw-canvas.component';


@NgModule({
  declarations: [
    CanvasComponent,
    PaperDrawCanvasComponent,
  ],
  imports: [
    CommonModule
  ],
  exports: [CanvasComponent, PaperDrawCanvasComponent],
})
export class SandboxCanvasModule {
}
