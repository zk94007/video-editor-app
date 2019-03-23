import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-cs-complete',
    templateUrl: 'cs-complete.component.html',
    styleUrls: ['cs-complete.component.scss']
})

export class CsCompleteComponent implements OnInit, OnChanges {
    public props = {};

    @Input() public response: any = {};

    @Input() public progress: any = {};

    @Output() public onCloseComplete = new EventEmitter();

    constructor() { }

    ngOnChanges() {
        console.log(this.response);
        console.log(this.progress);
    }

    ngOnInit() { }

    public closeCompletePage() {
        this.onCloseComplete.emit(true);
    }
}
