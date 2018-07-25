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

@NgModule({
  imports: [
    CommonModule,
    SignRoutingModule,
    FormsModule,
    NgbPopoverModule.forRoot()
  ],
  providers: [
    SignService
  ],
  declarations: [
    SignComponent,
    LoginComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    SignupComponent,
    ConfirmEmailComponent,
    NotFoundComponent
  ]
})
export class SignModule { }
