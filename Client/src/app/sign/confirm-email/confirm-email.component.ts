import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';
import 'confetti-js';

declare var mixpanel: any;
declare var ConfettiGenerator: any;

@Component({
    selector: 'app-confirm-email',
    templateUrl: './confirm-email.component.html',
    styleUrls: ['./confirm-email.component.scss']
})
export class ConfirmEmailComponent implements OnInit {
    public notification: any = {};
    public email_code;
    public model: any = {};

    public $uns: any = [];

    constructor(
        public route: ActivatedRoute,
        public router: Router,
        public service: SignService
    ) {
        this.$uns.push(this.route.params.subscribe(params => this.confirmEmail(params['email_code'])));
    }

    confirmEmail(code) {
        this.service._confirm(code);
    }

    ngOnInit() {
        this.email_code = this.route.params;

        this._initConfetti();

        this.$uns.push(this.service.onConfirm.subscribe((message) => {
            const success = message['success'];
            if (success) {
                this.notification = {
                    'success': true
                };
                setTimeout(() => {
                    localStorage.setItem('isLoggedin', 'true');
                    localStorage.setItem('token', message['token']);
                    localStorage.setItem('usr_email', message['user'].usr_email);
                    localStorage.setItem('usr_name', message['user'].usr_name);
                    localStorage.setItem('usr_company', message['user'].usr_company);
                    localStorage.setItem('usr_profile_path', message['user'].usr_profile_path);
                    localStorage.setItem('is_confirmed', 'true');
                    localStorage.setItem('is_get_started', 'false');

                    mixpanel.identify(message['user'].usr_email);
                    mixpanel.people.set({
                        '$email': message['user'].usr_email,
                        '$last_login': new Date(),
                    });

                    this.router.navigate(['/project']);
                }, 4000);
            } else {
                this.notification = {
                    'error': message['msg'],
                    'success': false
                };
            }
        }));
    }

    onDestroy() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }

    private _initConfetti() {
        const confettiSettings = {
            target: 'confetti-js',
            max: 300,
            size: 1,
            animate: true,
            props: ['circle', 'square', 'triangle'],
            colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]],
            clock: 25,
            rotate: true
        };
        const confetti = new ConfettiGenerator(confettiSettings);

        confetti.render();
    }
}
