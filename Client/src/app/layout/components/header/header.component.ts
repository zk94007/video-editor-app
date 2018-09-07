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
    isInProjectDetail: false,
    isProjectTitleEditing: false,
    user: {
      usr_name: 'Test',
      usr_photo: '../../assets/avatar.jpg',
      usr_company: 'Blurbiz',
      usr_password: 'password'
    }
  };

  constructor(public router: Router, public service: ProjectService, public userService: UserService) {
    this.props.user.usr_name = localStorage.getItem('usr_name');
    this.props.user.usr_company = localStorage.getItem('usr_company');
    
    if(localStorage.getItem('usr_profile_path') !== 'null') {
      this.props.user.usr_photo = localStorage.getItem('usr_profile_path');
    } else {
      this.props.user.usr_photo = '../../assets/avatar.jpg';
    }
    this.props.isInProjectDetail = this.router.url.split('/')[1] === 'project' && this.router.url.split('/')[2] === 'detail' ? true : false;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.props.isInProjectDetail = event.url.split('/')[1] === 'project' && event.url.split('/')[2] === 'detail' ? true : false;
      }
    });
    this.$uns.push(this.service.onChangePageTitle.subscribe((pageTitle) => {
      this.props.pageTitle = pageTitle;
    }));

    this.$uns.push(this.userService.onUpdateUserProfile.subscribe((message) =>{
      const success = message['success'];
      if (success) {
        this.props.user.usr_photo = message['usr_profile_path'];
      }
    }));
  }

  ngOnInit() {
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
