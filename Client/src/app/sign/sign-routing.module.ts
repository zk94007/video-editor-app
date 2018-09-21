import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SignComponent } from './sign.component';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SignupComponent } from './signup/signup.component';
import { ConfirmEmailComponent } from './confirm-email/confirm-email.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ResendComponent } from './resend/resend.component';
import { ConfirmAdminComponent } from './confirm-admin/confirm-admin.component';

const routes: Routes = [
    {
        path: '', component: SignComponent,
        children: [
            {path: '', redirectTo: 'login'},
            {path: 'login', component: LoginComponent},
            {path: 'forgot-password', component: ForgotPasswordComponent},
            {path: 'resend', component: ResendComponent},
            {path: 'password/reset/:email_code', component: ResetPasswordComponent},
            {path: 'signup', component: SignupComponent},
            {path: 'confirm/:email_code', component: ConfirmEmailComponent},
            {path: 'confirm-admin/:email_code', component: ConfirmAdminComponent},
            {path: 'not-found', component: NotFoundComponent},
            {path: '**', redirectTo: 'not-found'}
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SignRoutingModule {}
