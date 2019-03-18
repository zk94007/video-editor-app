import { Component, OnInit, Input } from '@angular/core';
import { VgAPI } from 'videogular2/core';

@Component({
    selector: 'app-cs-video-player',
    templateUrl: 'cs-video-player.component.html',
    styleUrls: ['cs-video-player.component.scss']
})

export class CsVideoPlayerComponent implements OnInit {
    public api: VgAPI;

    @Input() public sources: Array<any> = [];

    get currentTime() {
        return this.api.currentTime.toFixed(2);
    }

    get duration() {
        return this.api.duration.toFixed(2);
    }

    constructor() { }

    ngOnInit() { }

    public videoReady(api: VgAPI) {
        this.api = api;
    }

    public play() {
        this.api.play();
    }

    public pause() {
        this.api.pause();
    }
}
