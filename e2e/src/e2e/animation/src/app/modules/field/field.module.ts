import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {HAMMER_GESTURE_CONFIG} from '@angular/platform-browser';

import {MyHammerConfig} from './hammer';

import {FieldBackgroundComponent} from './field-background/field-background.component';
import {FieldMainComponent} from './field-main/field-main.component';
import {DataService} from '../../shared/services/data.service';
import {FieldPlayersComponent} from './field-players/field-players.component';
import {PlayerComponent} from './field-players/player/player.component';
import {SandboxCanvasModule} from '../sandbox-canvas/sandbox-canvas.module';
import {FieldTrackingService} from './field-tracking.service';
import {PlayerMenuComponent} from './field-players/player/player-menu/player-menu.component';

@NgModule({
  declarations: [FieldBackgroundComponent, FieldMainComponent, FieldPlayersComponent, PlayerComponent, PlayerMenuComponent],
  imports: [
    CommonModule,
    SandboxCanvasModule
  ],
  exports: [
    FieldMainComponent
  ],
  providers: [DataService,
    FieldTrackingService,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: MyHammerConfig
    }
  ]
})

export class FieldModule {
}
