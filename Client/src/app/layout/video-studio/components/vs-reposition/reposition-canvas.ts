import 'fabric';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';

declare const fabric: any;
declare var $: any;

import * as path from 'path';

export class RepositionCanvas {
    private $uns: any = [];
    private container: any;
    private canvas: any;

    private element: any = {
        container: null,
        canvas: null,
    };

    private props: any = {
        sceneRatio: '',
        frame: null,
        ratio: {
            width: 0,
            height: 0
        },
        scene: {
            width: 0,
            height: 0
        },
        canvas: {
            scale: 1,
            paddingLeft: 50,
            paddingRight: 50,
            paddingTop: 50,
            paddingBottom: 50,
            border: {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                color: '#00e3c4'
            }
        },
        dimension: {
            '916': {
                width: 1080,
                height: 1920,
            },
            '11': {
                width: 1080,
                height: 1080,
            },
            '169': {
                width: 1920,
                height: 1080,
            }
        },
        size: {
            width: 0,
            height: 0
        },
        cornerProps: {
            transparentCorners: false,
            cornerColor: '#3f4652',
            cornerStrokeColor: '#FFFFFF',
            borderColor: 'rgba(0,0,0,0.5)',
            cornerSize: 10,
            padding: 4,
            cornerStyle: 'circle',
            borderDashArray: [3, 3]
        }
    };

    private selected: any;

    constructor(private vsService: VideoStudioService) {
        this.init();
    }

    init(): any {
        this.element.container = $('#reposition-container');
        this.element.canvas = new fabric.Canvas('reposition-canvas', {
            hoverCursor: 'pointer',
            selection: true,
            preserveObjectStacking: true
        });
        const $this = this;
        fabric.util.requestAnimFrame(function render() {
            $this.element.canvas.renderAll();
            fabric.util.requestAnimFrame(render);
        });
        this.element.canvas.on({
            'object:moving': (e) => {
                const movingObject = e.target;

                if (movingObject.toObject().frame) {
                    let left = movingObject.left;
                    let top = movingObject.top;
                    const width = movingObject.width * movingObject.scaleX;
                    const height = movingObject.height * movingObject.scaleY;

                    left = Math.min(left, this.props.ratio.width - 5);
                    top = Math.min(top, this.props.ratio.height - 5);
                    left = Math.max(left, -width + 5);
                    top = Math.max(top, -height + 5);

                    if (movingObject.left !== left || movingObject.top !== top) {
                        movingObject.left = left;
                        movingObject.top = top;
                        this.element.canvas.renderAll();
                    }
                }
            },
            'object:added': (e) => {
                const addedObject = e.target;

                if (addedObject.toObject().frame) {
                    this.element.canvas.moveTo(addedObject, 0);
                    this.props.frame.object = addedObject;
                    addedObject.setCoords();
                    this.element.canvas.setActiveObject(addedObject);
                }
            }
        });

        this.$uns.push(this.vsService.onStartFrameReposition.subscribe((frame) => {
            this.props.frame = frame;
            this.update();
        }));
    }

    setSize(width, height) {
        this.props.size.width = width;
        this.props.size.height = height;
        this.canvas.setWidth(width);
        this.canvas.setHeight(height);
    }

