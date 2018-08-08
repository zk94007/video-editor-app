import { SocketService } from './socket.service';
import { Injectable, EventEmitter } from '@angular/core';

import { environment } from '../../../environments/environment';

let $this: SignService;

@Injectable()
export class SignService {
  public onLogin = new EventEmitter();
  public onSignup = new EventEmitter();
  public onConfirm = new EventEmitter();
  public onForgot = new EventEmitter();
  public onReset = new EventEmitter();

  private front_url = environment.front_url;

  constructor(private socket: SocketService) {
    $this = this;

    this.socket.bind('SIGNIN_RESPONSE', this._loginResponse);
    this.socket.bind('SIGNUP_RESPONSE', this._signupResponse);
    this.socket.bind('CONFIRM_EMAIL_RESPONSE', this._confirmResponse);
    this.socket.bind('FORGET_PASSWORD_RESPONSE', this._forgotResponse);
    this.socket.bind('RESET_PASSWORD_RESPONSE', this._resetResponse);
  }

  /**
   *
   * @param email
   * @param password
   */
  _login(email, password) {
    this.socket.sendMessage('SIGNIN', { usr_email: email, usr_password: password });
  }

  /**
   *
   * @param company
   * @param name
   * @param email
   * @param password
   */
  _signup(company, name, email, password) {
    this.socket.sendMessage('SIGNUP', { company: company, usr_name: name, usr_email: email, usr_password: password, front_path: this.front_url + 'confirm/' });
  }

  /**
   *
   * @param emailCode
   */
  _confirm(emailCode) {
    this.socket.sendMessage('CONFIRM_EMAIL', { uae_code: emailCode });
  }

  /**
   *
   * @param email
   */
  _forgot(email) {
    this.socket.sendMessage('FORGET_PASSWORD', { usr_email: email, front_path: this.front_url + 'password/reset/' });
  }

  /**
   *
   * @param password
   * @param emailCode
   */
  _reset(password, emailCode) {
    this.socket.sendMessage('RESET_PASSWORD', { usr_password: password, uae_code: emailCode });
  }

  _loginResponse(response) {
    if (response.success) {
      const token = response.token;
      localStorage.setItem('token', token);
    }

    $this.onLogin.emit(response);
  }

  _signupResponse(response) {
    $this.onSignup.emit(response);
  }

  _confirmResponse(response) {
    $this.onConfirm.emit(response);
  }

  _forgotResponse(response) {
    $this.onForgot.emit(response);
  }

  _resetResponse(response) {
    $this.onReset.emit(response);
  }
}
