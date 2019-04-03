import { Component, OnInit, Output, EventEmitter, Input, OnChanges } from '@angular/core';
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

export class CsSubtitleToolabarComponent implements OnInit, OnChanges {
    public formToolbar: FormGroup;

    public fontColorPicker: iro;

    public captionColorPicker: iro;

    public videoColorPicker: iro;

    @Input() public newProps;

    @Output() public propChange = new EventEmitter();

    public props = {
        font: {
            family: 'Arial',
            size: 18,
            color: {
                hex: '#ffee00',
                rgba: 'rgba(253,238,0,1)'
            },
            weight: 'normal',
            style: 'normal',
            align: 'center'
        },
        caption: {
            type: 'highlight',
            color: {
                hex: '#000',
                rgba: { r: 0, g: 0, b: 0, a: 0.7 } // 'rgba(0, 0, 0, 0.7)'
            },
            align: 'bottom'
        },
        video: {
            ratio: '16by9',
            color: {
                hex: '#ff3d50',
                rgba: 'rgb(230,56,75)'
            }
        }
    };

    public fontSizes = [8, 10, 12, 14, 16, 18, 20, 22, 24, 28];
    public fontLists$ = new BehaviorSubject([]);

    constructor(
        private fontPickerService: FontPickerService
    ) {
        iro.use(iroTransparencyPlugin);
    }

    ngOnChanges() {
        // console.log(this.newProps);
    }

    ngOnInit() {
        console.log(this.props);
        this.fontPickerService.getAllFonts('popularity')
            .pipe(
                map(({ items }) => items.slice(0, 100)),
                tap((items) => this.fontLists$.next(items)),
                map((items) => {
                    items.forEach((item: any) => {
                        this.fontPickerService.loadFont({ family: item.family, style: '400,500,700', size: '14px' });
                    });

                    return items;
                }),
            )
            .subscribe();

        this.fontColorPicker = new iro.ColorPicker('.font-color-picker', {
            width: 200,
            height: 200,
            color: this.props.font.color.hex
        });

        this.captionColorPicker = new iro.ColorPicker('.caption-color-picker', {
            width: 200,
            height: 200,
            color: this.props.caption.color.rgba,
            transparency: true
        });

        this.videoColorPicker = new iro.ColorPicker('.video-color-picker', {
            width: 200,
            height: 200,
            color: this.props.video.color.hex
        });

        this.fontColorPicker.on('color:change', (color) => {
            this.selectFontColor(color);
        });

        this.captionColorPicker.on('color:change', (color) => {
            this.selectCaptionColor(color);
            console.log(color);
        });

        this.videoColorPicker.on('color:change', (color) => {
            this.selectVideoColor(color);
        });

        this.propChange.emit(this.props);
    }

    public selectFontFamily(fontFamily) {
        this.props.font.family = fontFamily;
        this.propChange.emit(this.props);
    }

    public selectFontSize(fontSize) {
        this.props.font.size = fontSize;
        this.propChange.emit(this.props);
    }

    public toggleFontWeight() {
        if (this.props.font.weight === 'normal') {
            this.props.font.weight = 'bold';
        } else {
            this.props.font.weight = 'normal';
        }

        this.propChange.emit(this.props);
    }

    public toggleFontStyle() {
        if (this.props.font.style === 'normal') {
            this.props.font.style = 'italic';
        } else {
            this.props.font.style = 'normal';
        }

        this.propChange.emit(this.props);
    }

    public selectFontColor(fontColor) {
        this.props.font.color.rgba = fontColor.rgbaString;
        this.props.font.color.hex = fontColor.hexString;
        this.propChange.emit(this.props);
    }

    public selectFontAlign(align) {
        this.props.font.align = align;
        this.propChange.emit(this.props);
    }

    public selectCaptionColor(captionColor) {
        this.props.caption.color.rgba = captionColor.rgbaString;
        this.props.caption.color.hex = captionColor.hexString;
        this.propChange.emit(this.props);
    }

    public selectCaptionAlignment(captionAlign) {
        this.props.caption.align = captionAlign;
        this.propChange.emit(this.props);
    }

    public selectCaptionType(captionType) {
        this.props.caption.type = captionType;
        this.propChange.emit(this.props);
    }

    public selectVideoRatio(videoRatio) {
        this.props.video.ratio = videoRatio;
        this.propChange.emit(this.props);
    }

    public selectVideoColor(videoColor) {
        this.props.video.color.rgba = videoColor.rgbaString;
        this.props.video.color.hex = videoColor.hexString;
        this.propChange.emit(this.props);
    }

    public videoColorChange(color: string) {
        setTimeout(_ => {
            try {
                this.videoColorPicker.color.set(color);
            } catch (e) {
                console.log((<Error>e).message);
            }
        }, 600);
    }

    public fontColorChange(color: string) {
        setTimeout(_ => {
            try {
                this.fontColorPicker.color.set(color);
            } catch (e) {
                console.log((<Error>e).message);
            }
        }, 600);
    }

    public captionColorChange(color: string) {
        setTimeout(_ => {
            try {
                this.captionColorPicker.color.set(color);
            } catch (e) {
                console.log((<Error>e).message);
            }
        }, 600);
    }
}
