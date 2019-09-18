import {Injectable} from '@angular/core';
import {MatBottomSheet} from '@angular/material';
import {MessagesComponent} from '../components/messages/messages.component';

@Injectable({
  providedIn: 'root'
})
export class MessagesService {

  constructor(private bottomSheet: MatBottomSheet) {
  }

  openMessage(aMessage: string, aSubmitText: string, aCancelText: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const bottomSheetRef = this.bottomSheet.open(MessagesComponent, {
        data: {message: aMessage, submitText: aSubmitText, cancelText: aCancelText}
      });
      bottomSheetRef.afterDismissed().subscribe(aaaa => resolve(aaaa));

    });
  }
}
