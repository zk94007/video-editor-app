import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  private padding = 32;
  public props = {
    isInVideoStudio: null,
    isInProject: null,
    showGetStartedDialog: null,
    baseUrl: 'https://www.youtube.com/embed/',
    videoId: 'gwuKBkMcUuo',
    videoWidth: 0,
    dontShowAgain: false
  };
  public url;

  constructor(private _router: Router, public service: UserService, private sanitizer: DomSanitizer) {
    this.props.isInVideoStudio = _router.url.split('/')[1] === 'video-studio' ? true : false;
    this.props.isInProject = _router.url.split('/')[1] === 'project' ? true : false;

    this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.props.baseUrl + this.props.videoId);
  }

  ngOnInit() {
    if (localStorage.getItem('is_get_started') == 'false' && this.props.isInProject) {
      this.props.showGetStartedDialog = true;
      this.props.videoWidth = window.innerWidth * 0.6 < 700 ? window.innerWidth * 0.6 : 700;
    }
  }

  closeVideoModal() {
    this.props.showGetStartedDialog = false;
  }

  onDontShowAgain($event) {
    this.props.dontShowAgain = !this.props.dontShowAgain;
    localStorage.setItem('is_get_started', '' + this.props.dontShowAgain);

    const data = [{name:'usr_is_get_started', value: this.props.dontShowAgain}];
    this.service._updateUser(data);
  }
  okayIgotIt() {
    this.props.showGetStartedDialog = false;
  }
  
  // Resize event interaction
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.props.videoWidth = window.innerWidth * 0.6 < 700 ? window.innerWidth * 0.6 : 700;
  }
}
