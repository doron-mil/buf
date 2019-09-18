import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HomeComponent} from './components/home/home.component';
import {SandboxBottomToolbarModule} from '../sandbox-bottom-toolbar/sandbox-bottom-toolbar.module';
import {FieldModule} from '../field/field.module';


@NgModule({
  declarations: [
    HomeComponent,
  ],
  imports: [
    CommonModule,
    FieldModule,
    SandboxBottomToolbarModule,
  ],
  exports: [HomeComponent]
})
export class HomeModule {
}
