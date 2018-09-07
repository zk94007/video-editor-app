import { SocketService } from './socket.service';
import { Injectable, EventEmitter } from '@angular/core';

import { environment } from '../../../environments/environment';

let $this: UserService;

@Injectable()
export class UserService {
  public onUpdateUser = new EventEmitter();
  public onUpdateUserProfile = new EventEmitter();
  public onDeleteUser = new EventEmitter();

  constructor(private socket: SocketService) {
    $this = this;

    this.socket.bind('UPDATE_USER_RESPONSE', this._updateUserResponse);
    this.socket.bind('UPDATE_USER_PROFILE_RESPONSE', this._updateUserProfileResponse);
    this.socket.bind('DELETE_USER_RESPONSE', this._deleteUserResponse);
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
}
