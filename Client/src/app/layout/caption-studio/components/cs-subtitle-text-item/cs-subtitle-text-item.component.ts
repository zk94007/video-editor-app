import { Component, Input, OnInit, OnChanges, Renderer2, ElementRef, NgZone } from '@angular/core';
import { FormGroup } from '@angular/forms';

import * as html2canvas from 'html2canvas';

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
        public element: ElementRef,
        private zone: NgZone
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

        const frameWidth = parentElement.getBoundingClientRect().width;
        const frameHeight = parentElement.getBoundingClientRect().height;
        const gap = 20;
        let newFrameWidth = frameWidth;
        let newFrameHeight = frameHeight;
        const subsWidth = childElement.getBoundingClientRect().width;
        const subsHeight = childElement.getBoundingClientRect().height;
        const reposition = {
            left: 0,
            top: 0,
            width: 0,
            height: 0
        };
        let frameScale;

        if (this.styleProp.video.ratio === '16by9') {
            frameScale = (1920 / frameWidth); // 4.173913043478261
            newFrameWidth = ((16 / 9) * video.resolution.height);
            newFrameHeight = 1080;
        }
        if (this.styleProp.video.ratio === '1by1') {
            frameScale = (1080 / frameWidth); // 3.375
            newFrameWidth = ((1 / 1) * video.resolution.height);
            newFrameHeight = 1080;
        }
        if (this.styleProp.video.ratio === '9by16') {
            frameScale = (1080 / frameWidth); // 6
            newFrameWidth = ((9 / 16) * video.resolution.width);
            newFrameHeight = 1920;
        }

        reposition.width = (subsWidth * frameScale);
        reposition.height = (subsHeight * frameScale);

        if (this.styleProp.font.align === 'left') {
            reposition.left = 0;
        }
        if (this.styleProp.font.align === 'right') {
            reposition.left = (newFrameWidth - (subsWidth * frameScale));
        }
        if (this.styleProp.font.align === 'center') {
            reposition.left = (newFrameWidth - (subsWidth * frameScale)) / 2;
        }
        if (this.styleProp.caption.align === 'bottom') {
            if (this.styleProp.caption.type === 'full') {
                reposition.top = (newFrameHeight - (subsHeight * frameScale) - frameScale);
            } else {
                reposition.top = (newFrameHeight - (subsHeight * frameScale) - (gap * frameScale));
            }
        }
        if (this.styleProp.caption.align === 'top') {
            if (this.styleProp.caption.type === 'full') {
                reposition.top = 0;
            } else {
                reposition.top = (gap * frameScale);
            }
        }
        if (this.styleProp.caption.align === 'middle') {
            reposition.top = ((newFrameHeight - (subsHeight * frameScale)) / 2);
        }

        this.renderer.addClass(childElement, 'invisible-disable');

        return html2canvas(childElement, {
            width: subsWidth,
            height: subsHeight,
            scale: frameScale,
            backgroundColor: null
        }).then((canvas: HTMLCanvasElement) => {
            this.zone.run(() => {
                this.group.patchValue({
                    dataurl: canvas.toDataURL('image/png'),
                    reposition: reposition
                });

                this.renderer.removeClass(childElement, 'invisible-disable');

                return canvas.toDataURL('image/png');
            });
        });

        /* return domtoimage
            .toPng(childElement, {
                width: (subsWidth * frameScaleX),
                height: (subsHeight * frameScaleY),
                style: {
                    'visibility': 'visible',
                    'transform': `scale(${frameScaleX}, ${frameScaleY})`,
                    'transform-origin': 'top left'
                }
            })
            .then(dataUrl => {
                this.group.get('dataurl').setValue(dataUrl);
                this.group.patchValue({
                    dataurl: dataUrl,
                    reposition: reposition
                });

                this.renderer.removeClass(childElement, 'invisible-disable');

                return dataUrl;
            }); */
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
        this.renderer.removeStyle(this.element.nativeElement.querySelector('span'), 'background-color');
        this.renderer.removeStyle(this.element.nativeElement.querySelector('span'), 'display');
        this.renderer.removeStyle(this.element.nativeElement.querySelector('span'), 'line-height');

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
                this.renderer.setStyle(
                    this.element.nativeElement.querySelector('span'),
                    'line-height',
                    1.5
                );
                break;

            case 'full':
                this.renderer.setStyle(
                    this.element.nativeElement.querySelector('span'),
                    'background-color',
                    this.styleProp.caption.color.rgba
                );
                this.renderer.setStyle(
                    this.element.nativeElement.querySelector('span'),
                    'display',
                    'block'
                );
                break;

            default:
                break;
        }
    }

    private _captionAlign(alignment) {
        this.renderer.removeStyle(this.element.nativeElement, 'bottom');
        this.renderer.removeStyle(this.element.nativeElement, 'top');
        this.renderer.removeStyle(this.element.nativeElement, 'margin-top');

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
