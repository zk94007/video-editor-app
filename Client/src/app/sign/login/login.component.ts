import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

declare var mixpanel: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
    @ViewChild('popoverEmail') private popover_email: NgbPopover;
    @ViewChild('popoverPassword') private popover_password: NgbPopover;

    public model: any = {};
    public notification: any = {};
    public returnUrl = '/project';
    public showResend = false;

    public $uns: any = [];

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public service: SignService
    ) {}

    ngOnInit() {
        this.showResend = false;
        this.$uns.push(this.service.onLogin.subscribe((response) => {
            const success = response['success'];
            if (success) {
                if (response['token'] != null) {
                    localStorage.setItem('usr_email', response.user.usr_email);
                    localStorage.setItem('usr_name', response.user.usr_name);
                    localStorage.setItem('usr_password', response.user.usr_password);
                    localStorage.setItem('usr_company', response.user.usr_company);
                    localStorage.setItem('usr_profile_path', response.user.usr_profile_path);
                    localStorage.setItem('token', response['token']);
                    localStorage.setItem('is_confirmed', response['usr_is_verified']);
                    localStorage.setItem('is_get_started', response['usr_is_get_started']);

                    localStorage.setItem('isLoggedin', 'true');

                    mixpanel.identify(response.user.usr_email);
                    mixpanel.people.set({
                        "$email": response.user.usr_email,
                        "$last_login": new Date(),
                    });

                    this.router.navigate([this.returnUrl]);
                } else {
                    this.notification = {
                        'error': 'Please check your email.',
                        'success': false
                    };
                    this.showResend = true;
                }
            } else {
                this.notification = {
                    'error': response['msg'],
                    'success': false
                };
            }
        }));
    }

    ngOnDestroy() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }
    login() {
        if (!this.model.email) {
            this.popover_email.open();
        } else if (!this.model.password) {
            this.popover_password.open();
        } else {
            this.service._login(this.model.email, this.model.password);
        }
    }
}
