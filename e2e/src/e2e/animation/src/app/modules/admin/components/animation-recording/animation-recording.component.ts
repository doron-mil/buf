import {Component, OnDestroy, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Router} from '@angular/router';

import {ActionGenerator} from '../../../../store/actions/action';
import {PageTypeEnum} from '../../../../shared/dataModels/general.model';
import {StoreDataTypeEnum} from '../../../../store/storeDataTypeEnum';
import {takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-animation',
  templateUrl: './animation-recording.component.html',
  styleUrls: ['./animation-recording.component.scss']
})
export class AnimationRecordingComponent implements OnInit, OnDestroy {

  pageType = PageTypeEnum.RECORDING;

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>, private router: Router) {
    this.ngRedux.dispatch(ActionGenerator.setAdminMode());
  }

  ngOnInit() {
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

  goAdminPage() {
    this.router.navigate(['admin']);
  }
}
