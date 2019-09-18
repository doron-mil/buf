import {Component, Inject, OnInit} from '@angular/core';
import {MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef} from '@angular/material';

@Component({

  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent implements OnInit {

  private cancelText;

  constructor(private bottomSheetRef: MatBottomSheetRef<MessagesComponent>,
              @Inject(MAT_BOTTOM_SHEET_DATA) public data: { message: string, submitText: string, cancelText: string }) {
    this.cancelText = data.cancelText;
  }

  ngOnInit() {
  }

  cancel() {
    this.bottomSheetRef.dismiss(false);
  }

  submit() {
    this.bottomSheetRef.dismiss(true);
  }
}
