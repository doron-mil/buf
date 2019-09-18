import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './modules/home/components/home/home.component';
import {AdminLoginComponent} from './modules/admin/components/admin-login/admin-login.component';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: AdminLoginComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
