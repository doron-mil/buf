import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material';
import {PlaySet} from '../../../../shared/dataModels/toolbar.model';

@Component({
  selector: 'app-set-selection-dialog',
  templateUrl: './set-selection-dialog.component.html',
  styleUrls: ['./set-selection-dialog.component.scss']
})
export class SetSelectionDialogComponent implements OnInit {

  playSets: PlaySet[];
  rowHeight: number;

  constructor(public dialogRef: MatDialogRef<any>,
              @Inject(MAT_DIALOG_DATA) public data: { playSets: PlaySet[], rowHeight: number }) {

    this.playSets = data.playSets;
    this.rowHeight = data.rowHeight;
  }

  ngOnInit() {
  }

  selectSet(setData) {
    this.dialogRef.close(setData);
  }
}
