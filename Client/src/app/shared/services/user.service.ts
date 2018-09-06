import { SocketService } from './socket.service';
import { Injectable, EventEmitter } from '@angular/core';

import { environment } from '../../../environments/environment';

let $this: UserService;

@Injectable()
export class UserService {
  public onUpdateProject = new EventEmitter();

  constructor(private socket: SocketService) {
    $this = this;

    this.socket.bind('UPDATE_USER_RESPONSE', this._updateUserResponse);
  }

  /**
   * 
   * @param isGetStarted 
   */
  _updateUser(data) {
    this.socket.sendMessageWithToken('UPDATE_USER', {data: data });
  }

  _updateUserResponse(response) {
    $this.onUpdateProject.emit(response);
  }
}
