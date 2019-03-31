import { Component, OnInit, OnDestroy } from '@angular/core';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';

@Component({
    selector: 'app-vs-workspace',
    templateUrl: './vs-workspace.component.html',
    styleUrls: ['./vs-workspace.component.scss']
})
export class VsWorkspaceComponent implements OnInit, OnDestroy {
    public props: any = {
        sceneRatio: null,
        totalDuration: null
    };

    public $uns: any = [];

    constructor(private vsService: VideoStudioService) {
        this.$uns.push(this.vsService.onLoad.subscribe(() => {
            this.getFrames();
        }));

        this.$uns.push(this.vsService.onChangeDuration.subscribe((delta) => {
            this.props.totalDuration += delta;
        }));

        this.$uns.push(this.vsService.onDuplicateFrame.subscribe((response) => {
            this.getFrames();
        }));

        this.$uns.push(this.vsService.onDeleteFrame.subscribe((response) => {
            this.getFrames();
        }));
    }

    ngOnInit() {
        this.props.sceneRatio = '169';
        this.props.totalDuration = 0;
    }

    ngOnDestroy() {
        this.$uns.forEach(element => {
            element.unsubscribe();
        });
    }

    getFrames() {
        const frames = this.vsService.getFrames();
        this.props.sceneRatio = this.vsService.getSceneRatio();
        this.props.totalDuration = 0;
        if (frames.length > 0) {
            frames.forEach(frame => {
                if (frame.frm_type === 1) {
                    this.props.totalDuration += parseFloat(frame.frm_duration.endTime) - parseFloat(frame.frm_duration.seekTime);
                } else {
                    this.props.totalDuration += parseFloat(frame.frm_duration);
                }
            });
        }
    }

    setSceneRatio(sceneRatio) {
        this.props.sceneRatio = sceneRatio;
        this.vsService._changeSceneRatio(sceneRatio);
    }

    timeFormat(time) {
        if (typeof time !== undefined) {
            let hours: any = Math.floor(time / 3600);
            hours = hours < 10 ? '0' + hours : hours;
            let minutes: any = Math.floor(time / 60);
            minutes = minutes < 10 ? '0' + minutes : minutes;
            let seconds: any = (time % 60).toFixed(0);
            seconds = seconds < 10 ? '0' + seconds : seconds;

            let output = '';
            output += hours + ':';
            output += minutes + ':';
            output += seconds;
            return (output);
        }

        return '';
    }

    mute() {
        this.vsService._changeMute(1);
    }
}
