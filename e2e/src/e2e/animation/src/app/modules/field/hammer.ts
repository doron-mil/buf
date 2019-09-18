import { HammerGestureConfig } from '@angular/platform-browser';

export class MyHammerConfig extends HammerGestureConfig {
  overrides = <any> {
    press:{time:15},
    tap:{
      taps:2,
      interval:300,
      threshold:3,
      posThreshold:20}
   // pan:{threshold:0}
    //pan: { direction: Hammer.DIRECTION_HORIZONTAL },
    //swipe: { direction: Hammer.DIRECTION_VERTICAL },
    }
}