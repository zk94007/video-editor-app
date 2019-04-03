import { Component, OnInit, HostListener, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit, OnDestroy {
    private padding = 32;
    public props = {
        isInVideoStudio: null,
        isInProject: null,
        isInCaptionStudio: null,
        showGetStartedDialog: null,
        baseUrl: 'https://www.youtube.com/embed/',
        videoId: 'gwuKBkMcUuo',
        videoWidth: 0,
        dontShowAgain: false
    };
    public url;
    public $uns: any = [];

    constructor(private _router: Router, public userService: UserService, private sanitizer: DomSanitizer) {
        const bodyEl: HTMLElement = document.getElementsByTagName('body')[0];
        this.props.isInVideoStudio = _router.url.split('/')[1] === 'video-studio' ? true : false;
        this.props.isInProject = _router.url.split('/')[1] === 'project' ? true : false;
        this.props.isInCaptionStudio = _router.url.split('/')[1] === 'caption-studio' ? true : false;

        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(this.props.baseUrl + this.props.videoId);

        this.$uns.push(this.userService.onGetUserInformation.subscribe((response) => {
            const success = response.success;
            this.props.isInProject = _router.url.split('/')[1] === 'project' ? true : false;
            if (success) {
                if (response.user.usr_is_get_started == false && this.props.isInProject) {
                    this.props.showGetStartedDialog = true;
                    this.props.videoWidth = window.innerWidth * 0.6 < 700 ? window.innerWidth * 0.6 : 700;
                }
            }
        }));
    }

    ngOnInit() {
        this.userService._getUserInformation();
    }

    ngOnDestroy() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }

    closeVideoModal() {
        this.props.showGetStartedDialog = false;
    }

    onDontShowAgain($event) {
        this.props.dontShowAgain = !this.props.dontShowAgain;

        const data = [{ name: 'usr_is_get_started', value: this.props.dontShowAgain }];
        this.userService._updateUser(data);
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
