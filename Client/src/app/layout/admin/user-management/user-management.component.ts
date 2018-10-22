import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { ProjectService } from '../../../shared/services/project.service';
import { FormControl } from '@angular/forms';
import { UserService } from '../../../shared/services/user.service';
import { DatePipe } from '@angular/common';

const USER_ROLE_SUPER = 0;
const USER_ROLE_ADMIN = 1;
const USER_ROLE_USER = 2;
const USER_ROLES = ['Super Admin', 'Admin', 'User'];

@Component({
    selector: 'app-user-management',
    templateUrl: './user-management.component.html',
    styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

    public props = {
        currentUserRole: null,
        isUpdatingNow: false,
        deleteConfirmInput: null,
        showMemberPanel: false,
        activeRecordId: null,
        isDeleteRecord: false,

        onlineUsers: null
    }

    public user = {
        users: [],
        selectedUsers: [],
        totalUserCount: null,
        signedUpTodayUserCount: null,
    }

    private temp = [];

    public member = {
        members: [],
        selectedMembers: [],
        totalMemberCount: null,
        signedUpTodayMemberCount: null,

        addMember : {
            isAddMember: false,
            addMemberEmails: [],
            autoCompleteEmails : [],
            errorMessages: null,
            validators: null
        }
    }

    public $uns : any = [];

    constructor(private projectService: ProjectService, private userService: UserService, private cdRef: ChangeDetectorRef, private datePipe: DatePipe) {  

        this.init();

        this.$uns.push(this.userService.onGetUserInformation.subscribe((response) => {
            const success = response.success;
            if (success) {
                this.props.currentUserRole = response.user.usr_role;
                if (this.props.currentUserRole == USER_ROLE_SUPER) {
                    this.props.showMemberPanel = true;
                }
                this.userService._getUsers();
            }
        }));

        this.$uns.push(this.userService.onGetUsers.subscribe((response) => {
            const success = response.success;
            if (success) {
                const current = new Date();
                this.init();

                this.props.onlineUsers = response.online_users;

                if (this.props.currentUserRole == USER_ROLE_ADMIN || this.props.currentUserRole == USER_ROLE_SUPER) {

                    response.users.forEach(user => {
                        const registeredDate = new Date(user.usr_created_at);
                        const lastLoginDate = user.usr_lastlogin_at ? new Date(user.usr_lastlogin_at) : null;

                        let newUser = {
                            id: user.usr_id,
                            name: user.usr_name,
                            email: user.usr_email,
                            activity: {
                                date: lastLoginDate ? this.diffsBetweenDate(current, lastLoginDate) + ' ago' : '',
                                _date: lastLoginDate
                            },
                            created: {
                                date: this.datePipe.transform(registeredDate, 'MMM dd, yyyy'),
                                _date: registeredDate
                            },
                            info: {
                                id: user.usr_id,
                                name: user.usr_name,
                                avatar: user.usr_profile_path ? user.usr_profile_path : '/assets/avatar.jpg',
                                registeredDate: this.datePipe.transform(registeredDate, 'MMM dd, yyyy')
                            },
                            
                            usage: {
                                usagePercent: 90,
                                usagePeriod: 'Jun 11, 2015 - Jul 10, 2015'
                            },
                            lastLoginDate: {
                                diff: lastLoginDate ? this.diffsBetweenDate(current, lastLoginDate) + ' ago' : '',
                                date: lastLoginDate
                            },
                            company: user.usr_company,
                            role: user.usr_role,
                            status: user.usr_admin_status,
                            playOrPause: user.usr_is_allowed
                        }

                        if (user.usr_role == USER_ROLE_ADMIN) {
                            this.member.totalMemberCount ++;
                            if ((new Date()).toDateString() === registeredDate.toDateString()) {
                                this.member.signedUpTodayMemberCount ++;
                            }
                            this.member.members.push(newUser);
                        } else if (user.usr_role == USER_ROLE_USER) {
                            this.user.totalUserCount ++;
                            if ((new Date()).toDateString() === registeredDate.toDateString()) {
                                this.user.signedUpTodayUserCount ++;
                            }
                            this.user.users.push(newUser);
                            this.member.addMember.autoCompleteEmails.push({
                                value: user.usr_email,
                                name: user.usr_name,
                                id: user.usr_id
                            });
                        }
                    });
                }
                this.cdRef.markForCheck();

                this.temp = this.user.users;
            }
        }));

        this.$uns.push(this.userService.onDeleteUserById.subscribe((response) => {
            if (response.success) {
                this.props.isUpdatingNow = false;
                this.userService._getUsers();
            }
        }));
    }

    ngOnInit() {
        this.projectService.changePageTitle({
            pageTitle: 'Admin',
            isTitleEditable: false
        });

        this.userService._getUserInformation();
    }

    init () {
        this.user.users = [];
        this.user.totalUserCount = 0;
        this.user.signedUpTodayUserCount = 0;

        this.member.members = [];
        this.member.totalMemberCount = 0;
        this.member.signedUpTodayMemberCount = 0;

        this.member.addMember.autoCompleteEmails = [];

        this.member.addMember.errorMessages = {
            'emailValidator' : 'Enter valid email address'
        }
        this.member.addMember.validators = [this.emailValidator];
    }

    onPlayOrPause(value) {
        let index = this.user.users.findIndex(user => user.id === this.props.activeRecordId);
        if (index != -1) {
            this.user.users[index].playOrPause = !value;
        } else {
            index = this.member.members.findIndex(member => member.id === this.props.activeRecordId);
            this.member.members[index].playOrPause = !value;
        }
        const data = [{name:'usr_is_allowed', value: !value}];

        this.userService._updateUserById(this.props.activeRecordId, data);
    }

    onActivateRecord(event) {
        this.props.activeRecordId = event.row.id;
    }

    onDeleteRecord() {
        this.props.isDeleteRecord = true;
        this.props.deleteConfirmInput = '';
    }

    onCancelDeleteRecord() {
        this.props.isDeleteRecord = false;
    }

    onConfirmDeleteRecord() {
        this.props.isDeleteRecord = false;

        if (this.props.deleteConfirmInput == 'delete') {
            this.props.isUpdatingNow = true;
            this.userService._deleteUserById(this.props.activeRecordId);
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

        this.member.addMember.addMemberEmails.forEach(user => {
            const index = this.member.addMember.autoCompleteEmails.findIndex(email => email.value === user);
            this.userService._inviteAdmin(this.member.addMember.autoCompleteEmails[index].id);
        });
        this.member.addMember.addMemberEmails = [];
    }

    isOnlineUser(id) {
        return this.props.onlineUsers.findIndex(user => user.usr_id == id) != -1 ? true : false;
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
        if (_number == 0) {
            return 0;
        }
        _number = typeof _number != "undefined" && _number > 0 ? _number : "";
        _number = _number.replace(new RegExp("^(\\d{" + (_number.length%3? _number.length%3:0) + "})(\\d{3})", "g"), "$1 $2").replace(/(\d{3})+?/gi, "$1 ").trim();

        if(typeof _sep != "undefined" && _sep != " ") {
            _number = _number.replace(/\s/g, _sep);
        }
        return _number;
    }

    diffsBetweenDate(date1, date2) {
        var diffMs = (date1 - date2); // milliseconds between now & Christmas
        var diffDays = Math.floor(diffMs / 86400000); // days
        var diffHrs = Math.floor((diffMs % 86400000) / 3600000); // hours
        var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
        var diffSecs = Math.round((((diffMs % 86400000) % 3600000) % 60000) / 1000); // seconds

        var returnValue = '';
        if (diffDays != 0) {
            returnValue += diffDays;
            returnValue += (diffDays == 1) ? ' day ' : ' days ';
        }
        if (diffHrs != 0) {
            returnValue += diffHrs;
            returnValue += (diffHrs == 1) ? ' hour ' : ' hours ';
        }
        if (diffMins != 0) {
            returnValue += diffMins;
            returnValue += (diffMins == 1) ? ' minute ' : ' minutes ';
        }
        if (diffDays == 0 && diffHrs == 0 && diffMins == 0 && diffSecs != 0) {
            returnValue = diffSecs + ' seconds';
        }
        return returnValue;
    }

    nameComparator(propA, propB) {
        if (!propA.name) return -1;
        if (!propB.name) return 1;
        if (propA.name.toLowerCase() < propB.name.toLowerCase()) return -1;
        if (propA.name.toLowerCase() > propB.name.toLowerCase()) return 1;
        return 0;
    }

    usageComparator(propA, propB) {
        if (propA.usagePercent < propB.usagePercent) return -1;
        if (propA.usagePercent > propB.usagePercent) return 1;
        return 0;
    }

    activityComparator(propA, propB) {
        if (propA.date < propB.date) return -1;
        if (propA.date > propB.date) return 1;
        return 0;
    }

    emailValidator(control: FormControl) {
        var EMAIL_REGEXP = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
        if (control.value != "" && (control.value.length <= 5 || !EMAIL_REGEXP.test(control.value))) {
            return { "emailValidator": true };
        }
        return null;
    }

    updateFilter(event) {
        const val = event.target.value.toLowerCase();

        const temp = this.temp.filter(function(d) {
            if (!val) return true;
            if (d.name && d.name.toLowerCase().indexOf(val) !== -1)
                return true;
            if (d.email && d.email.toLowerCase().indexOf(val) !== -1)
                return true;
            if (d.company && d.company.toLowerCase().indexOf(val) !== -1)
                return true;
        });

        this.user.users = temp;
    }
}
