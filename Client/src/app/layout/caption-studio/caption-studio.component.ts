import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Renderer2 } from '@angular/core';
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
                url: 'https://blurbizstagdiag910.blob.core.windows.net/stage/dec369e0-45b0-11e9-ae1d-9f9091396a20.mp4', // 'https://blurbizstagdiag910.blob.core.windows.net/stage/dec369e0-45b0-11e9-ae1d-9f9091396a20.mp4', // 'https://assets.mixkit.co/videos/99541/99541-720.mp4',
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
        private formBuilder: FormBuilder,
        private renderer: Renderer2
    ) { }

    ngOnInit() {
        this.formSubtitle = this.formBuilder.group({
            subtitles: this.formBuilder.array([])
        });

        this.changeDetectorRef.detectChanges();

        this.videoPlayer.api.getDefaultMedia().subscriptions.loadedData
            .subscribe(_ => {
                this.addSubtitle(this.videoPlayer.api.duration);
            });

        this.videoPlayer.api.getDefaultMedia().subscriptions.timeUpdate
            .subscribe(_ => {
                this.videoSlider.slider.set(this.videoPlayer.api.currentTime);
            });
    }

    public toMillisecond(seconds = 0) {
        return moment.utc(seconds * 1000);
    }

    public addSubtitle(totalTime) {
        let startTime;
        let endTime;

        const multiplier = 5;
        const control = <FormArray>this.formSubtitle.controls['subtitles'];

        startTime = control.value.length > 0 ? (control.value[control.value.length - 1].endTime) : 0;
        endTime = control.value.length > 0 ? (control.value[control.value.length - 1].endTime + multiplier) : multiplier;

        if (endTime > totalTime) {
            startTime = 0;
            endTime = multiplier;
        }

        const addrCtrl = this.formBuilder.group({
            text: null,
            startTime: startTime,
            endTime: endTime,
            totalTime: totalTime,
            rangeTime: [[startTime, endTime]],
            resposition: {
                left: null,
                top: null,
                width: null,
                height: null
            },
            dataurl: null
        });

        this.seekTime(endTime);

        control.push(addrCtrl);
    }

    public restartPlay() {
        this.videoPlayer.api.currentTime = 0;
    }

    public seekTime(time) {
        this.videoPlayer.api.currentTime = time;
    }

    public updateStyle(event, subtitle: HTMLElement, videoWrapper) {
        const subtitleChild: any = subtitle.children[0];

        subtitle.style.fontFamily = event.font.family;
        subtitle.style.fontSize = `${event.font.size}px`;
        subtitle.style.fontWeight = event.font.weight;
        subtitle.style.fontStyle = event.font.style;
        subtitle.style.color = event.font.color.hex;
        subtitle.style.textAlign = event.font.align;
        subtitle.style.alignSelf = event.caption.align;
        subtitle.style.padding = '10px';

        if (subtitle && subtitleChild) {
            subtitle.style.backgroundColor = null;
            subtitle.style.textShadow = null;
            subtitleChild.style.backgroundColor = null;
        }

        if (videoWrapper) {
            const ratio = this._aspectRatio(event.video.ratio);

            this.renderer.setStyle(videoWrapper, 'background-color', event.video.color.hex);

            if (event.video.ratio === '16by9') {
                this.renderer.removeStyle(videoWrapper, 'width');
                this.renderer.setStyle(videoWrapper, 'height', `${ratio.ratioHeight}px`);
            } else if (event.video.ratio === '1by1') {
                this.renderer.setStyle(videoWrapper, 'height', `${ratio.ratioWidth}px`);
                this.renderer.setStyle(videoWrapper, 'width', `${ratio.ratioWidth}px`);
            } else if (event.video.ratio === '9by16') {
                this.renderer.setStyle(videoWrapper, 'height', `${ratio.elementHeight}px`);
                this.renderer.setStyle(videoWrapper, 'width', `${ratio.ratioWidth}px`);
            }
        }

        switch (event.caption.type) {
            case 'none':
                break;
            case 'outline':
                subtitle.style.textShadow = `-1px -1px 0px ${event.caption.color.hex},
                                            1px -1px 0px ${event.caption.color.hex},
                                            -1px 1px 0px ${event.caption.color.hex},
                                            1px 1px 0px ${event.caption.color.hex}`;
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

    private _aspectRatio(ratio) {
        const height = 320;
        const width = 428;
        let newWidth;
        let newHeight;

        switch (ratio) {
            case '16by9':
                newWidth = ((1920 / 1080) * height);
                newHeight = ((1080 / 1920) * width);
                break;
            case '9by16':
                newWidth = ((1080 / 1920) * height);
                newHeight = ((1920 / 1080) * width);
                break;
            case '1by1':
                newWidth = ((400 / 400) * height);
                newHeight = ((400 / 400) * width);
                break;
            default:
                break;
        }

        return {
            ratioWidth: newWidth,
            ratioHeight: newHeight,
            elementWidth: width,
            elementHeight: height
        };
    }
}
