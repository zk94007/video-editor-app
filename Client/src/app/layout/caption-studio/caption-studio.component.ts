import { Component, OnInit, ViewChild, ChangeDetectorRef, ElementRef, Renderer2, QueryList, ViewChildren, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';

import * as moment from 'moment';
import { forkJoin, of } from 'rxjs';
import { tap, withLatestFrom, map, mergeMap, switchMap, concatMap } from 'rxjs/operators';
import { parse } from 'subtitle';

import { CsVideoPlayerComponent } from './components/cs-video-player/cs-video-player.component';
import { RangeSliderComponent } from '../../shared/module/range-slider/range-slider.component';
import { CsSubtitleTextItemComponent } from './components/cs-subtitle-text-item/cs-subtitle-text-item.component';

import { VideoStudioService } from '../../shared/services/video-studio.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CsSubtitleToolabarComponent } from './components';

@Component({
    selector: 'app-caption-studio',
    templateUrl: 'caption-studio.component.html',
    styleUrls: ['caption-studio.component.scss']
})

export class CaptionStudioComponent implements OnInit, OnDestroy {
    public formSubtitle: FormGroup;

    public props = {
        video: {
            sources: [{
                url: '',
                type: 'video/mp4',
                resolution: {}
            }],
            duration: null,
            state: null,
            currentTime: null,
            initialTime: 0
        },
        style: null,
        prj_id: null,
        complete: false,
        progress: null,
        response: null
    };

    public $uns: any = [];

    @ViewChild('videoPlayer') public videoPlayer: CsVideoPlayerComponent;

    @ViewChild('videoSlider') public videoSlider: RangeSliderComponent;

    @ViewChild('videoWrapper') public videoWrapper: ElementRef;

    @ViewChild(CsSubtitleToolabarComponent) public subtitleToolbar: CsSubtitleToolabarComponent;

    @ViewChildren(CsSubtitleTextItemComponent) public subtitleTextItem: QueryList<CsSubtitleTextItemComponent>;

    constructor(
        private changeDetectorRef: ChangeDetectorRef,
        private formBuilder: FormBuilder,
        private renderer: Renderer2,
        private vsService: VideoStudioService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        this.route.params.subscribe((res) => {
            this.props.prj_id = res.prj_id;
            this.vsService._getVideoForCaption(this.props.prj_id);
        });
    }

    ngOnInit() {
        this.formSubtitle = this.formBuilder.group({
            prj_id: this.props.prj_id,
            background: this.formBuilder.group({
                color: null
            }),
            scene_ratio: null,
            subtitles: this.formBuilder.array([])
        });

        this.$uns.push(this.vsService.onUploadSubtitlesResponse.subscribe((response) => {
            this.props.response = response;
        }));

        this.$uns.push(this.vsService.onUploadSubtitlesProgress.subscribe((response) => {
            this.props.progress = response;
        }));

        this.changeDetectorRef.detectChanges();

        this.$uns.push(this.vsService.onGetVideoForCaption
            .pipe(
                tap((videoCaption) => this.updateVideoSource(videoCaption)),
                concatMap((videoCaption) => {
                    return this.videoPlayer.api.getDefaultMedia().subscriptions.loadedData.pipe(
                        map(() => videoCaption)
                    );
                }),
                tap((videoCaption: any) => {
                    if (videoCaption.subtitles && videoCaption.subtitles.length > 0) {
                        const { caption, font, video } = videoCaption.subtitles[0];

                        this.subtitleToolbar.props = { caption, font, video };
                        this.updateStyle({ caption, font, video });
                        this._loadSubtitle(videoCaption.subtitles, this.videoPlayer.api.duration);
                    } else {
                        this.addSubtitle(this.videoPlayer.api.duration);
                    }
                })

            )
            .subscribe()
        );

        this.$uns.push(this.videoPlayer.api.getDefaultMedia().subscriptions.timeUpdate
            .subscribe(_ => {
                this.props.video.currentTime = this.videoPlayer.api.currentTime;
            })
        );

        this.$uns.push(this.videoPlayer.api.getDefaultMedia().subscriptions.seeking
            .subscribe(_ => {
                if (this.videoSlider) {
                    this.videoSlider.slider.set(this.videoPlayer.api.currentTime);
                }
            }));
    }

    ngOnDestroy() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }

    public closeCompletePage() {
        this.props.complete = false;
        this.props.response = null;
        this.props.progress = null;
    }

    public updateVideoSource(video) {
        this.props.video.sources.splice(0, 1);
        this.props.video.sources.push({
            url: video.video_path,
            resolution: video.resolution,
            type: 'video/mp4'
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
            text: [null, Validators.required],
            startTime: startTime,
            endTime: endTime,
            totalTime: totalTime,
            rangeTime: [[startTime, endTime]],
            reposition: {
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

    public updateStyle(event) {
        const videoWrapper = this.videoWrapper.nativeElement;
        const newRatio = { '16by9': 169, '1by1': 11, '9by16': 916 };
        this.props.style = {...event};

        this.formSubtitle.patchValue({
            background: {
                color: event.video.color.hex
            },
            scene_ratio: newRatio[event.video.ratio],
        });

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
    }

    private _aspectRatio(ratio) {
        const height = 320;
        const width = 460;
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

    private _loadSubtitle(subtitles: Array<any>, totalTime?) {
        const control = <FormArray>this.formSubtitle.controls['subtitles'];

        subtitles.forEach(subtitle => {
            control.push(this.formBuilder.group({
                text: subtitle.text,
                startTime: subtitle.startTime,
                endTime: subtitle.endTime,
                totalTime: totalTime || this.videoPlayer.api.duration,
                rangeTime: [[subtitle.startTime, subtitle.endTime]],
                reposition: {
                    left: subtitle.reposition.left,
                    top: subtitle.reposition.top,
                    width: subtitle.reposition.width,
                    height: subtitle.reposition.height
                },
                dataurl: null
            }));
        });
    }

    public srtFileSelected(event) {
        const fileReader = new FileReader();
        const file = event.files[0];
        const control = <FormArray>this.formSubtitle.controls['subtitles'];

        fileReader.onload = (fileLoadedEvent: any) => {
            const fileContent = fileLoadedEvent.target.result;

            while (control.length !== 0) {
                control.removeAt(0);
            }

            parse(fileContent).forEach(srt => {
                control.push(this.formBuilder.group({
                    text: srt.text,
                    startTime: (srt.start / 1000),
                    endTime: (srt.end / 1000),
                    totalTime: this.videoPlayer.api.duration,
                    rangeTime: [[(srt.start / 1000), (srt.end / 1000)]],
                    reposition: {
                        left: null,
                        top: null,
                        width: null,
                        height: null
                    },
                    dataurl: null
                }));
            });
        };

        fileReader.readAsText(file, 'UTF-8');
    }

    public complete() {
        this.props.complete = true;

        this.$uns.push(forkJoin(this.subtitleTextItem.map(subtitle => subtitle.process(this.props.video.sources[0])))
            .pipe(
                tap(() => {
                    const subtitlesWithDataUrl = this.formSubtitle.get('subtitles').value.map(subtitle => {
                        return {
                            startTime: subtitle.startTime,
                            endTime: subtitle.endTime,
                            dataurl: subtitle.dataurl,
                            reposition: subtitle.reposition
                        };
                    });

                    const subtitlesWithoutDataUrl = this.formSubtitle.get('subtitles').value.map(subtitle => {
                        return {
                            startTime: subtitle.startTime,
                            endTime: subtitle.endTime,
                            dataurl: subtitle.dataurl,
                            reposition: subtitle.reposition,
                            text: subtitle.text,
                            font: {
                                family: this.props.style.font.family,
                                size: this.props.style.font.size,
                                color: {
                                    hex: this.props.style.font.color.hex,
                                    rgba: this.props.style.font.color.rgba
                                },
                                weight: this.props.style.font.weight,
                                style: this.props.style.font.style,
                                align: this.props.style.font.align
                            },
                            caption: {
                                type: this.props.style.caption.type,
                                color: {
                                    hex: this.props.style.caption.color.hex,
                                    rgba: this.props.style.caption.color.rgba // 'rgba(0, 0, 0, 0.7)'
                                },
                                align: this.props.style.caption.align
                            },
                            video: {
                                ratio: this.props.style.video.ratio,
                                color: {
                                    hex: this.props.style.video.color.hex,
                                    rgba: this.props.style.video.color.rgba
                                }
                            }
                        };
                    });

                    // console.log(subtitlesWithDataUrl, subtitlesWithoutDataUrl);

                    /* this.vsService._uploadSubtitles(this.props.prj_id, {
                        prj_id: this.props.prj_id,
                        background: this.formSubtitle.value.background,
                        scene_ratio: this.formSubtitle.value.scene_ratio,
                        subtitles: subtitlesWithDataUrl
                    }); */

                    this.vsService._uploadSubtitles(this.props.prj_id, {
                        prj_id: this.props.prj_id,
                        background: this.formSubtitle.value.background,
                        scene_ratio: this.formSubtitle.value.scene_ratio,
                        subtitles: subtitlesWithoutDataUrl
                    });
                })
            )
            .subscribe());
    }
}
