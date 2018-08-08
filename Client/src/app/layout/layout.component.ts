import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  private padding = 32;
  public props = {
    isInVideoStudio: null,
    showGetStartedDialog: null,
    videoId: 'gwuKBkMcUuo',
    player: null,
    ytEvent: null,
    dontShowAgain: false
  };

  constructor(private _router: Router, public service: UserService) {
    this.props.isInVideoStudio = _router.url.split('/')[1] === 'video-studio' ? true : false;
  }

  ngOnInit() {
    if (localStorage.getItem('is_get_started') == 'false') {
      this.props.showGetStartedDialog = true;
    }
  }

  savePlayer(player) {
    this.props.player = player;
  }

  onStateChange(event) {
    this.props.ytEvent = event.data;
  }

  closeVideoModal() {
    this.props.showGetStartedDialog = false;
    this.props.player.pauseVideo();
  }

  onDontShowAgain($event) {
    this.props.dontShowAgain = !this.props.dontShowAgain;
    localStorage.setItem('is_get_started', '' + this.props.dontShowAgain);

    this.service._updateUser(this.props.dontShowAgain);
  }
  okayIgotIt() {
    this.props.showGetStartedDialog = false;
    this.props.player.pauseVideo();
  }
}
