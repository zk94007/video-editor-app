import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-cs-complete',
    templateUrl: 'cs-complete.component.html',
    styleUrls: ['cs-complete.component.scss']
})

export class CsCompleteComponent implements OnInit, OnChanges {
    public props = {
        finalvideo: '',
        finalvideosd: '',
        finalvideohd: '',
        finalvideofhd: '',
        projectNameAbbr: '',
    };

    @Input() public response: any = {};

    @Input() public progress: any = {};

    @Output() public onCloseComplete = new EventEmitter();

    constructor() { }

    ngOnChanges() {
        if (this.response) {
            this.props.projectNameAbbr = this.response.project_name.length > 17 ? this.response.project_name.slice(0, 16) + '...' : this.response.project_name;
            this.props.finalvideo = this.response.finalvideo ? this.response.finalvideo : '';
            this.props.finalvideosd = this.response.finalvideoSD ? this.response.finalvideoSD : '';
            this.props.finalvideohd = this.response.finalvideoHD ? this.response.finalvideoHD : '';
            this.props.finalvideofhd = this.response.finalvideoFullHD ? this.response.finalvideoFullHD : '';
        }
    }

    ngOnInit() {}

    public closeCompletePage() {
        this.onCloseComplete.emit(true);
    }
}
