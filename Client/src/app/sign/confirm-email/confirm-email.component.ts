import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';

declare var mixpanel: any;

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
    this.$uns.push(this.route.params.subscribe( params => this.confirmEmail(params['email_code'])));
  }

  confirmEmail(code) {
    this.service._confirm(code);
  }

  ngOnInit() {
    this.email_code = this.route.params;

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
          localStorage.setItem('is_confirmed', 'true');
          localStorage.setItem('is_get_started', 'false');
          
          // mixpanel.track("UserLogin");
          mixpanel.identify(message['user'].usr_email);
          mixpanel.people.set({
              "$email": message['user'].usr_email,
              "$last_login": new Date(),
              "$company": message['user'].usr_company,
              "$name": message['user'].usr_name,
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
}
