import {Component, Input, OnInit, TemplateRef} from '@angular/core';
import {Router} from '@angular/router';
import {ActionGenerator} from '../../../../store/actions/action';
import {NgRedux} from '@angular-redux/store';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  @Input()
  headerTemplate: TemplateRef<any>;

  constructor(private ngRedux: NgRedux<any>, private router: Router) {
  }

  ngOnInit() {
    if (this.router.url.indexOf('recording') >= 0) {
      this.ngRedux.dispatch(ActionGenerator.setAdminMode());
    }
  }


}
