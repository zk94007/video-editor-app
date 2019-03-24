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

    public process(video) {
        const element: HTMLElement = this.element.nativeElement;
        const parentElement: any = element.parentNode;
        const childElement: any = element.querySelector('span');

        const gap = 20;
        let parentWidth = parentElement.getBoundingClientRect().width;
        let parentHeight = parentElement.getBoundingClientRect().height;
        const childWidth = childElement.getBoundingClientRect().width;
        const childHeight = childElement.getBoundingClientRect().height;
        const reposition = {
            left: 0,
            top: 0,
            width: childWidth,
            height: childHeight
        };

        if (this.styleProp.video.ratio === '16by9') {
            parentWidth = ((16 / 9) * video.resolution.height);
            parentHeight = video.resolution.height;
        }
        if (this.styleProp.video.ratio === '1by1') {
            parentWidth = ((1 / 1) * video.resolution.height);
            parentHeight = video.resolution.height;
        }
        if (this.styleProp.video.ratio === '9by16') {
            parentWidth = ((9 / 16) * video.resolution.height);
            parentHeight = video.resolution.height;
        }


        if (this.styleProp.font.align === 'left') {
            reposition.left = gap;
        }
        if (this.styleProp.font.align === 'right') {
            reposition.left = ((parentWidth - childWidth) - gap);
        }
        if (this.styleProp.font.align === 'center') {
            reposition.left = (parentWidth - childWidth) / 2;
        }
        if (this.styleProp.caption.align === 'bottom') {
            reposition.top = ((parentHeight - childHeight) - gap);
        }
        if (this.styleProp.caption.align === 'top') {
            reposition.top = gap;
        }
        if (this.styleProp.caption.align === 'middle') {
            reposition.top = ((parentHeight - childHeight) / 2);
        }

        this.renderer.addClass(childElement, 'invisible-disable');

        return domtoimage
            .toPng(childElement)
            .then(dataUrl => {
                this.group.get('dataurl').setValue(dataUrl);
                this.group.patchValue({
                    dataurl: dataUrl,
                    reposition: reposition
                });

                this.renderer.removeClass(childElement, 'invisible-disable');

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
