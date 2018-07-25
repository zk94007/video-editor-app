import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
    public model: any = {};
    public notification: any = {};
    public email_code;

    public $uns: any = [];

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public service: SignService
    ) {
        this.$uns.push(this.route.params.subscribe( params => { this.email_code = params['email_code']; }));
    }

    ngOnInit() {
        this.$uns.push(this.service.onReset.subscribe((message) => {
            const success = message['success'];
            if (success) {
                this.setNotification(true, false, 'Success');
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            } else {
                this.setNotification(false, true, message['msg']);
            }
        }));
    }

    onDestroy() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }
    resetPassword() {
        if (this.model.password === this.model.confirmPassword) {
            this.service._reset(this.model.password, this.email_code);
        } else {
            this.setNotification(false, true, 'Please confirm password');
        }
    }
    setNotification(success, error, msg) {
        this.notification = {
            'success': success,
            'error': error,
            'msg': msg
        };
    }
}
