import { Component, OnInit } from '@angular/core';
import { UserService } from '../../shared/services/user.service';
import { Ng5FilesConfig, Ng5FilesService, Ng5FilesSelected, Ng5FilesStatus } from '../../shared/module/ng5-files';
import * as path from 'path';

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
    }
  };

  public fileUploadConfig: Ng5FilesConfig;

  constructor(private userService: UserService, private ng5FilesService: Ng5FilesService) {
    this.fileUploadConfig = {
      acceptExtensions: ['png', 'jpeg', 'jpg'],
      maxFilesCount: 5,
      maxFileSize: 5120000,
      totalFilesSize: 10120000
    };
  }

  ngOnInit() {
    this.origin_user.email = localStorage.getItem('usr_email');
    this.origin_user.name = localStorage.getItem('usr_name');
    this.origin_user.password = localStorage.getItem('usr_password');
    this.origin_user.company = localStorage.getItem('usr_company');

    this.init();

    this.ng5FilesService.addConfig(this.fileUploadConfig);
  }

  init () {
    this.user.email = this.origin_user.email;
    this.user.name = this.origin_user.name;
    this.user.password = this.origin_user.password;
    this.user.company = this.origin_user.company;

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
    const data = [
      {name: 'usr_name', value: this.user.name},
      {name: 'usr_company', value: this.user.company},
      {name: 'usr_email', value: this.user.email},
      {name: 'usr_password', value: this.user.password}
    ];
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

    }
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

            }
        }
    }
  }
}
