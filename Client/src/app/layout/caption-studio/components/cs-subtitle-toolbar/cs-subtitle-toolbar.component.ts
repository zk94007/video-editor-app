import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import iro from '@jaames/iro';
import * as iroTransparencyPlugin from 'iro-transparency-plugin';

import { FontPickerService } from '../../../../shared/services/font-picker.service';
import { BehaviorSubject } from 'rxjs';
import { map, tap, mergeMap } from 'rxjs/operators';

@Component({
    selector: 'app-cs-subtitle-toolbar',
    templateUrl: 'cs-subtitle-toolbar.component.html',
    styleUrls: ['cs-subtitle-toolbar.component.scss']
})

export class CsSubtitleToolabarComponent implements OnInit {
    public formToolbar: FormGroup;

    public fontColorPicker: iro;

    public captionColorPicker: iro;

    public videoColorPicker: iro;

    @Output() public change = new EventEmitter();

    public props = {
        font: {
            family: 'Arial',
            size: 18,
            color: '#fff',
            weight: 'normal',
            style: 'normal',
            align: 'left',
            lists: new BehaviorSubject([])
        },
        caption: {
            type: 'none',
            color: {
                hex: null,
                rgba: null
            },
            align: 'flex-end'
        },
        video: {
            ratio: '16by9',
            color: {
                hex: '#000',
                rgba: 'rgba(0,0,0,1)'
            }
        }
    };

    public fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 28];

    constructor(
        private formBuilder: FormBuilder,
        private fontPickerService: FontPickerService
    ) {}

    ngOnInit() {
        iro.use(iroTransparencyPlugin);

        this.fontPickerService.getAllFonts('popularity')
            .pipe(
                map(({ items }) => items.slice(0, 100)),
                tap((items) => this.props.font.lists.next(items)),
                map((items) => {
                    items.forEach((item: any) => {
                        this.fontPickerService.loadFont({ family: item.family, style: '400,500,700', size: '14px' });
                    });

                    return items;
                }),
            )
            .subscribe();

        this.fontColorPicker = new iro.ColorPicker('.font-color-picker', {
            width: 160,
            height: 160,
            color: { r: 255, g: 255, b: 255, a: 0.6 },
            transparency: true
        });

        this.captionColorPicker = new iro.ColorPicker('.caption-color-picker', {
            width: 160,
            height: 160,
            color: { r: 0, g: 0, b: 0, a: 0.6 },
            transparency: true
        });

        this.videoColorPicker = new iro.ColorPicker('.video-color-picker', {
            width: 160,
            height: 160,
            color: { r: 0, g: 0, b: 0, a: 1 },
            transparency: true
        });

        this.fontColorPicker.on('color:change', (color) => {
            this.selectFontColor(color.hexString);
        });

        this.captionColorPicker.on('color:change', (color) => {
            this.selectCaptionColor(color);
        });

        this.videoColorPicker.on('color:change', (color) => {
            this.selectVideoColor(color);
        });

        this.change.emit(this.props);
    }

    public selectFontFamily(fontFamily) {
        this.props.font.family = fontFamily;
        this.change.emit(this.props);
    }

    public selectFontSize(fontSize) {
        this.props.font.size = fontSize;
        this.change.emit(this.props);
    }

    public toggleFontWeight() {
        if (this.props.font.weight === 'normal') {
            this.props.font.weight = 'bold';
        } else {
            this.props.font.weight = 'normal';
        }

        this.change.emit(this.props);
    }

    public toggleFontStyle() {
        if (this.props.font.style === 'normal') {
            this.props.font.style = 'italic';
        } else {
            this.props.font.style = 'normal';
        }

        this.change.emit(this.props);
    }

    public selectFontColor(fontColor) {
        this.props.font.color = fontColor;
        this.change.emit(this.props);
    }

    public selectFontAlign(align) {
        this.props.font.align = align;
        this.change.emit(this.props);
    }

    public selectCaptionColor(captionColor) {
        this.props.caption.color.rgba = captionColor.rgbaString;
        this.props.caption.color.hex = captionColor.hexString;
        this.change.emit(this.props);
    }

    public selectCaptionAlignment(captionAlign) {
        this.props.caption.align = captionAlign;
        this.change.emit(this.props);
    }

    public selectCaptionType(captionType) {
        this.props.caption.type = captionType;
        this.change.emit(this.props);
    }

    public selectVideoRatio(videoRatio) {
        this.props.video.ratio = videoRatio;
        this.change.emit(this.props);
    }

    public selectVideoColor(videoColor) {
        console.log(videoColor)
        this.props.video.color.rgba = videoColor.rgbaString;
        this.props.video.color.hex = videoColor.hexString;
        this.change.emit(this.props);
    }
}
