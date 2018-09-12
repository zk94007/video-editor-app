import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Ng5FilesConfig, Ng5FilesService, Ng5FilesSelected, Ng5FilesStatus } from '../../shared/module/ng5-files';
import * as path from 'path';
import { Router } from '../../../../node_modules/@angular/router';
import { ProjectService } from '../../shared/services/project.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

  public user: any = {};
  public origin_user: any = {};
  public notification: any = {};

  public props: any = {
    upload: {
      selectedFiles: null
    },
    isChangingPassword: false,
    isInfoChanged: false,
    isDeleteAccount: 'none',
    isChangeAccount: 'none',
    isUpdatingNow: false,
    deleteConfirmInput: ''
  };

  public $uns: any = [];

  public fileUploadConfig: Ng5FilesConfig;

  constructor(private userService: UserService, private projectService: ProjectService, private ng5FilesService: Ng5FilesService, private router: Router) {
    this.fileUploadConfig = {
      acceptExtensions: ['png', 'jpeg', 'jpg'],
      maxFilesCount: 5,
      maxFileSize: 5120000,
      totalFilesSize: 10120000
    };
  }

  ngOnInit() {
    this.init();

    this.ng5FilesService.addConfig(this.fileUploadConfig);
    this.projectService.changePageTitle({
      pageTitle: 'Settings',
      isTitleEditable: false
    });

    this.$uns.push(this.userService.onUpdateUserProfile.subscribe((message) =>{
      const success = message['success'];
      if (success) {
        this.props.isUpdatingNow = false;
        localStorage.setItem('usr_profile_path', message['usr_profile_path']);
        this.user.avatar = message['usr_profile_path'];
      }
    }));

    this.$uns.push(this.userService.onUpdateUser.subscribe((message) =>{
      const success = message['success'];
      if (success) {
        this.props.isUpdatingNow = false;

        localStorage.setItem('usr_email', this.user.email);
        localStorage.setItem('usr_name', this.user.name);
        localStorage.setItem('usr_company', this.user.company);

        if (this.props.isChangingPassword == true) {
          localStorage.setItem('usr_password', this.user.new_password);
          this.props.isChangingPassword = false;
        }

        this.init();
      }
    }));

    this.$uns.push(this.userService.onDeleteUser.subscribe((message) => {
      const success = message['success'];
      if (success) {
        this.props.isUpdatingNow = false;
        localStorage.clear();
        this.router.navigate(['/login']);
      }
    }));
  }

  init () {
    this.origin_user.email = localStorage.getItem('usr_email');
    this.origin_user.name = localStorage.getItem('usr_name');
    this.origin_user.password = localStorage.getItem('usr_password');
    this.origin_user.company = localStorage.getItem('usr_company');
    this.origin_user.avatar = localStorage.getItem('usr_profile_path');
    this.origin_user.avatar == 'null' ? this.origin_user.avatar = '../../assets/avatar.jpg' : null;

    this.user.email = this.origin_user.email;
    this.user.name = this.origin_user.name;
    this.user.password = this.origin_user.password;
    this.user.company = this.origin_user.company;
    this.user.avatar = this.origin_user.avatar;

    this.props.isChangingPassword = false;
    this.props.isInfoChanged = false;
    this.props.isDeleteAccount = 'none';

    this.props.deleteConfirmInput = '';
  }
  onPasswordChange() {
    this.props.isChangingPassword = true;
    this.props.isInfoChanged = true;
    this.user.password = "";
    this.user.new_password = "";
  }

  onNameChange() {
    this.props.isInfoChanged = true;
  }

  onCompanyChange() {
    this.props.isInfoChanged = true;
  }

  onEmailChange() {
    this.props.isInfoChanged = true;
  }

  onCancelChange() {
    this.init();
  }

  onSubmitChange() {
    this.props.isChangeAccount = 'block';
  }

  onDeleteAccount() {
    this.props.isDeleteAccount = 'block';
    this.props.deleteConfirmInput = '';
  }

  onCancelDeleteAccount() {
    this.props.isDeleteAccount = 'none';
  }

  onConfirmDeleteAccount() {
    this.props.isDeleteAccount = 'none';

    if (this.props.deleteConfirmInput == 'delete') {
      this.props.isUpdatingNow = true;
      this.userService._deleteUser();
    }
  }

  onCancelChangeAccount() {
    this.props.isChangeAccount = 'none';
  }

  onConfirmChangeAccount() {
    this.props.isChangeAccount = 'none';

    let data = [
      {name: 'usr_name', value: this.user.name},
      {name: 'usr_company', value: this.user.company},
      {name: 'usr_email', value: this.user.email}
    ];

    if (this.props.isChangingPassword == true) {
      if (this.user.password === this.origin_user.password) {
        data.push({name: 'usr_password', value: this.user.new_password});
      } else {
        this.notification.error = "Your old password is wrong. Please retype.";
        return;
      }
    }

    this.props.isUpdatingNow = true;
    this.userService._updateUser(data);
  }

  filesSelect(selectedFiles: Ng5FilesSelected): void {
    if (selectedFiles.status !== Ng5FilesStatus.STATUS_SUCCESS) {
        this.props.upload.selectedFiles = selectedFiles.status;
    }
    this.props.upload.selectedFiles = Array.from(selectedFiles.files);
    for (let i = 0; i < this.props.upload.selectedFiles.length; i ++) {
        const file = this.props.upload.selectedFiles[i];
        const ext = path.extname(file.name).toLowerCase();
        if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
            if (!file.$error) {
              this.props.isUpdatingNow = true;
              this.userService._updateUserProfile(file, {usr_email: this.user.email});
            }
        }
    }
  }
}
