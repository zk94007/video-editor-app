import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
    public model: any = {};
    public notification: any = {};

    public $uns;

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public service: SignService,
    ) {}

    ngOnInit() {
        this.$uns = this.service.onForgot.subscribe((message) => {
            const success = message['success'];
                if (success) {
                    console.log('success');
                    this.notification = {
                        'success': true,
                        'error': false,
                        'msg': 'Success, please check your email'
                    };
                } else {
                    this.notification = {
                        'success': false,
                        'error': true,
                        'msg': message['msg']
                    };
                }
        });
    }

    onDestroy() {
        this.$uns.unsubscribe();
    }
    forgotPassword() {
        this.service._forgot(this.model.email);
    }
}
