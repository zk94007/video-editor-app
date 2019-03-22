import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';

import * as moment from 'moment';
import { CsVideoPlayerComponent } from '../cs-video-player/cs-video-player.component';

@Component({
    selector: 'app-cs-subtitle-control',
    templateUrl: './cs-subtitle-control.component.html',
    styleUrls: ['./cs-subtitle-control.component.scss']
})
export class CsSubtitleControlComponent implements OnInit {
    @Input() public group: FormGroup;

    @Input() public videoPlayer: CsVideoPlayerComponent;

    constructor() { }

    ngOnInit() {
        if (this.group) {
            // console.log(this.group.value);
        }
    }

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

    public seekTime(time) {
        this.group.controls['startTime'].setValue(time[0]);
        this.group.controls['endTime'].setValue(time[1]);
        this.videoPlayer.api.currentTime = time[1];
    }

    public toMillisecond(seconds = 0) {
        return moment.utc(seconds * 1000);
    }

    public toSecond(value) {
        return moment(value, 'mm:ss:SS').diff(moment().startOf('day'), 'seconds');
    }
}
