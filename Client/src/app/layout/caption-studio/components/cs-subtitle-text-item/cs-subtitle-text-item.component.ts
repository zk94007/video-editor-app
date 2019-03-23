import { Component, Input, OnInit, OnChanges, Renderer2, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import * as domtoimage from 'dom-to-image';

@Component({
    selector: 'app-cs-subtitle-text-item',
    templateUrl: 'cs-subtitle-text-item.component.html',
    styleUrls: ['cs-subtitle-text-item.component.scss']
})

export class CsSubtitleTextItemComponent implements OnInit, OnChanges {
    @Input() public group: FormGroup;

    @Input() public currentTime = 0;

    @Input() public startTime = 0;

    @Input() public endTime = 0;

    @Input() styleProp: any = {};

    constructor(
        private renderer: Renderer2,
        public element: ElementRef
    ) {}

    ngOnChanges() {
        this._fontStyle(this.styleProp.font);
        this._captionStyle(this.styleProp.caption.type);
        this._captionAlign(this.styleProp.caption.align);
    }

    ngOnInit() { }

    public process() {
        const element: HTMLElement = this.element.nativeElement;
        const position = element.getBoundingClientRect();

        return domtoimage
            .toPng(element.querySelector('span'))
            .then(dataUrl => {
                this.group.get('dataurl').setValue(dataUrl);
                this.group.patchValue({
                    dataurl: dataUrl,
                    reposition: {
                        left: position.left,
                        top: position.top,
                        width: position.width,
                        height: position.height
                    }
                });

                return dataUrl;
            });
    }

    private _fontStyle(style) {
        this.renderer.setStyle(this.element.nativeElement, 'color', style.color.hex);
        this.renderer.setStyle(this.element.nativeElement, 'font-family', style.family);
        this.renderer.setStyle(this.element.nativeElement, 'font-size', `${style.size}px`);
        this.renderer.setStyle(this.element.nativeElement, 'font-weight', style.weight);
        this.renderer.setStyle(this.element.nativeElement, 'font-style', style.style);
        this.renderer.setStyle(this.element.nativeElement, 'text-align', style.align);
    }

    private _captionStyle(type) {
        this.renderer.removeStyle(this.element.nativeElement, 'text-shadow');
        this.renderer.removeStyle(this.element.nativeElement, 'background-color');
        this.renderer.removeStyle(this.element.nativeElement.querySelector('span'), 'background-color');

        switch (type) {
            case 'none':
                break;

            case 'outline':
                this.renderer.setStyle(
                    this.element.nativeElement,
                    'text-shadow',
                    `-1px -1px 0px ${this.styleProp.caption.color.hex},
                    1px -1px 0px ${this.styleProp.caption.color.hex},
                    -1px 1px 0px ${this.styleProp.caption.color.hex},
                    1px 1px 0px ${this.styleProp.caption.color.hex}`
                );
                break;

            case 'highlight':
                this.renderer.setStyle(
                    this.element.nativeElement.querySelector('span'),
                    'background-color',
                    this.styleProp.caption.color.rgba
                );
                break;

            case 'full':
                this.renderer.setStyle(
                    this.element.nativeElement,
                    'background-color',
                    this.styleProp.caption.color.rgba
                );
                break;

            default:
                break;
        }
    }

    private _captionAlign(alignment) {
        this.renderer.removeStyle(this.element.nativeElement, 'bottom');
        this.renderer.removeStyle(this.element.nativeElement, 'top');

        switch (alignment) {
            case 'bottom':
                this.renderer.setStyle(
                    this.element.nativeElement,
                    'bottom',
                    '0px'
                );
                break;

            case 'top':
                this.renderer.setStyle(
                    this.element.nativeElement,
                    'top',
                    '0px'
                );
                break;

            case 'middle':
                this.renderer.setStyle(
                    this.element.nativeElement,
                    'top',
                    '50%'
                );
                this.renderer.setStyle(
                    this.element.nativeElement,
                    'margin-top',
                    `-${this.element.nativeElement.clientHeight / 2}px`
                );
                break;

            default:
                break;
        }
    }
}
