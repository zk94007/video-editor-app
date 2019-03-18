import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';

import * as moment from 'moment';

import { CsVideoPlayerComponent } from './components/cs-video-player/cs-video-player.component';
import { RangeSliderComponent } from '../../shared/module/range-slider/range-slider.component';

@Component({
    selector: 'app-caption-studio',
    templateUrl: 'caption-studio.component.html',
    styleUrls: ['caption-studio.component.scss']
})

export class CaptionStudioComponent implements OnInit {
    public formSubtitle: FormGroup;

    public props = {
        video: {
            sources: [{
                url: 'https://assets.mixkit.co/videos/309/309-720.mp4',
                type: 'video/mp4'
            }],
            duration: null,
            state: null,
            currentTime: null,
            initialTime: 0
        }
    };

    @ViewChild('videoPlayer') public videoPlayer: CsVideoPlayerComponent;

    @ViewChild('videoSlider') public videoSlider: RangeSliderComponent;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private formBuilder: FormBuilder
    ) { }

    ngOnInit() {
        this.formSubtitle = this.formBuilder.group({
            subtitles: this.formBuilder.array([])
        });

        this.changeDetectorRef.detectChanges();

        this.videoPlayer.api.getDefaultMedia().subscriptions.loadedData
            .subscribe(_ => {
                this.addSubtitle(0, this.videoPlayer.api.duration);
            });

        this.videoPlayer.api.getDefaultMedia().subscriptions.timeUpdate
            .subscribe(_ => {
                this.videoSlider.slider.set(this.videoPlayer.api.currentTime);
            });
    }

    public toDuration(seconds = 0) {
        return moment.utc(seconds * 1000).format('mm:ss');
    }

    public addSubtitle(start = 0, end = 60) {
        const control = <FormArray>this.formSubtitle.controls['subtitles'];
        const addrCtrl = this.formBuilder.group({
            text: null,
            duration: [[start, end]]
        });

        control.push(addrCtrl);
    }

    public restartPlay() {
        this.videoPlayer.api.currentTime = 0;
    }

    public seekTime(time) {
        console.log(time);
        // this.videoPlayer.api.seekTime(time);
    }
}
