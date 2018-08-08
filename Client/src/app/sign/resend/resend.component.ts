import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';

@Component({
  selector: 'app-resend',
  templateUrl: './resend.component.html',
  styleUrls: ['./resend.component.scss']
})
export class ResendComponent implements OnInit {
    public model: any = {};
    public notification: any = {};

    public $uns;

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public service: SignService,
    ) {}

    ngOnInit() {
        this.$uns = this.service.onResend.subscribe((message) => {
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
    resend() {
        this.service._resend(this.model.email);
    }
}
