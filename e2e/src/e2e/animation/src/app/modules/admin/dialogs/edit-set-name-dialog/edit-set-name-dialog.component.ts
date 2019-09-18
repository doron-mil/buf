import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';

@Component({
  selector: 'app-edit-set-name',
  templateUrl: './edit-set-name-dialog.component.html',
  styleUrls: ['./edit-set-name-dialog.component.scss']
})
export class EditSetNameDialogComponent implements OnInit {

  setsNamesArray: string[];
  setName = '';
  isNewSet = true;

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: { setsNamesArray: string[], currentName: string }) {
    if (data) {
      this.setsNamesArray = data.setsNamesArray;
      this.setName = data.currentName ? data.currentName : '';
    }

    this.isNewSet = !this.setName || this.setName === '';
  }

  ngOnInit() {
  }

  closeDialog() {
    this.dialogRef.close(null);
  }

  onKeydown(aNewValue: string) {
    this.submit(aNewValue);
  }

  submit(aNewValue: string) {
    const retName = aNewValue.trim();
    if (!this.setsNamesArray.some(name => name === retName)) {
      this.dialogRef.close(retName);
    }
  }
}
