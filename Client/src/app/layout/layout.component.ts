import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  public props = {
    isInVideoStudio: null,
    showGetStartedDialog: null,
    videoId: 'gwuKBkMcUuo',
    player: null,
    ytEvent: null
  }

  constructor(private _router: Router) {
    this.props.isInVideoStudio = _router.url.split('/')[1] === 'video-studio' ? true : false;
  }

  ngOnInit() {
    this.props.showGetStartedDialog = true;
  }

  savePlayer(player) {
    this.props.player = player;
  }

  onStateChange(event) {
    this.props.ytEvent = event.data;
  }

}
