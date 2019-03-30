import { Component, OnInit, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

import * as moment from 'moment';
import { CsVideoPlayerComponent } from '../cs-video-player/cs-video-player.component';

@Component({
    selector: 'app-cs-subtitle-control',
    templateUrl: './cs-subtitle-control.component.html',
    styleUrls: ['./cs-subtitle-control.component.scss']
})
export class CsSubtitleControlComponent implements OnInit, OnChanges {
    @Input() public group: FormGroup;

    @Input() public videoPlayer: CsVideoPlayerComponent;

    private _start: number;

    private _end: number;

    constructor() { }

    ngOnChanges(change: SimpleChanges) {
        if (change.group && change.group.currentValue) {
            this._start = this.group.controls['startTime'].value;
            this._end = this.group.controls['endTime'].value;
        }
    }

    ngOnInit() { }

    public remove(i: number) {
        const parent = this.group.parent as FormArray;
        const index = parent.value.indexOf(this.group.value);

        parent.removeAt(index);
    }

    public updateStartTime(value) {
        this.group.controls['rangeTime'].setValue([
            this.toSecond(value),
            this.toSecond(this.group.value.rangeTime[1])
        ]);
        this.group.controls['startTime'].setValue(this.toSecond(value));
    }

    public updateEndTime(value) {
        this.group.controls['rangeTime'].setValue([
            this.toSecond(this.group.value.rangeTime[0]),
            this.toSecond(value)
        ]);
        this.group.controls['endTime'].setValue(this.toSecond(value));
        this.videoPlayer.api.currentTime = this.toSecond(value);
    }

    public seekTime(range) {
        this.group.controls['startTime'].setValue(range[0]);
        this.group.controls['endTime'].setValue(range[1]);

        if (this._end === range[1]) {
            this.videoPlayer.api.currentTime = range[0];
        } else if (this._start === range[0]) {
            this.videoPlayer.api.currentTime = range[1];
        } else {
            this.videoPlayer.api.currentTime = range[1];
        }
    }

    public toMillisecond(seconds = 0) {
        return moment.utc(seconds * 1000);
    }

    public toSecond(value) {
        return moment(value, 'mm:ss:SS').diff(moment().startOf('day'), 'seconds');
    }

    public onStart({ handle, value }) {
        this.videoPlayer.play();

        if (handle === 0) {
            this._start = value[0];
            this.videoPlayer.api.currentTime = value[0];
        }

        if (handle === 1) {
            this._end = value[1];
            this.videoPlayer.api.currentTime = value[1];
        }
    }

    public onEnd({ handle, value }) {
        if (handle === 0) {
            this._start = value[0];
        }

        if (handle === 1) {
            this._end = value[1];
        }
    }
}
