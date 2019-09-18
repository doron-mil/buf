import {NgModule} from '@angular/core';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatBottomSheetModule,
  MatButtonModule,
  MatCardModule,
  MatCheckboxModule,
  MatDialogModule,
  MatFormFieldModule,
  MatGridListModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatToolbarModule, MatTooltipModule
} from '@angular/material';

@NgModule({
  imports: [
    BrowserAnimationsModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatGridListModule,
    MatSelectModule,
    MatBottomSheetModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
  exports: [
    MatToolbarModule,
    MatFormFieldModule,
    MatButtonModule,
    MatListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatDialogModule,
    MatGridListModule,
    MatSelectModule,
    MatBottomSheetModule,
    MatProgressSpinnerModule,
    MatInputModule,
    MatCheckboxModule,
    MatTooltipModule,
  ],
})
export class MaterialModule {
}
