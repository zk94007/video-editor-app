import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-subtitle-list',
    templateUrl: './subtitle-list.component.html',
    styleUrls: ['./subtitle-list.component.scss']
})
export class SubtitleListComponent implements OnInit {
    private $uns: any = [];

    public props = {
        displayCreateSubtitleModal: 'block'
    };

    constructor() { }

    ngOnInit() {
    }

    cancelCreateSubtitle() {
        this.props.displayCreateSubtitleModal = 'none';
    }
}
