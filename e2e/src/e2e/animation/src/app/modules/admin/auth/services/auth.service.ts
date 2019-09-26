import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Router} from '@angular/router';
import {AngularFireAuth} from '@angular/fire/auth';
import {LoggedInInterface} from '../../shared/dataModels/auth.model';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  isLoggedIn = new BehaviorSubject<LoggedInInterface>({
    isLogged: false,
    data: null
  });

  constructor(private firabaseAuth: AngularFireAuth, private router: Router) {
    this.firabaseAuth.authState.subscribe(state => {
      if (state != null) {
        this.isLoggedIn.next({isLogged: true, data: state.providerData[0]});
      } else {
        this.isLoggedIn.next({isLogged: false, data: null});
      }
    });
  }

  signIn(email: string, password: string): Promise<boolean> {
    console.log('sign in', `${email}`);
    return new Promise<boolean>((resolve, reject) => {
      this.firabaseAuth.auth.signInWithEmailAndPassword(email.replace( /.{6}/ , '$&1' ), password)
        .then(response => {
          console.log('AuthService.signIn => Success');
          resolve(true);
          this.router.navigate(['admin']);
        })
        .catch(error => {
          console.log(error);
          alert(error.message);
          reject(error);
          this.router.navigate(['login'], {replaceUrl: true});
        });
    });
  }

  signOut(aNeedsNavigates = true) {
    this.firabaseAuth.auth.signOut().then(() => {
      if (aNeedsNavigates) {
        return this.router.navigate(['login']);
      }
    });
  }

  getLoginStatus(): LoggedInInterface {
    return this.isLoggedIn.getValue();
  }
}
