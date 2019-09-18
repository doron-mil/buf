import { Component, OnInit, Input, Output } from '@angular/core';
import { DataService } from 'src/app/shared/services/data.service';
import { playerState } from 'src/app/shared/dataModels/staticData.model';
import { EventEmitter } from '@angular/core';
import { NgRedux } from '@angular-redux/store';
import { updatePlayerMenuState, passWaitForTarget } from 'src/app/store/actions/action';
import { StoreDataTypeEnum } from 'src/app/store/storeDataTypeEnum';

@Component({
  selector: 'app-player-menu',
  templateUrl: './player-menu.component.html',
  styleUrls: ['./player-menu.component.scss']
})
export class PlayerMenuComponent implements OnInit {

  @Input() rotation:string;
  @Input() id:string;

  @Input() playerState:playerState;
  @Output() playerStateChange = new EventEmitter<playerState>();

  passBgAnimation = '';

  constructor(private data:DataService, private ngRedux: NgRedux<any>) { }

  ngOnInit() {
    this.ngRedux.select<string>([StoreDataTypeEnum.INNER_DATA,'passTargetPlayerId']).subscribe(playerId=>{
      if (playerId!=''){
        this.passBgAnimation = '';
      }
    })
  }

  //MENU EVENTS
  onKneel(){
    if(this.playerState.name=='kneel'){
      this.playerState = this.data.getStateByName('idle', this.playerState.withBall);
    } else {
      this.playerState = this.data.getStateByName('kneel', this.playerState.withBall);
    }
    this.playerStateChange.emit(this.playerState);
  }

  onPass(){
    //Ball item flashes
    this.passBgAnimation = 'passBG';
    //wait for select target
    this.ngRedux.dispatch(passWaitForTarget(this.id));
  }

  onTackle(){}

  onScrimage(){}

  onBall(){
    this.playerState = this.data.getStateByName(this.playerState.name, !this.playerState.withBall);
    this.playerStateChange.emit(this.playerState);
  }

}