    update() {
        this.element.canvas.clear();
        this.element.canvas.selection = false;

        this.props.size.width = this.element.container.width() + 1;
        this.props.size.height = this.element.container.height() + 1;

        this.props.ratio = this.vsService.getSceneSize();

        this.props.canvas.scale = Math.min(
            (this.props.size.width - this.props.canvas.paddingLeft - this.props.canvas.paddingRight)
            / this.props.ratio.width,
            (this.props.size.height - this.props.canvas.paddingTop - this.props.canvas.paddingBottom)
            / this.props.ratio.height);

        this.props.canvas.border.left = (this.props.size.width - this.props.ratio.width * this.props.canvas.scale) / ((this.props.canvas.paddingLeft + this.props.canvas.paddingRight) / this.props.canvas.paddingLeft);
        this.props.canvas.border.top = (this.props.size.height - this.props.ratio.height * this.props.canvas.scale) / ((this.props.canvas.paddingTop + this.props.canvas.paddingBottom) / this.props.canvas.paddingTop);
        this.props.canvas.border.width = this.props.ratio.width * this.props.canvas.scale;
        this.props.canvas.border.height = this.props.ratio.height * this.props.canvas.scale;

        const borders = [];
        borders.push(new fabric.Line([0, this.props.canvas.border.height / this.props.canvas.scale, 0, 0], {
            left: 0,
            top: 0,
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeWidth: 3
        }));
        borders.push(new fabric.Line([0, 0, this.props.canvas.border.width / this.props.canvas.scale, 0], {
            left: 0,
            top: 0,
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeWidth: 3
        }));
        borders.push(new fabric.Line([this.props.canvas.border.width / this.props.canvas.scale, 0, this.props.canvas.border.width / this.props.canvas.scale, this.props.canvas.border.height / this.props.canvas.scale], {
            left: Math.ceil((this.props.canvas.border.width - 3) / this.props.canvas.scale),
            top: 0,
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeWidth: 3
        }));
        borders.push(new fabric.Line([0, this.props.canvas.border.height / this.props.canvas.scale, this.props.canvas.border.width / this.props.canvas.scale, this.props.canvas.border.height / this.props.canvas.scale], {
            left: 0,
            top: Math.ceil((this.props.canvas.border.height - 3) / this.props.canvas.scale),
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeWidth: 3
        }));

        const points = [
            {
                x: -Math.floor(this.props.canvas.border.left / this.props.canvas.scale),
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale)
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale) + Math.floor(this.props.canvas.border.left / this.props.canvas.scale),
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale)
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale) + Math.floor(this.props.canvas.border.left / this.props.canvas.scale),
                y: -Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale)
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale),
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale),
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale),
                y: 0,
            },
            {
                x: 0,
                y: 0
            },
            {
                x: 0,
                y: Math.floor(this.props.canvas.border.height / this.props.canvas.scale)
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale),
                y: Math.floor(this.props.canvas.border.height / this.props.canvas.scale)
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale),
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale),
            },
            {
                x: - Math.floor(this.props.canvas.border.left / this.props.canvas.scale),
                y: -Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale)
            }
        ];

        const polygon = new fabric.Polygon(points, {
            left: points[0].x,
            top: points[0].y,
            fill: 'rgba(0, 0, 0, 0.5)',
            selectable: false,
            evented: false,
            objectCaching: false,
            strokeWidth: 0
        });

        this.extend(borders[0], { border: true });
        this.extend(borders[1], { border: true });
        this.extend(borders[2], { border: true });
        this.extend(borders[3], { border: true });

        this.element.canvas.add(borders[0]);
        this.element.canvas.add(borders[1]);
        this.element.canvas.add(borders[2]);
        this.element.canvas.add(borders[3]);

        this.element.canvas.add(polygon);

        function fit_video_2_frame(videoWidth, videoHeight, frameWidth, frameHeight) {
            const fit = { width: 0, height: 0, offsetX: 0, offsetY: 0 };

            const videoRatio = videoWidth / videoHeight;
            const frameRatio = frameWidth / frameHeight;

            if (frameRatio > videoRatio) {
                const scale = frameHeight / videoHeight;
                fit.width = Math.ceil(videoWidth * scale) % 2 === 0 ? Math.ceil(videoWidth * scale) : Math.ceil(videoWidth * scale) + 1;
                fit.height = frameHeight % 2 === 0 ? frameHeight : frameHeight + 1;
                fit.offsetX = Math.floor((frameWidth - fit.width) / 2);
                fit.offsetY = 0;
            } else {
                const scale = frameWidth / videoWidth;
                fit.width = frameWidth % 2 === 0 ? frameWidth : frameWidth + 1;
                fit.height = Math.ceil(videoHeight * scale) % 2 === 0 ? Math.ceil(videoHeight * scale) : Math.ceil(videoHeight * scale) + 1;
                fit.offsetX = 0;
                fit.offsetY = Math.floor((frameHeight - fit.height) / 2);
            }

            return fit;
        }

        if (this.props.frame) {

            const fit = fit_video_2_frame(this.props.frame.frm_resolution.width,
                this.props.frame.frm_resolution.height,
                this.props.dimension[this.vsService.getSceneRatio()].width,
                this.props.dimension[this.vsService.getSceneRatio()].height);

            // this.props.frame.frm_reposition = fit;

            if (this.props.frame.frm_type === 2) {
                if (this.isGif(this.props.frame.frm_path)) {
                    this.addFrameGifToCanvas(this.props.frame.frm_path, this.props.frame.frm_reposition, this.props.frame.frm_resolution, this.props.frame.frm_gif_delays);
                } else {
                    this.addFrameImageToCanvas(this.props.frame.frm_path, this.props.frame.frm_reposition, this.props.frame.frm_resolution);
                }
            } else {
                console.log(this.props.frame.frm_path);
                this.addFrameVideoToCanvas(this.props.frame.frm_path, this.props.frame.frm_reposition, this.props.frame.frm_resolution);
            }
        }

        this.element.canvas.setDimensions(this.props.size);
        this.element.canvas.setViewportTransform([this.props.canvas.scale, 0, 0, this.props.canvas.scale, this.props.canvas.border.left, this.props.canvas.border.top]);
        this.element.canvas.renderAll();
    }

    isGif(src) {
        return path.extname(src) === '.gif' || path.extname(src) === '.GIF';
    }

    extend(obj, additionalParams) {
        obj.toObject = (function (toObject) {
            return function () {
                return fabric.util.object.extend(toObject.call(this), additionalParams);
            };
        })(obj.toObject);
    }

    addFrameImageToCanvas(url, reposition: any, resolution: any) {
        if (url) {
            fabric.Image.fromURL(url, (image) => {
                image.set({
                    left: reposition.offsetX,
                    top: reposition.offsetY,
                    angle: 0,
                    width: resolution.width,
                    height: resolution.height,
                    scaleX: reposition.width / resolution.width,
                    scaleY: reposition.height / resolution.height,
                    lockRotation: true,
                    hasRotatingPoint: false,
                    lockUniScaling: true
                });
                image.crossOrigin = 'anonymous';
                this.extend(image, { frame: true });
                image.set(this.props.cornerProps);
                this.element.canvas.add(image);
                this.element.canvas.renderAll();
            });
        }
    }

    addFrameGifToCanvas(url, reposition: any, resolution: any, gif_delays: any) {
        resolution.width = resolution.height = 120;

        const gifpath = path.dirname(url) + '/' + path.basename(url, path.extname(url)) + '.png';
        if (url) {
            fabric.Sprite.fromURL(gifpath, (sprite) => {
                sprite.set({
                    left: reposition.offsetX,
                    top: reposition.offsetY,
                    angle: 0,
                    width: resolution.width,
                    height: resolution.height,
                    scaleX: reposition.width / resolution.width,
                    scaleY: reposition.height / resolution.height,
                    lockRotation: true,
                    hasRotatingPoint: false,
                    lockUniScaling: true
                });
                sprite.crossOrigin = 'anonymous';
                this.extend(sprite, { frame: true });
                sprite.set(this.props.cornerProps);
                this.element.canvas.add(sprite);
                this.element.canvas.renderAll();
                setTimeout(function () {
                    sprite.play();
                }, 100);
            }, { crossOrigin: 'Anonymous', width: resolution.width, height: resolution.height, delays: gif_delays.delays });
        }
    }

    getReposition() {
        if (this.props.frame) {
            return {
                offsetX: this.props.frame.object.left,
                offsetY: this.props.frame.object.top,
                width: this.props.frame.object.width * this.props.frame.object.scaleX,
                height: this.props.frame.object.height * this.props.frame.object.scaleY
            };
        }
    }

    addFrameVideoToCanvas(frm_path: string, reposition: any, resolution): any {
        const videoE = this.getVideoElement(frm_path, resolution.width, resolution.height);
        const $this = this;
        videoE.onloadedmetadata = function() {
            const video = new fabric.Image(videoE, {
                left: reposition.offsetX,
                top: reposition.offsetY,
                width: resolution.width,
                height: resolution.height,
                scaleX: reposition.width / resolution.width,
                scaleY: reposition.height / resolution.height,
                angle: 0,
                lockRotation: true,
                hasRotatingPoint: false,
                lockUniScaling: true
            });
            $this.extend(video, { frame: true });
            video.set($this.props.cornerProps);
            $this.element.canvas.add(video);
            $this.element.canvas.renderAll();
            fabric.util.requestAnimFrame(function render() {
                $this.element.canvas.renderAll();
                fabric.util.requestAnimFrame(render);
            });
            videoE.currentTime = 0;
        }
    }

    destructor() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }

    getVideoElement(url, width, height) {
        const videoE = document.createElement('video');
        videoE.poster = '../../../../../assets/video-studio/loading.gif';
        videoE.width = width;
        videoE.height = height;
        videoE.loop = false;
        videoE.autoplay = false;
        videoE.src = url;

        return videoE;
    }

    clearCanvas() {
        this.element.canvas.clear();
    }
}
