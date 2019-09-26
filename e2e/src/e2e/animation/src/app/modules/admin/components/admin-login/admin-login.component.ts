import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../../auth/services/auth.service';
import {ActionGenerator} from '../../../../store/actions/action';
import {Router} from '@angular/router';

const EMAIL_PROPERTY_NAME = 'email';
const PASSWORD_PROPERTY_NAME = 'password';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {

  loginForm: FormGroup;
  showSpinner = false;

  constructor(private authService: AuthService, private router: Router) {
  }

  ngOnInit() {
    if (this.router.url.indexOf('logout') >= 0) {
      this.authService.signOut();
    }

    this.showSpinner = false;
    this.loginForm = new FormGroup({
      email: new FormControl('tester@test.com', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('123456', Validators.required)
    });

  }

  onSubmit() {
    const email = this.loginForm.value[EMAIL_PROPERTY_NAME];
    const password = this.loginForm.value[PASSWORD_PROPERTY_NAME];
    this.authService.signIn(email, password).catch((error) => {
      console.error('Failed to login', error);
      this.showSpinner = false;
    });
    this.showSpinner = true;
  }
}
