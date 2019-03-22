import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-cs-subtitle-text',
    templateUrl: 'cs-subtitle-text.component.html',
    styleUrls: ['cs-subtitle-text.component.scss']
})

export class CsSubtitleTextComponent {
    @Input() public subtitles = [];

    @Input() public currentPlayheadTime = 0;

    @Input() public styleProp: any = {};
}
