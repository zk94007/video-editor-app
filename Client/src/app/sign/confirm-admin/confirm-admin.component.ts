import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { UserService } from '../../shared/services/user.service';

declare var mixpanel: any;

@Component({
  selector: 'app-confirm-admin',
  templateUrl: './confirm-admin.component.html',
  styleUrls: ['./confirm-admin.component.scss']
})
export class ConfirmAdminComponent implements OnInit {
  public notification: any = {};
  public email_code;
  public model: any = {};

  public $uns: any = [];

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public service: UserService
  ) {
    this.$uns.push(this.route.params.subscribe( params => this.confirmAdmin(params['email_code'])));
  }

  confirmAdmin(code) {
    this.service._confirmAdmin(code);
  }

  ngOnInit() {
    this.email_code = this.route.params;

    this.$uns.push(this.service.onConfirmAdmin.subscribe((message) => {
      const success = message['success'];
      if (success) {
        this.notification = {
          'success': true
        };
        setTimeout(() => {
          this.router.navigate(['/project']);
        }, 3000);
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
