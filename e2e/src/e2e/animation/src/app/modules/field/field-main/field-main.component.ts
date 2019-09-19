import {AfterViewInit, Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {ActivatedRoute} from '@angular/router';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {NgRedux} from '@angular-redux/store';


import {DataService} from 'src/app/shared/services/data.service';
import {environment} from 'src/environments/environment';
import {FieldPlayersComponent} from '../field-players/field-players.component';
import {FieldTrackingService} from '../field-tracking.service';
import {StoreService} from '../../../shared/services/store.service';
import {Dimensions, FieldProps, ModeType} from '../../../shared/dataModels/general.model';
import {updatePlayerMenuState} from 'src/app/store/actions/action';
import {ActionGenerator} from '../../../store/actions/action';


@Component({
  selector: 'app-field-main',
  templateUrl: './field-main.component.html',
  styleUrls: ['./field-main.component.scss']
})
export class FieldMainComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('field', {static: true}) fieldElement: any;
  @ViewChild(FieldPlayersComponent, {static: true}) fieldPlayers: FieldPlayersComponent;

  fieldX = 0;
  fieldY = 0;
  originalFieldX = 0;
  originalFieldY = 0;
  playersScale = 1;
  originalScale = 1;
  fieldScale = 1;
  fieldRotation = 0;
  duration = 0;

  fieldOriginalWidth: number;
  fieldOriginalHeight: number;

  playerStates = {};

  activeDrawLayer = false;

  isProd: boolean;

  private onDestroy$ = new Subject<boolean>();

  constructor(private ngRedux: NgRedux<any>,
              private data: DataService,
              private activeRoute: ActivatedRoute,
              private trackingService: FieldTrackingService,
              private storeService: StoreService,
              private http: HttpClient
  ) {
  }


  ngOnInit() {

    this.isProd = environment.production;

    this.data.behaviours['states'].subscribe(statesData => {
      this.playerStates = statesData;
    });

    this.data.resetZoomBehaviour.subscribe(() => {
      this.duration = 0.3;
      this.fieldScale = 1;
      this.originalScale = 1;
      this.fieldX = 0;
      this.fieldY = 0;
    });

    this.activeRoute.queryParams.pipe(takeUntil(this.onDestroy$)).subscribe(p => {
      const serverHost = p.serverHost || window.location.hostname;
      const serverPort = p.serverPort || window.location.port;
    });

    this.storeService.getModeTypeChangeObservable()
      .pipe(takeUntil(this.onDestroy$))
      .subscribe(modeType => {
        this.activeDrawLayer = (modeType === ModeType.DRAWING);
      });

    this.trackingService.startFieldTracking(this.fieldPlayers, this.fieldElement, this.fieldOriginalWidth, this.fieldOriginalHeight);
  }

  ngAfterViewInit() {
  }

  ngOnDestroy() {
    this.onDestroy$.next(true);
    this.onDestroy$.complete();
  }


  // ------ TOUCH EVENTS ------

  onPanStart(e) {
  }


  onPanMove(e) {
    this.updateFieldPosition(e);
  }


  onPanEnd(e) {
    this.updateFieldPosition(e);
    this.originalFieldX = this.fieldX;
    this.originalFieldY = this.fieldY;
  }


  updateFieldPosition(e) {
    this.duration = 0;

    let fieldRect = this.fieldElement.nativeElement.getBoundingClientRect();

    let newX = this.originalFieldX + e.deltaX;
    let newY = this.originalFieldY + e.deltaY;

    let widthOffset = fieldRect.width - this.fieldOriginalWidth;
    let heightOffset = fieldRect.height - this.fieldOriginalHeight;

    if (newX <= widthOffset / 2 && newX > 0 - widthOffset / 2) {
      this.fieldX = newX;
    }

    if (newY <= heightOffset / 2 && newY > 0 - heightOffset / 2) {
      this.fieldY = newY;
    }

  }


  onPinchMove(e) {

    this.fieldPlayers.playerElements.forEach(player => {
      player.showMenu = false;
    });

    this.duration = 0;

    let newScale = this.originalScale + e.scale - 1;
    if (newScale > environment.minFieldScale && newScale < environment.maxFieldScale) {
      this.fieldScale = newScale;
      const dimensions = new Dimensions();
      dimensions.scale = this.fieldScale;
      const fieldProps = new FieldProps();
      fieldProps.dimensions = dimensions;
      this.storeService.updateFieldProps(fieldProps);

      //Keep in limits
      let fieldRect = this.fieldElement.nativeElement.getBoundingClientRect();
      let widthOffset = fieldRect.width - this.fieldOriginalWidth;
      let heightOffset = fieldRect.height - this.fieldOriginalHeight;

      if (widthOffset / 2 <= this.fieldX) {
        //Left align
        this.fieldX = widthOffset / 2;
      } else if (0 - widthOffset / 2 > this.fieldX) {
        //Right align
        this.fieldX = 0 - widthOffset / 2;
      }

      if (heightOffset / 2 <= this.fieldY) {
        //Left align
        this.fieldY = heightOffset / 2;
      } else if (0 - heightOffset / 2 > this.fieldY) {
        //Right align
        this.fieldY = 0 - heightOffset / 2;
      }
    }
  }

  onPinchEnd(e) {
    this.duration = 0;
    this.originalScale = this.fieldScale;
  }


  onTap(e) {
    this.ngRedux.dispatch(updatePlayerMenuState(''));
  }


  saveState() {
    const state = this.ngRedux.getState();
    localStorage.setItem('store', JSON.stringify(state));
  }

  loadState() {
    const state = localStorage.getItem('store');
    this.ngRedux.dispatch(ActionGenerator.loadStoreData(JSON.parse(state)));
  }

}
