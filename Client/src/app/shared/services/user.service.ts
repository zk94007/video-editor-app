import { SocketService } from './socket.service';
import { Injectable, EventEmitter } from '@angular/core';

import { environment } from '../../../environments/environment';

let $this: UserService;

@Injectable()
export class UserService {
  public onUpdateUser = new EventEmitter();
  public onUpdateUserProfile = new EventEmitter();
  public onDeleteUser = new EventEmitter();
  public onGetUsers = new EventEmitter();
  public onGetUserInformation = new EventEmitter();
  public onConfirmAdmin = new EventEmitter();
  public onDeleteUserById = new EventEmitter();

  private front_url = environment.front_url;

  constructor(private socket: SocketService) {
    $this = this;

    this.socket.bind('UPDATE_USER_RESPONSE', this._updateUserResponse);
    this.socket.bind('UPDATE_USER_PROFILE_RESPONSE', this._updateUserProfileResponse);
    this.socket.bind('DELETE_USER_RESPONSE', this._deleteUserResponse);
    this.socket.bind('GET_USERS_RESPONSE', this._getUsersResponse);
    this.socket.bind('UPDATE_USER_BY_ID_RESPONSE', this._updateUserByIdResponse);
    this.socket.bind('INVITE_ADMIN_RESPONSE', this._inviteAdminResponse);
    this.socket.bind('CONFIRM_ADMIN_RESPONSE', this._confirmAdminResponse);
    this.socket.bind('DELETE_USER_BY_ID_RESPONSE', this._deleteUserByIdResponse);
    this.socket.bind('GET_USER_INFORMATION_RESPONSE', this._getUserInformationResponse);
  }

  /**
   * 
   * @param isGetStarted 
   */
  _updateUser(data) {
    this.socket.sendMessageWithToken('UPDATE_USER', {data: data });
  }

  /**
   * 
   */
  _getUsers() {
    this.socket.sendMessageWithToken('GET_USERS', {});
  }

  /**
   * 
   * @param usr_id 
   * @param data 
   */
  _updateUserById(usr_id, data) {
    this.socket.sendMessageWithToken('UPDATE_USER_BY_ID', {usr_id: usr_id, data: data});
  }

  /**
   * 
   * @param usr_id 
   */
  _deleteUserById(usr_id) {
    this.socket.sendMessageWithToken('DELETE_USER_BY_ID', {usr_id: usr_id});
  }

  /**
   * 
   * @param usr_id 
   */
  _inviteAdmin(usr_id) {
    this.socket.sendMessageWithToken('INVITE_ADMIN', {usr_id: usr_id, front_path: this.front_url + 'confirm-admin/'});
  }

  /**
   * 
   * @param emailCode 
   */
  _confirmAdmin(emailCode) {
    this.socket.sendMessage('CONFIRM_ADMIN', { uae_code: emailCode });
  }

  _getUserInformation() {
    this.socket.sendMessageWithToken('GET_USER_INFORMATION', {});
  }

  /**
     *
     * @param file     
     * @param metadata = {usr_email: x, guid: x}
     */
  _updateUserProfile(file, metadata) {
    this.socket.sendStream('UPDATE_USER_PROFILE', file, metadata, null);
  }

  _deleteUser() {
    this.socket.sendMessageWithToken('DELETE_USER', {});
  }

  _updateUserResponse(response) {
    $this.onUpdateUser.emit(response);
  }

  _updateUserProfileResponse(response) {
    $this.onUpdateUserProfile.emit(response);
  }

  _deleteUserResponse(response) {
    $this.onDeleteUser.emit(response);
  }

  _getUsersResponse(response) {
    $this.onGetUsers.emit(response);
  }

  _updateUserByIdResponse(response) {
    console.log(response);
  }

  _inviteAdminResponse(response) {
    console.log(response);
  }

  _confirmAdminResponse(response) {
    $this.onConfirmAdmin.emit(response);
  }

  _deleteUserByIdResponse(response) {
    $this.onDeleteUserById.emit(response);
  }

  _getUserInformationResponse(response) {
    $this.onGetUserInformation.emit(response);
  }
}
