import {Component, OnInit} from '@angular/core';
import {NgRedux} from '@angular-redux/store';
import {Router} from '@angular/router';

import {ActionGenerator} from '../../../../store/actions/action';

@Component({
  selector: 'app-animation',
  templateUrl: './animation.component.html',
  styleUrls: ['./animation.component.scss']
})
export class AnimationComponent implements OnInit {

  constructor(private ngRedux: NgRedux<any>, private router: Router) {
    this.ngRedux.dispatch(ActionGenerator.setAdminMode());
  }

  ngOnInit() {
  }

  goAdminPage() {
    this.router.navigate(['admin']);
  }
}
