import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignupComponent } from './signup/signup.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { SignRoutingModule } from './sign-routing.module';
import { SignComponent } from './sign.component';
import { FormsModule } from '@angular/forms';
import { NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { SignService } from '../shared/services/sign.service';
import { ResendComponent } from './resend/resend.component';
import { ConfirmAdminComponent } from './confirm-admin/confirm-admin.component';
import { UserService } from '../shared/services/user.service';

@NgModule({
  imports: [
    CommonModule,
    SignRoutingModule,
    FormsModule,
    NgbPopoverModule.forRoot()
  ],
  providers: [
    SignService,
    UserService
  ],
  declarations: [
    SignComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ResendComponent,
    ResetPasswordComponent,
    SignupComponent,
    ConfirmEmailComponent,
    ConfirmAdminComponent,
    NotFoundComponent
  ]
})
export class SignModule { }
