import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ProjectService } from '../../../shared/services/project.service';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  pushRightClass = 'push-right';

  public $uns: any = [];

  public props: any = {
    pageTitle: '',
    isTitleEditable: false,
    isProjectTitleEditing: false,
    user: {
      usr_photo: '/assets/avatar.jpg'
    }
  };

  constructor(public router: Router, public service: ProjectService, public userService: UserService) {    
    this.$uns.push(this.userService.onGetUserInformation.subscribe((response) => {
      const success = response.success;
      if (success) {
        this.props.user.usr_name = response.user.usr_name;
        this.props.user.usr_company = response.user.usr_company;
        this.props.user.usr_photo = response.user.usr_profile_path ? response.user.usr_profile_path : '/assets/avatar.jpg';
        this.props.user.usr_role = response.user.usr_role;
      }
    }));
    this.$uns.push(this.service.onChangePageTitle.subscribe((pageData) => {
      this.props.pageTitle = pageData.pageTitle;
      this.props.isTitleEditable = pageData.isTitleEditable;
    }));

    this.$uns.push(this.userService.onUpdateUserProfile.subscribe((message) =>{
      const success = message['success'];
      if (success) {
        this.props.user.usr_photo = message['usr_profile_path'];
      }
    }));
  }

  ngOnInit() {
    this.userService._getUserInformation();
  }

  ngOnDestroy() {
    this.$uns.forEach($uns => {
      $uns.unsubscribe();
    });
  }

  isToggled(): boolean {
    const dom: Element = document.querySelector('body');
    return dom.classList.contains(this.pushRightClass);
  }

  toggleSidebar() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle(this.pushRightClass);
  }

  rltAndLtr() {
    const dom: any = document.querySelector('body');
    dom.classList.toggle('rtl');
  }

  onLoggedout() {
    localStorage.removeItem('isLoggedin');
  }

  editProjectTitle() {
    this.props.isProjectTitleEditing = true;
  }

  saveProjectTitle() {
    if (this.props.pageTitle) {
      this.props.isProjectTitleEditing = false;

      const projectId = this.router.url.split('/')[3];
      this.service._updateProject(projectId, [{name: 'prj_name', value: this.props.pageTitle}]);
    }
  }
}
