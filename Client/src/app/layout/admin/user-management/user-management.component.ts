import { Component, OnInit, ViewChild } from '@angular/core';
import { ProjectService } from '../../../shared/services/project.service';
import { NgbPopover } from '../../../../../node_modules/@ng-bootstrap/ng-bootstrap';
import { FormControl } from '../../../../../node_modules/@angular/forms';
import { UserService } from '../../../shared/services/user.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  public props = {

    isUpdatingNow: false,
    deleteConfirmInput: null,
  }

  public user = {
    users: [],
    selectedUsers: [],
    totalUserCount: null,
    signedUpTodayUserCount: null,
    activeUserId: null,
    isDeleteUser: false,
  }

  public member = {
    members: [],
    selectedMembers: [],
    totalMemberCount: null,
    signedUpTodayMemberCount: null,
    activeMemberId: null,
    isDeleteMember: false,

    addMember : {
      isAddMember: false,
      addMemberEmails: [],
      errorMessages: null,
      validators: null
    }
  }

  constructor(private projectService: ProjectService, private userService: UserService) {
    this.user.totalUserCount = 12000;
    this.user.signedUpTodayUserCount = 1000;

    this.user.users = [
      {
        id: 0,
        userInfo: {
          name: 'HeCToR',
          userAvatar: '/assets/avatar.jpg',
          registeredDate: 'Mar 2, 2018'
        },
        usage: {
          usagePercent: 90,
          usagePeriod: 'Jun 11, 2015 - Jul 10, 2015'
        },
        activity: {
          activityType: 'Last login',
          activityContent: '5 minutes ago'
        },
        company: 'Cocacola',
        playOrPause: true
      },
      {
        id: 1,
        userInfo: {
          name: 'Boris',
          userAvatar: '/assets/avatar.jpg',
          registeredDate: 'Mar 2, 2015'
        },
        usage: {
          usagePercent: 60,
          usagePeriod: 'Apr 13, 2016 - Aug 20, 2018'
        },
        activity: {
          activityType: 'Last login',
          activityContent: '5 minutes ago'
        },
        company: 'Apple',
        playOrPause: false
      }
    ];
  
    this.member.totalMemberCount = 12;
    this.member.signedUpTodayMemberCount = 1;

    this.member.members = [
      {
        id: 0,
        memberInfo: {
          name: 'HeCToR',
          memberAvatar: '/assets/avatar.jpg',
          registeredDate: 'Mar 2, 2018'
        },
        usage: {
          usagePercent: 90,
          usagePeriod: 'Jun 11, 2015 - Jul 10, 2015'
        },
        activity: {
          activityType: 'Last login',
          activityContent: '5 minutes ago'
        },
        role: 'Admin',
        status: true,
        playOrPause: true
      },
    ];
  
    this.member.addMember.errorMessages = {
      'emailValidator' : 'Enter valid email address'
    }
    this.member.addMember.validators = [this.emailValidator];
  }

  ngOnInit() {
    this.projectService.changePageTitle({
      pageTitle: 'Admin',
      isTitleEditable: false
    });

    this.userService._getUsers();
  }

  /**
   * 
   * Functions for User Tab
   */


  onActivateUser(event) {
    this.user.activeUserId = event.row.id;
  }

  onDeleteUser() {
    console.log(this.user.activeUserId);

    this.user.isDeleteUser = true;
    this.props.deleteConfirmInput = '';
  }

  onCancelDeleteUser() {
    this.user.isDeleteUser = false;
  }

  onConfirmDeleteUser() {
    this.user.isDeleteUser = false;

    if (this.props.deleteConfirmInput == 'delete') {
      this.props.isUpdatingNow = true;
      // this.userService._deleteUser();
    }
  }

  /**
   * Functions for Member Tab
   */
  onActivateMember(event) {
    this.member.activeMemberId = event.row.id;
  }

  onDeleteMember() {
    console.log(this.member.activeMemberId);

    this.member.isDeleteMember = true;
    this.props.deleteConfirmInput = '';
  }

  onCancelDeleteMember() {
    this.member.isDeleteMember = false;
  }

  onConfirmDeleteMember() {
    this.member.isDeleteMember = false;

    if (this.props.deleteConfirmInput == 'delete') {
      this.props.isUpdatingNow = true;
      // this.memberService._deletemember();
    }
  }

  onAddMember() {
    this.member.addMember.isAddMember = true;
  }

  onCancelAddMember() {
    this.member.addMember.isAddMember = false;
  }

  onConfirmAddMember() {
    this.member.addMember.isAddMember = false;

    console.log(this.member.addMember.addMemberEmails);
    this.member.addMember.addMemberEmails = [];
  }

  /**
   * 
   * Static functions
   */

  toggleOptionPopover(popover) {
    if (popover.isOpen()) {
      popover.close();
    } else {
      popover.open();
    }
  }


  numberFormat(_number, _sep) {
    _number = typeof _number != "undefined" && _number > 0 ? _number : "";
    _number = _number.replace(new RegExp("^(\\d{" + (_number.length%3? _number.length%3:0) + "})(\\d{3})", "g"), "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();
    if(typeof _sep != "undefined" && _sep != " ") {
        _number = _number.replace(/\s/g, _sep);
    }
    return _number;
  }

  nameComparator(propA, propB) {
    if (propA.userName.toLowerCase() < propB.userName.toLowerCase()) return -1;
    if (propA.userName.toLowerCase() > propB.userName.toLowerCase()) return 1;
    return 0;
  }

  usageComparator(propA, propB) {
    if (propA.usagePercent < propB.usagePercent) return -1;
    if (propA.usagePercent > propB.usagePercent) return 1;
    return 0;
  }

  emailValidator(control: FormControl) {
    var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
    if (control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
      return { "emailValidator": true };
    }
    return null
  }
}
