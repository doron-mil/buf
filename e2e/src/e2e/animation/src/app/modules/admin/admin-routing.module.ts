import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {AuthGuard} from './auth/services/authguard.service';

import {SetBuilderComponent} from './components/set-builder/set-builder.component';
import {AdminLoginComponent} from './components/admin-login/admin-login.component';
import {AnimationComponent} from './components/animation/animation.component';

const routes: Routes = [
  {path: 'admin', component: SetBuilderComponent, canActivate: [AuthGuard]},
  {path: 'login', component: AdminLoginComponent},
  {path: 'logout', component: AdminLoginComponent},
  {path: 'recording', component: AnimationComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {
}
