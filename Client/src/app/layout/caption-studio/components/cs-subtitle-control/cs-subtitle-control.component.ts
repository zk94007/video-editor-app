import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormArray, FormControl } from '@angular/forms';

import * as moment from 'moment';

@Component({
    selector: 'app-cs-subtitle-control',
    templateUrl: './cs-subtitle-control.component.html',
    styleUrls: ['./cs-subtitle-control.component.scss']
})
export class CsSubtitleControlComponent implements OnInit {
    @Input() public group: FormGroup;

    public min = 0;

    public max = 0;

    constructor() { }

    ngOnInit() {
        if (this.group) {
            this.min = this.group.value.duration[0];
            this.max = this.group.value.duration[1];
        }
    }

    public remove(i: number) {
        const parent = this.group.parent as FormArray;
        const index = parent.value.indexOf(this.group.value);

        if (parent.length > 1) {
            parent.removeAt(index);
        }
    }

    public updateStartTime(value) {
        this.group.controls['duration'].setValue([value, this.group.value.duration[1]]);
    }

    public updateEndTime(value) {
        this.group.controls['duration'].setValue([this.group.value.duration[0], value]);
    }

    public updateTime(time) {
        console.log(time);
        /* this.group.patchValue({
            startTime: time[0], // moment.utc(time[0] * 1000).format('mm:ss'),
            endTime: time[1] // moment.utc(time[1] * 1000).format('mm:ss')
        }); */
    }
}
