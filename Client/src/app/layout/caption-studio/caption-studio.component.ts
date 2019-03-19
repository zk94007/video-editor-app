import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';
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
                url: 'https://assets.mixkit.co/videos/99541/99541-720.mp4',
                type: 'video/mp4'
            }],
            duration: null,
            state: null,
            currentTime: null,
            initialTime: 0
        },
        subtitle: {}
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
            text: 'test caption',
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

    public updateStyle(event, subtitle: HTMLElement, videoWrapper: HTMLElement) {
        const subtitleChild: any = subtitle.children[0];

        subtitle.style.fontFamily = event.font.family;
        subtitle.style.fontSize = `${event.font.size}px`;
        subtitle.style.fontWeight = event.font.weight;
        subtitle.style.fontStyle = event.font.style;
        subtitle.style.color = event.font.color;
        subtitle.style.textAlign = event.font.align;
        subtitle.style.alignSelf = event.caption.align;
        subtitle.style.padding = '10px';

        if (subtitle && subtitleChild) {
            subtitle.style.backgroundColor = null;
            subtitle.style.textShadow = null;
            subtitleChild.style.backgroundColor = null;
        }

        if (videoWrapper) {
            videoWrapper.classList.remove(`embed-responsive-1by1`);
            videoWrapper.classList.remove(`embed-responsive-16by9`);
            videoWrapper.classList.remove(`embed-responsive-9by16`);
            videoWrapper.classList.add(`embed-responsive-${event.video.ratio}`);
            videoWrapper.style.backgroundColor = event.video.color.hex;
        }

        switch (event.caption.type) {
            case 'none':
                break;
            case 'outline':
                subtitle.style.textShadow = `-1px -1px 0px ${event.caption.color.hex}, 1px -1px 0px ${event.caption.color.hex}, -1px 1px 0px ${event.caption.color.hex}, 1px 1px 0px ${event.caption.color.hex}`;
                break;
            case 'highlight':
                subtitleChild.style.backgroundColor = event.caption.color.rgba;
                break;
            case 'full':
                subtitle.style.backgroundColor = event.caption.color.rgba;
                break;
            default:
                break;
        }
    }
}
