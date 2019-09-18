import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SetBuilderComponent} from './components/set-builder/set-builder.component';
import {FieldModule} from '../field/field.module';
import {TeamListComponent} from './components/team-list/team-list.component';
import {MaterialModule} from '../material/material.module';
import {environment} from '../../../environments/environment';
import {AngularFireModule} from '@angular/fire';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFireDatabaseModule} from '@angular/fire/database';
import {EditSetNameDialogComponent} from './dialogs/edit-set-name-dialog/edit-set-name-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MessagesComponent} from './components/messages/messages.component';
import {AdminLoginComponent} from './components/admin-login/admin-login.component';
import {AdminRoutingModule} from './admin-routing.module';
import {AuthGuard} from './auth/services/authguard.service';
import {AnimationComponent} from './components/animation/animation.component';
import {HomeModule} from '../home/home.module';
import {SandboxBottomToolbarModule} from '../sandbox-bottom-toolbar/sandbox-bottom-toolbar.module';


@NgModule({
  declarations: [
    SetBuilderComponent,
    TeamListComponent,
    EditSetNameDialogComponent,
    MessagesComponent,
    AdminLoginComponent,
    AnimationComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AdminRoutingModule,
    MaterialModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    HomeModule,
    FieldModule,
    SandboxBottomToolbarModule,
  ],
  entryComponents: [EditSetNameDialogComponent, MessagesComponent],
  providers: [AuthGuard],
  exports: [AdminLoginComponent]
})
export class AdminModule {
}
