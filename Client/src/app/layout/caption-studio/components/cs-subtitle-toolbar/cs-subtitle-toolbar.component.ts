import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
    selector: 'app-cs-subtitle-toolbar',
    templateUrl: 'cs-subtitle-toolbar.component.html',
    styleUrls: ['cs-subtitle-toolbar.component.scss']
})

export class CsSubtitleToolabarComponent implements OnInit {
    public formToolbar: FormGroup;

    public props = {
        font: {
            family: 'Arial',
            size: 28,
            color: '#fff',
            weight: 'normal',
            align: 'left'
        },
        caption: {
            type: 'none',
            color: '#000',
            align: 'bottom'
        },
        video: {
            size: '16by9',
            backgroundColor: '#000'
        }
    };

    public fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 28];

    public fontFamilies = ['Arial', 'Helvetica'];

    constructor(private formBuilder: FormBuilder) { }

    ngOnInit() {
        this.formToolbar = this.formBuilder.group({});
    }
}
