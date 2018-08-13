import { Component, OnInit, ViewChild } from '@angular/core';
import { NgbPopover } from '@ng-bootstrap/ng-bootstrap';
import { Router, ActivatedRoute } from '@angular/router';
import { SignService } from '../../shared/services/sign.service';

declare var mixpanel: any;

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  @ViewChild('popoverCompany') private popover_company: NgbPopover;
  @ViewChild('popoverName') private popover_name: NgbPopover;
  @ViewChild('popoverEmail') private popover_email: NgbPopover;
  @ViewChild('popoverPassword') private popover_password: NgbPopover;

  public isDisabled = false;
  public model: any = {};
  public notification: any = {};
  public returnUrl = '/project';
  public $uns;

  public loading;
  public display_backdrop;

  constructor(
    public route: ActivatedRoute,
    public router: Router,
    public service: SignService
  ) {}

  ngOnInit() {
      this.loading = false;
      this.display_backdrop = 'none';

      // this.connection = this.service.getResponse('SIGNUP_RESPONSE').subscribe(message => {
      //     this.loading = false;
      //     this.display_backdrop = 'none';

      //     const success = message['success'];
      //     if (success) {
      //         this.notification = {
      //             'success': message['msg']
      //         };
      //     } else {
      //         this.notification = {
      //             'error': message['msg'],
      //             'success': false
      //         };
      //     }
      // });

      this.$uns = this.service.onSignup.subscribe((message) => {
        this.loading = false;
        this.display_backdrop = 'none';

        const success = message['success'];
        if (success) {
            this.notification = {
                'success': message['msg']
            };
        } else {
            this.notification = {
                'error': message['msg'],
                'success': false
            };
        }
      });
  }

  onDestroy() {
      this.$uns.unsubscribe();
  }

  signup() {
    if (!this.model.company) {
        this.popover_company.open();
    } else if (!this.model.name) {
        this.popover_name.open();
    } else if (!this.model.email) {
        this.popover_email.open();
    } else if (!this.model.password) {
        this.popover_password.open();
    } else {
        
        // mixpanel.track("UserLogin");
        mixpanel.people.set({
            "$email": this.model.email,
            "$company": this.model.company,
            "$name": this.model.name,
            "$created": new Date(),
        });

        this.service._signup(this.model.company, this.model.name, this.model.email, this.model.password);
        this.loading = true;
        this.display_backdrop = 'block';
      }
  }
}

