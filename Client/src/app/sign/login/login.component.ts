import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';

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

    public $uns: any = [];

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public service: SignService
    ) {}

    ngOnInit() {
        this.$uns.push(this.service.onLogin.subscribe((response) => {
            const success = response['success'];
            if (success) {
                console.log(response);
                if (response['token']) {
                    localStorage.setItem('usr_name', response.user.usr_name);
                    localStorage.setItem('usr_password', response.user.usr_password);
                    localStorage.setItem('usr_company', response.user.usr_company);
                    localStorage.setItem('token', response['token']);
                    localStorage.setItem('is_confirmed', response['usr_is_verified']);

                    localStorage.setItem('isLoggedin', 'true');
                    this.router.navigate([this.returnUrl]);
                } else {
                    console.log('EROOR: token is null');
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
            console.log(this.model.email);
            this.service._login(this.model.email, this.model.password);
        }
    }
}
