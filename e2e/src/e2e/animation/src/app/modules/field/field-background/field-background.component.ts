import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';

import {ResizeSensor} from 'css-element-queries';

import {Dimensions, FieldProps, Pos} from '../../../shared/dataModels/general.model';
import {StoreService} from '../../../shared/services/store.service';

@Component({
  selector: 'app-field-background',
  templateUrl: './field-background.component.html',
  styleUrls: ['./field-background.component.scss']
})

export class FieldBackgroundComponent implements OnInit, OnDestroy {

  @ViewChild('fieldBG', {static: true}) fieldBgElement: ElementRef<any>;
  @ViewChild('fieldBGImg', {static: true}) fieldBGImgElement: ElementRef<any>;

  resizeSensor: ResizeSensor;

  imgDimensionsRatio: number;

  fieldProps: FieldProps;

  constructor(private storeService: StoreService) {
  }

  ngOnInit() {

    this.fieldProps = FieldProps.createInstance();

    this.imgDimensionsRatio = 2.127659574468085 ;
    // this.imgDimensionsRatio = this.fieldBGImgElement.nativeElement.naturalWidth /
    //   this.fieldBGImgElement.nativeElement.naturalHeight;

    this.republishFieldDimensions();

    this.resizeSensor = new ResizeSensor(this.fieldBgElement.nativeElement, () => {
      this.republishFieldDimensions();
    });
  }

  ngOnDestroy() {
    this.resizeSensor.detach();
  }

  private republishFieldDimensions() {
    const nativeE = this.fieldBgElement.nativeElement;
    this.fieldProps.dimensions = Dimensions.createInstance(nativeE.clientWidth, nativeE.clientHeight);

    if (this.imgDimensionsRatio * this.fieldProps.dimensions.clientHeight < this.fieldProps.dimensions.clientWidth) {
      this.fieldProps.dimensions.clientWidth = this.fieldProps.dimensions.clientHeight * this.imgDimensionsRatio;
      this.fieldProps.offset =
        Pos.createInstance((nativeE.clientWidth - this.fieldProps.dimensions.clientWidth) / 2, 0);
    } else {
      this.fieldProps.dimensions.clientHeight = this.fieldProps.dimensions.clientWidth / this.imgDimensionsRatio;
      this.fieldProps.offset = Pos.createInstance();
    }

    this.storeService.updateFieldProps(this.fieldProps);
  }

}
