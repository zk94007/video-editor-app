import 'fabric';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';
import { FontPickerService } from '../../../../shared/services/font-picker.service';

declare const fabric: any;
declare var $: any;
declare var window: any;

import * as path from 'path';

fabric.Sprite = fabric.util.createClass(fabric.Image, {
    type: 'sprite',

    spriteWidth: 480,
    spriteHeight: 400,
    spriteIndex: 0,
    spriteDelays: [],
    spriteDuration: 0,

    initialize: function (element, options) {
        this.spriteWidth = options.width;
        this.spriteHeight = options.height;
        this.spriteDelays = options.delays;

        if (this.spriteDelays.length === 0) {
            this.spriteDelays.push(1000 / 24);
        }

        this.callSuper('initialize', element, options);

        this.createTmpCanvas();
        this.createSpriteImages();
    },

    createTmpCanvas: function () {
        this.tmpCanvasEl = fabric.util.createCanvasElement();
        this.tmpCanvasEl.width = this.spriteWidth || this.width;
        this.tmpCanvasEl.height = this.spriteHeight || this.height;
    },

    createSpriteImages: function () {
        this.spriteImages = [];

        const steps = this._element.width / this.spriteWidth;
        for (let i = 0; i < steps; i++) {
            this.createSpriteImage(i);
        }
    },

    createSpriteImage: function (i) {
        const tmpCtx = this.tmpCanvasEl.getContext('2d');
        tmpCtx.clearRect(0, 0, this.tmpCanvasEl.width, this.tmpCanvasEl.height);
        tmpCtx.drawImage(this._element, -i * this.spriteWidth, 0);

        const dataURL = this.tmpCanvasEl.toDataURL('image/png');
        const tmpImg = fabric.util.createImage();

        tmpImg.src = dataURL;

        this.spriteImages.push(tmpImg);
    },

    _render: function (ctx) {
        ctx.drawImage(
            this.spriteImages[this.spriteIndex],
            -this.width / 2,
            -this.height / 2
        );
    },

    next: function() {
        this.spriteIndex++;
        if (this.spriteIndex === this.spriteImages.length) {
            this.spriteIndex = 0;
        }
    },

    play: function () {
        const _this = this;
        setTimeout(() => {
            _this.spriteIndex++;
            if (_this.spriteIndex === _this.spriteImages.length) {
                _this.spriteIndex = 0;
            }

            _this.play();
        }, this.spriteDelays[this.spriteIndex % this.spriteDelays.length]);
    },

    stop: function () {
        clearInterval(this.animInterval);
    }
});

fabric.Sprite.fromURL = function (url, callback, options) {
    fabric.util.loadImage(url, function (img) {
        callback(new fabric.Sprite(img, options));
    }, null, options && options.crossOrigin);
};

fabric.Sprite.async = true;

export class WorkareaCanvas {

    private $uns: any = [];

    private element: any = {
        container: null,
        background: null,
        canvas: null,
    };

    private props: any = {
        modified: false,
        sceneRatio: '',
        frame: null,
        hoverId: null,
        overlays: {},
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
            paddingLeft: 40,
            paddingRight: 40,
            paddingTop: 50,
            paddingBottom: 20,
            border: {
                left: 0,
                top: 0,
                width: 0,
                height: 0,
                color: 'transparent'
            }
        },
        borders: [],
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
        },
        copiedObject: null,
        movementDelta: 2,
        longMovementDelta: 10,

        // Keycodes

        backspaceKeycode: 8,
        deleteKeycode: 46,
        cKeycode: 67,
        vKeycode: 86,
        zKeycode: 90,
        upKeycode: 38,
        downKeycode: 40,
        leftKeycode: 37,
        rightKeycode: 39
    };

    isGif(src) {
        return path.extname(src) === '.gif' || path.extname(src) === '.GIF';
    }

    constructor(private vsService: VideoStudioService, private fsService: FontPickerService) {
        this.init();

        this.$uns.push(this.vsService.onAddTextOverlay.subscribe((data) => {
            const object: any = {
                id: this.vsService.fakeId(),
                fontFamily: data.fontFamily,
                fontSize: data.fontSize,
                fontStyle: data.fontStyle,
                text: data.text,
                textAlign: 'center',
                left: (data.x - this.props.canvas.border.left) / this.props.canvas.scale,
                top: (data.y - this.props.canvas.border.top + 8) / this.props.canvas.scale,
                width: (data.width + 8) / this.props.canvas.scale,
                height: data.height / this.props.canvas.scale,
                angle: 0,
                fill: '#000000',
                scaleX: 1,
                scaleY: 1,
                hasRotatingPoint: true,
                lockScalingY: true,
                type: 'textbox',
                colorModified: true
            };

            const overlay = {
                id: object.id,
                state: 'added',
                ostate: 'updated',
                order: this.props.frame.total_overlay_count + 1,
                object: object,
            };
            this.props.frame.total_overlay_count += 1;
            this.props.overlays[overlay.id] = overlay;
            this.addTextOverlay(object);
        }));

        this.$uns.push(this.vsService.onAddImageOverlay.subscribe((image) => {
            const resolution = JSON.parse(JSON.stringify(image.resolution));
            if (this.isGif(image.src)) {
                resolution.width = 120;
                resolution.height = 120;
            }
            const object: any = {
                id: this.vsService.fakeId(),
                src: image.src,
                width: resolution.width,
                height: resolution.height,
                left: (image.x - this.props.canvas.border.left) / this.props.canvas.scale,
                top: (image.y - this.props.canvas.border.top + 8) / this.props.canvas.scale,
                angle: 0,
                scaleX: image.width / resolution.width,
                scaleY: image.height / resolution.height,
                hasRotatingPoint: true,
                type: this.isGif(image.src) ? 'sprite' : 'image',
                delays: image.gif_delays.delays
            };

            const overlay = {
                id: object.id,
                state: 'added',
                ostate: 'updated',
                order: this.props.frame.total_overlay_count + 1,
                object: object,
            };
            this.props.frame.total_overlay_count = this.props.frame.total_overlay_count + 1;
            this.props.overlays[overlay.id] = overlay;

            if (object.type === 'image') {
                this.addImageOverlay(object);
            } else if (object.type === 'sprite') {
                this.addGifOverlay(object);
            }
        }));

        this.$uns.push(this.vsService.onCopyOverlay.subscribe((response) => {
            this.clone(this.element.canvas.getActiveObject());
        }));

        this.$uns.push(this.vsService.onDeleteOverlay.subscribe((response) => {
            this.removeSelected();
        }));

        this.$uns.push(this.vsService.onChangeArrangeOverlay.subscribe((response) => {
            if (response === 1) {
                this.prev();
            } else {
                this.back();
            }
        }));

        this.$uns.push(this.vsService.onChangeTextProps.subscribe((result) => {
            for (const key in result) {
                if (key === 'fontFamily') {
                    this.setFontFamily(result[key]);
                }
                if (key === 'fontSize') {
                    this.setFontSize(result[key]);
                }
                if (key === 'textColor') {
                    this.setFill(result[key]);
                }
                if (key === 'textBold') {
                    this.setBold(result[key]);
                }
                if (key === 'textItalic') {
                    this.setFontStyle(result[key]);
                }
                if (key === 'textUnderline') {
                    this.setUnderline(result[key]);
                }
                if (key === 'textAlign') {
                    this.setTextAlign(result[key]);
                }
                if (key === 'textCharSpacing') {
                    this.setCharSpacing(result[key]);
                }
                if (key === 'textLineHeight') {
                    this.setLineHeight(result[key]);
                }
            }
            const activeObject = this.element.canvas.getActiveObject();
            if (activeObject) {
                const id = activeObject.toObject().id;
                if (this.props.overlays[id].state === 'updated') {
                    this.props.overlays[id].state = 'modified';
                }

                if (activeObject.type === 'textbox') {
                    activeObject.setCoords(true);
                    this.extend(activeObject, {colorModified: result['colorModified']});
                    this.props.overlays[id].dataurl = activeObject.toDataURL({ format: 'png' });
                }
                this.props.overlays[id].object = JSON.parse(JSON.stringify(activeObject.toObject()));
                activeObject.setCoords();

                $('#documentSyncStatus').html('Unsaved changes');
                this.props.modified = true;
            }
        }));

        this.$uns.push(this.vsService.onChangeTransparent.subscribe((response) => {
            this.setOpacity(response);
        }));

        this.$uns.push(this.vsService.onUpdateCanvas.subscribe(overlays => {
            if (this.props.modified) {
                this.updateCanvas();
            }
        }));

        this.$uns.push(this.vsService.onAddOverlay.subscribe(response => {
            const fake_id = response.fake_id;
            const ovl_id = response.ovl_id;

            if (this.props.overlays[fake_id] === undefined) {
                return;
            }

            const object = this.props.overlays[fake_id].object;
            const order = this.props.overlays[fake_id].order;
            const dataurl = this.props.overlays[fake_id].dataurl;

            delete this.props.overlays[fake_id];

            this.props.overlays[ovl_id] = {
                id: ovl_id,
                state: 'updated',
                ostate: 'updated',
                order: order,
                object: object,
                dataurl: dataurl,
            };

            if (this.getObject(fake_id)) {
                this.extend(this.getObject(fake_id), { id: ovl_id });
            }
        }));

        this.$uns.push(this.vsService.onStartConcatenate.subscribe(() => {
            this.updateCanvas();
        }));
    }

    init(): any {
        this.element.container = $('#workarea-container');
        this.element.background = $('#workarea-background');
        this.element.canvas = new fabric.Canvas('workarea-canvas', {
            hoverCursor: 'pointer',
            selection: false,
            preserveObjectStacking: true,
            breakWords: true,
        });

        const $this = this;
        fabric.util.requestAnimFrame(function render() {
            $this.element.canvas.renderAll();
            fabric.util.requestAnimFrame(render);
        });

        document.addEventListener('keyup', (event) => {
            if (event.keyCode == this.props.deleteKeycode || event.keyCode == this.props.backspaceKeycode) {
                event.preventDefault();
                this.removeSelected();
            }
        });
        document.addEventListener('keydown', (event) => {
            let activeObject = this.element.canvas.getActiveObject();
            let activeGroup = this.element.canvas.getActiveObjects();

            if (event.ctrlKey || event.metaKey) {
                switch (event.which) {
                    case this.props.cKeycode:       // copy object
                        this.props.copiedObject = activeObject;
                        break;
                    case this.props.vKeycode:       // paste object
                        this.clone(this.props.copiedObject);
                        break;
                    case this.props.zKeycode:       // undo action
                        break;
                    default:
                        break;
                }
            }
            switch (event.keyCode) {
                case this.props.upKeycode:
                    event.preventDefault(); // Prevent the default action
                    if (activeObject) {
                        event.stopPropagation();
                        let object = activeObject.get('top') - (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeObject.set('top', object);
                    }
                    else if (activeGroup && activeGroup.length) {
                        event.stopPropagation();
                        let object = activeGroup.get('top') - (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeGroup.set('top', object);
                    }
                    break;
                case this.props.downKeycode:
                    event.preventDefault(); // Prevent the default action
                    if (activeObject) {
                        event.stopPropagation();
                        let object = activeObject.get('top') + (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeObject.set('top', object);
                    }
                    else if (activeGroup && activeGroup.length) {
                        event.stopPropagation();
                        let object = activeGroup.get('top') + (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeGroup.set('top', object);
                    }
                    break;
                case this.props.leftKeycode:
                    event.preventDefault(); // Prevent the default action
                    if (activeObject) {
                        event.stopPropagation();
                        let object = activeObject.get('left') - (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeObject.set('left', object);
                    }
                    else if (activeGroup && activeGroup.length) {
                        event.stopPropagation();
                        let object = activeGroup.get('left') - (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeGroup.set('left', object);
                    }
                    break;
                case this.props.rightKeycode:
                    event.preventDefault(); // Prevent the default action
                    if (activeObject) {
                        event.stopPropagation();
                        let object = activeObject.get('left') + (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeObject.set('left', object);
                    }
                    else if (activeGroup && activeGroup.length) {
                        event.stopPropagation();
                        let object = activeGroup.get('left') + (event.shiftKey ? this.props.longMovementDelta : this.props.movementDelta);
                        activeGroup.set('left', object);
                    }
                    break;
                default:
                    break;
            }

            if (activeObject) {
                activeObject.setCoords();
                this.element.canvas.renderAll();
            } else if (activeGroup) {
                // activeGroup.setCoords();
                this.element.canvas.renderAll();
            }
        });
        this.element.canvas.on({
            'object:modified': (e) => {
                const modifiedObject = e.target;

                if (modifiedObject) {
                    const id = modifiedObject.toObject().id;
                    if (this.props.overlays[id].state === 'updated') {
                        this.props.overlays[id].state = 'modified';
                    }

                    if (modifiedObject.type === 'textbox') {
                        modifiedObject.setCoords(true);
                        this.props.overlays[id].dataurl = modifiedObject.toDataURL({ format: 'png' });
                    }
                    this.props.overlays[id].object = JSON.parse(JSON.stringify(modifiedObject.toObject()));
                    modifiedObject.setCoords();

                    $('#documentSyncStatus').html('Unsaved changes');
                    this.props.modified = true;
                }
            },
            'object:added': (e) => {
                const addedObject = e.target;
                if (addedObject && !addedObject.toObject().border ) {
                    if (this.props.frame.inital_loading) {
                        const objects = this.element.canvas.getObjects();
                        let exist_count = 0;
                        for (let i = 0; i < objects.length; i++) {
                            if (objects[i].toObject().id === addedObject.toObject().id) {
                                exist_count ++;
                            }
                        }
                        if (exist_count > 1) {
                            this.element.canvas.remove(addedObject);
                        } else {
                            this.props.frame.loaded_overlay_count ++;
                            if (this.props.frame.loaded_overlay_count === this.props.frame.total_overlay_count) {
                                this.props.frame.inital_loading = false;
                                objects.sort(function(obj1, obj2) {
                                    if (obj1.toObject().border) {
                                        return 1;
                                    }
                                    if (obj2.toObject().border) {
                                        return -1;
                                    }
                                    const order1 = obj1.toObject().id !== '' ? $this.props.overlays[obj1.toObject().id].order : 0;
                                    const order2 = obj2.toObject().id !== '' ? $this.props.overlays[obj2.toObject().id].order : 0;
                                    return order1 - order2;
                                });
                            }
                        }
                    }

                    const id = addedObject.toObject().id;
                    if (this.props.overlays[id].state === 'added') {
                        if (addedObject.type === 'textbox') {
                            addedObject.setCoords(true);
                            this.props.overlays[id].dataurl = addedObject.toDataURL({ format: 'png' });
                        }
                        this.element.canvas.moveTo(addedObject, this.element.canvas.getObjects().length - 1 - this.props.borders.length);
                        this.element.canvas.setActiveObject(addedObject);

                        $('#documentSyncStatus').html('Unsaved changes');
                        this.props.modified = true;
                    }

                    addedObject.setCoords();
                }
            },
            'object:selected': (e) => {
                const selectedObject = e.target;

                if (selectedObject) {
                    const data = selectedObject.toObject();
                    data.order = this.props.overlays[data.id].order;
                    data.overlay_count = this.props.frame.total_overlay_count;
                    this.vsService.selectOverlay(data);
                }

                selectedObject.setCoords();
            },
            'object:moving': (e) => {
                this.props.hoverId = null;
            },
            'object:scaling': (e) => {
                this.props.hoverId = null;
            },
            'object:rotating': (e) => {
                this.props.hoverId = null;
            },
            'selection:updated': (e) => {
                const updatedObject = e.target;

                if (updatedObject) {
                    const data = updatedObject.toObject();
                    data.order = this.props.overlays[data.id].order;
                    data.overlay_count = this.props.frame.total_overlay_count;
                    this.vsService.selectOverlay(data);
                }

                updatedObject.setCoords();
            },
            'selection:cleared': (e) => {
                this.vsService.deselectOverlay();
            },
            'mouse:over': (e) => {
                const overObject = e.target;

                if (overObject) {
                    this.props.hoverId = overObject.toObject().id;
                    this.element.canvas.renderAll();
                }
            },
            'mouse:out': (e) => {
                const outObject = e.target;

                if (outObject) {
                    this.props.hoverId = null;
                    this.element.canvas.renderAll();
                }
            },
            'after:render': (e) => {
                if (this.props.hoverId) {
                    this.element.canvas.contextContainer.strokeStyle = '#F2784B';
                    this.element.canvas.contextContainer.lineWidth = 2;
                    const objects = this.element.canvas.getObjects();
                    const hoverObject = objects.find(object => '' + object.toObject().id === '' + this.props.hoverId);

                    if (hoverObject) {
                        const bound = hoverObject.getBoundingRect();

                        this.element.canvas.contextContainer.strokeRect(
                            bound.left + 4,
                            bound.top + 4,
                            bound.width - 8,
                            bound.height - 8,
                        );
                    }
                }
            }
        });
    }

    updateCanvas() {
        this.props.modified = false;
        $('#documentSyncStatus').html('Saving...');
        const params = {
            added: [],
            modified: [],
            removed: [],
        };

        for (const id in this.props.overlays) {
            if (this.props.overlays.hasOwnProperty(id)) {
                if (this.props.overlays[id].state === 'added') {
                    const overlay = this.props.overlays[id];
                    const object = this.getObject(overlay.id);
                    const bound = object.getBoundingRect();
                    bound.left += 4; bound.top += 4;
                    bound.width -= 8; bound.height -= 8;
                    const data = {
                        id: overlay.id,
                        frm_id: this.props.frame.frm_id,
                        ovl_order: overlay.order,
                        ovl_json: overlay.object,
                        offsetX: (bound.left - this.props.canvas.border.left) / this.props.canvas.scale,
                        offsetY: (bound.top - this.props.canvas.border.top) / this.props.canvas.scale,
                        width: bound.width / this.props.canvas.scale,
                        height: bound.height / this.props.canvas.scale,
                        type: overlay.object.type === 'textbox' ? 2 : 1,
                        angle: overlay.object.angle,
                        opacity: overlay.object.opacity,
                        ovl_content: ''
                    };
                    if (overlay.object.type === 'textbox') {
                        data.ovl_content = overlay.dataurl;
                        data.angle = 0;
                        data.opacity = 1;
                    } else {
                        if (overlay.object.type === 'image') {
                            data.ovl_content = overlay.object.src;
                        } else {
                            data.ovl_content = path.dirname(overlay.object.src) + '/' + path.basename(overlay.object.src, path.extname(overlay.object.src)) + '.gif';
                        }
                        data.width = overlay.object.width * overlay.object.scaleX;
                        data.height = overlay.object.height * overlay.object.scaleY;
                    }
                    this.props.overlays[id].state = 'pending';
                    this.vsService._addOverlay(data);
                }
                if (this.props.overlays[id].state === 'modified') {
                    const overlay = this.props.overlays[id];
                    const object = this.getObject(overlay.id);
                    const bound = object.getBoundingRect();
                    bound.left += 4; bound.top += 4;
                    bound.width -= 8; bound.height -= 8;
                    const data = {
                        id: overlay.id,
                        frm_id: this.props.frame.frm_id,
                        ovl_json: overlay.object,
                        offsetX: (bound.left - this.props.canvas.border.left) / this.props.canvas.scale,
                        offsetY: (bound.top - this.props.canvas.border.top) / this.props.canvas.scale,
                        width: bound.width / this.props.canvas.scale,
                        height: bound.height / this.props.canvas.scale,
                        type: overlay.object.type === 'textbox' ? 2 : 1,
                        angle: overlay.object.angle,
                        opacity: overlay.object.opacity,
                        ovl_content: ''
                    };
                    if (overlay.object.type === 'textbox') {
                        data.ovl_content = overlay.dataurl;
                        data.angle = 0;
                        data.opacity = 1;
                    } else {
                        if (overlay.object.type === 'image') {
                            data.ovl_content = overlay.object.src;
                        } else {
                            data.ovl_content = path.dirname(overlay.object.src) + '/' + path.basename(overlay.object.src, path.extname(overlay.object.src)) + '.gif';
                        }
                        data.width = overlay.object.width * overlay.object.scaleX;
                        data.height = overlay.object.height * overlay.object.scaleY;
                    }
                    this.props.overlays[id].state = 'updated';
                    this.vsService._updateOverlay(data);
                }
                if (this.props.overlays[id].state === 'removed' && !this.isFake(id)) {
                    delete this.props.overlays[id];
                    this.vsService._deleteOverlay(id);
                }
            }
        }

        const orders = [];
        for (const id in this.props.overlays) {
            if (this.props.overlays.hasOwnProperty(id) && !this.isFake(id)) {
                if (this.props.overlays[id].state !== 'removed' && this.props.overlays[id].ostate === 'modified') {
                    orders.push({
                        ovl_id: id,
                        ovl_order: this.props.overlays[id].order,
                    });

                    this.props.overlays[id].ostate = 'updated';
                }
            }
        }

        if (orders.length) {
            this.vsService._updateOverlayOrders(orders);
        }

        setTimeout(() => {
            if (!this.props.modified) {
                $('#documentSyncStatus').html('All changes saved');
            }
        }, 800);
    }

    isFake(id) {
        return id.includes('fake');
    }

    updateSceneRatio() {
        function convert(l, t, w, h, a, xr, yr) {
            function radian(angle) {
                return angle / 180 * Math.PI;
            }
            const ox = w / 2 * Math.cos(radian(a)) - h / 2 * Math.sin(radian(a)) + l;
            const oy = w / 2 * Math.sin(radian(a)) + h / 2 * Math.cos(radian(a)) + t;
            return {
                left: l + (xr - 1) * ox,
                top: t + (yr - 1) * oy,
            };
        }

        if (this.props.sceneRatio !== this.vsService.getSceneRatio()) {
            $('#documentSyncStatus').html('Unsaved changes');
            this.props.modified = true;
            const prevSceneRatio = this.props.sceneRatio;
            this.props.sceneRatio = this.vsService.getSceneRatio();
            // frame.frm_overlays.forEach((overlay) => {
            const xRatio = this.props.dimension[this.props.sceneRatio].width /
                this.props.dimension[prevSceneRatio].width;
            const yRatio = this.props.dimension[this.props.sceneRatio].height /
                this.props.dimension[prevSceneRatio].height;
            for (const id in this.props.overlays) {
                if (this.props.overlays.hasOwnProperty(id)) {
                    if (this.props.overlays[id].state === 'updated') {
                        this.props.overlays[id].state = 'modified';
                    }

                    const object = this.getObject(id);

                    if (object) {
                        const width = this.props.overlays[id].object.width * this.props.overlays[id].object.scaleX;
                        const height = this.props.overlays[id].object.height * this.props.overlays[id].object.scaleY;
                        const position = convert(this.props.overlays[id].object.left, this.props.overlays[id].object.top,
                            width, height, this.props.overlays[id].object.angle, xRatio, yRatio);
                        this.props.overlays[id].object.left = position.left;
                        this.props.overlays[id].object.top = position.top;
                    }
                }
            }
        }
    }

    update(frame) {
        this.props.sceneRatio = this.vsService.getSceneRatio();
        if (!this.props.frame || this.props.frame.frm_id !== frame.frm_id) {
            this.props.frame = frame;
            this.props.overlays = {};
            this.props.frame.frm_overlays.forEach((_overlay) => {
                const object = JSON.parse(_overlay.ovl_json);
                const overlay = {
                    id: _overlay.ovl_id,
                    state: _overlay.ovl_content === '' ? 'modified' : 'updated',
                    ostate: 'updated',
                    order: _overlay.ovl_order,
                    object: object,
                };
                this.props.overlays[_overlay.ovl_id] = overlay;
            });
            this.props.frame.total_overlay_count = this.props.frame.frm_overlays.length;
        }

        this.element.canvas.clear();

        this.props.size.width = this.element.container.width();
        this.props.size.height = this.element.container.height();

        this.element.background.width(this.props.size.width);
        this.element.background.height(this.props.size.height);

        this.props.ratio = this.vsService.getSceneSize();

        this.props.canvas.scale = Math.min(
            (this.props.size.width - this.props.canvas.paddingLeft - this.props.canvas.paddingRight)
            / this.props.ratio.width,
            (this.props.size.height - this.props.canvas.paddingTop - this.props.canvas.paddingBottom)
            / this.props.ratio.height);

        this.vsService.changeCanvasScale(this.props.canvas.scale);

        this.props.canvas.border.left = (this.props.size.width - this.props.ratio.width * this.props.canvas.scale) / ((this.props.canvas.paddingLeft + this.props.canvas.paddingRight) / this.props.canvas.paddingLeft);
        this.props.canvas.border.top = (this.props.size.height - this.props.ratio.height * this.props.canvas.scale) / ((this.props.canvas.paddingTop + this.props.canvas.paddingBottom) / this.props.canvas.paddingTop) / 2;
        this.props.canvas.border.width = this.props.ratio.width * this.props.canvas.scale;
        this.props.canvas.border.height = this.props.ratio.height * this.props.canvas.scale;

        this.props.borders = [];
        this.props.borders.push(new fabric.Line([0, this.props.canvas.border.height / this.props.canvas.scale, 0, 0], {
            left: 0,
            top: 0,
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeDashArray: [3, 3],
            hoverCursor: 'grab',
            strokeWidth: 3
        }));
        this.props.borders.push(new fabric.Line([0, 0, this.props.canvas.border.width / this.props.canvas.scale, 0], {
            left: 0,
            top: 0,
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeDashArray: [3, 3],
            hoverCursor: 'grab',
            strokeWidth: 3
        }));
        this.props.borders.push(new fabric.Line([this.props.canvas.border.width / this.props.canvas.scale, 0, this.props.canvas.border.width / this.props.canvas.scale, this.props.canvas.border.height / this.props.canvas.scale], {
            left: Math.ceil((this.props.canvas.border.width - 3) / this.props.canvas.scale),
            top: 0,
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeDashArray: [3, 3],
            hoverCursor: 'grab',
            strokeWidth: 3
        }));
        this.props.borders.push(new fabric.Line([0, this.props.canvas.border.height / this.props.canvas.scale, this.props.canvas.border.width / this.props.canvas.scale, this.props.canvas.border.height / this.props.canvas.scale], {
            left: 0,
            top: Math.ceil((this.props.canvas.border.height - 3) / this.props.canvas.scale),
            stroke: this.props.canvas.border.color,
            selectable: false,
            strokeDashArray: [3, 3],
            hoverCursor: 'grab',
            strokeWidth: 3
        }));
        const pointsInside = [
            {
                x: 0,
                y: 0
            },
            {
                x: this.props.canvas.border.width / this.props.canvas.scale,
                y: 0
            },
            {
                x: this.props.canvas.border.width / this.props.canvas.scale,
                y: this.props.canvas.border.height / this.props.canvas.scale
            },
            {
                x: 0,
                y: this.props.canvas.border.height / this.props.canvas.scale
            }
        ];
        const pointsOutside = [
            {
                x: -Math.floor(this.props.canvas.border.left / this.props.canvas.scale) - 1,
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) - 1
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale) + Math.floor(this.props.canvas.border.left / this.props.canvas.scale) + 1,
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) - 1
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale) + Math.floor(this.props.canvas.border.left / this.props.canvas.scale) + 1,
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale) + 1
            },
            {
                x: Math.floor(this.props.canvas.border.width / this.props.canvas.scale),
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale) + 1,
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
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale) + 1,
            },
            {
                x: - Math.floor(this.props.canvas.border.left / this.props.canvas.scale) - 1,
                y: - Math.floor(this.props.canvas.border.top / this.props.canvas.scale) + Math.floor(this.props.size.height / this.props.canvas.scale) + 1
            }
        ];

        // const polygonInside = new fabric.Polygon(pointsInside, {
        //     left: pointsInside[0].x,
        //     top: pointsInside[0].y,
        //     fill: '#f00',
        //     selectable: false,
        //     evented: false,
        //     objectCaching: false,
        //     strokeWidth: 0
        // });
        const polygonOutside = new fabric.Polygon(pointsOutside, {
            left: pointsOutside[0].x,
            top: pointsOutside[0].y,
            fill: 'rgba(0, 0, 0, 0.2)',
            selectable: false,
            evented: false,
            objectCaching: false,
            strokeWidth: 0
        });

        for (let i = 0; i < this.props.borders.length; i++) {
            this.extend(this.props.borders[i], { border: true });
            this.element.canvas.add(this.props.borders[i]);
        }
        this.extend(polygonOutside, { border: true });
        this.element.canvas.add(polygonOutside);

        // this.extend(polygonInside, { border: true });
        // this.element.canvas.add(polygonInside);
        // this.element.canvas.sendToBack(polygonInside);
        // this.element.canvas.setBackgroundColor('#f00', this.element.canvas.renderAll.bind(this.element.canvas));


        this.element.canvas.setDimensions(this.props.size);
        this.element.canvas.setViewportTransform([this.props.canvas.scale, 0, 0, this.props.canvas.scale, this.props.canvas.border.left, this.props.canvas.border.top]);
        this.element.canvas.renderAll();

        this.props.frame.inital_loading = true;
        this.props.frame.loaded_overlay_count = 0;
        this.props.hoverId = null;

        const $this = this;

        for (const id in this.props.overlays) {
            if (this.props.overlays.hasOwnProperty(id)) {
                const overlay = this.props.overlays[id];

                if (overlay.state !== 'removed') {
                    const object = overlay.object;
                    object.id = overlay.id;
                    if (object.type === 'textbox') {
                        if (!this.vsService.isLoadedFontFamily(object.fontFamily)) {
                            this.fsService.loadFont({ family: object.fontFamily, style: object.fontStyle, size: object.fontSize });
                            this.vsService.loadFontFamily(object.fontFamily);
                            setTimeout(() => {
                                this.addTextOverlay(object);
                            }, 300);
                        } else {
                            this.addTextOverlay(object);
                        }
                    } else {
                        if (object.type === 'image') {
                            this.addImageOverlay(object);
                        } else {
                            this.addGifOverlay(object);
                        }
                    }
                }
            }
        }
    }

    getBorder() {
        return this.props.canvas.border;
    }

    getSize() {
        return this.props.size;
    }

    getScale() {
        return this.props.canvas.scale;
    }

    addTextOverlay(data) {
        data.hasRotatingPoint = true;
        const text = new fabric.Textbox(data.text, data);
        this.extend(text, {id: data.id, colorModified: data.colorModified});
        text.set(this.props.cornerProps);
        text.setControlsVisibility({'tl': false, 'tr': false, 'mt': false, 'mb': false, 'bl': false, 'br': false});
        this.element.canvas.add(text);
        text.setCoords();
        this.element.canvas.renderAll();
    }

    addImageOverlay(data) {
        fabric.Image.fromURL(data.src, (image) => {
            image.set(data);
            this.extend(image, {id: data.id});
            image.set(this.props.cornerProps);
            this.element.canvas.add(image);
            image.setCoords();
            this.element.canvas.renderAll();
        });
    }

    addGifOverlay(data) {
        const gifpath = path.dirname(data.src) + '/' + path.basename(data.src, path.extname(data.src)) + '.png';
        fabric.Sprite.fromURL(gifpath, (sprite) => {
            sprite.set(data);
            this.extend(sprite, { id: data.id, delays: data.delays });
            sprite.set(this.props.cornerProps);
            this.element.canvas.add(sprite);
            sprite.setCoords();
            setTimeout(function () {
                sprite.play();
            }, 100);
        }, { crossOrigin: 'Anonymous', width: data.width, height: data.height, delays: data.delays });
    }

    clone(activeObject) {
        if (activeObject) {
            const object = JSON.parse(JSON.stringify(activeObject.toObject()));
            object.left = parseInt(object.left) + 10;
            object.top = parseInt(object.top) + 10;
            object.id = this.vsService.fakeId();
            const overlay = {
                id: object.id,
                state: 'added',
                ostate: 'updated',
                order: this.props.frame.total_overlay_count + 1,
                object: object,
            };
            this.props.frame.total_overlay_count += 1;
            this.props.overlays[overlay.id] = overlay;
            if (object.type === 'textbox') {
                this.addTextOverlay(object);
            } else if (object.type === 'image') {
                this.addImageOverlay(object);
            } else if (object.type === 'sprite') {
                this.addGifOverlay(object);
            }
        }
    }

    getPrevObject(object) {
        const objects = this.element.canvas.getObjects();
        const obj_index = objects.findIndex(o => '' + o.toObject().id === '' + object.toObject().id);
        if (obj_index > 0) {
            return objects[obj_index - 1];
        }
    }

    getNextObject(object) {
        const objects = this.element.canvas.getObjects();
        const obj_index = objects.findIndex(o => '' + o.toObject().id === '' + object.toObject().id);
        if (obj_index < objects.length - 1) {
            return objects[obj_index + 1];
        }
    }

    getIndex(object) {
        const objects = this.element.canvas.getObjects();
        const obj_index = objects.findIndex(o => '' + o.toObject().id === '' + object.toObject().id);
        return obj_index;
    }

    removeSelected() {
        const activeObject = this.element.canvas.getActiveObject();

        if (activeObject && !activeObject.isEditing) {
            const aid = activeObject.toObject().id;
            this.props.overlays[aid].state = 'removed';
            this.props.frame.total_overlay_count -= 1;
            this.element.canvas.remove(activeObject);

            const order = this.props.overlays[aid].order;
            for (const id in this.props.overlays) {
                if (this.props.overlays.hasOwnProperty(id)) {
                    if (this.props.overlays[id].order > order) {
                        this.props.overlays[id].ostate = 'modified';
                        this.props.overlays[id].order -= 1;
                    }
                }
            }

            $('#documentSyncStatus').html('Unsaved changes');
            this.props.modified = true;
        }
    }

    back() {
        const activeObject = this.element.canvas.getActiveObject();

        if (activeObject) {
            const id = activeObject.toObject().id;
            const order = this.props.overlays[id].order;
            if (order > 1) {
                const prevObject = this.getPrevObject(activeObject);
                this.element.canvas.moveTo(activeObject, this.getIndex(activeObject) - 1);
                this.props.overlays[id].order = order - 1;
                this.props.overlays[prevObject.toObject().id].order = order;
                if (this.props.overlays[id].ostate === 'updated') {
                    this.props.overlays[id].ostate = 'modified';
                }
                if (this.props.overlays[prevObject.toObject().id].ostate === 'updated') {
                    this.props.overlays[prevObject.toObject().id].ostate = 'modified';
                }
            }

            $('#documentSyncStatus').html('Unsaved changes');
            this.props.modified = true;
        }
    }

    prev() {
        const activeObject = this.element.canvas.getActiveObject();

        if (activeObject) {
            const id = activeObject.toObject().id;
            const order = this.props.overlays[id].order;
            if (order < this.props.frame.total_overlay_count) {
                const nextObject = this.getNextObject(activeObject);
                this.element.canvas.moveTo(activeObject, this.getIndex(activeObject) + 1);
                this.props.overlays[id].order = order + 1;
                this.props.overlays[nextObject.toObject().id].order = order;
                if (this.props.overlays[id].ostate === 'updated') {
                    this.props.overlays[id].ostate = 'modified';
                }
                if (this.props.overlays[nextObject.toObject().id].ostate === 'updated') {
                    this.props.overlays[nextObject.toObject().id].ostate = 'modified';
                }
            }

            $('#documentSyncStatus').html('Unsaved changes');
            this.props.modified = true;
        }
    }

    setFontFamily(fontFamily) {
        this.setActiveProp('fontFamily', fontFamily);
    }

    setTextAlign(textAlign) {
        this.setActiveProp('textAlign', textAlign);
    }

    setFontStyle(italic) {
        this.setActiveProp('fontStyle', italic ? 'italic' : '');
    }

    setUnderline(underline) {
        this.setActiveProp('underline', underline);
    }

    setBold(bold) {
        this.setActiveProp('fontWeight', bold ? 'bold' : '');
    }

    setFontSize(fontSize) {
        this.setActiveProp('fontSize', parseInt(fontSize));
    }

    setCharSpacing(charSpacing) {
        this.setActiveProp('charSpacing', charSpacing);
    }

    setLineHeight(lineHeight) {
        this.setActiveProp('lineHeight', parseFloat(lineHeight));
    }

    setFill(fill) {
        this.setActiveProp('fill', fill);
    }

    setOpacity(opacity) {
        const activeObject = this.element.canvas.getActiveObject();

        if (activeObject) {
            this.setActiveProp('opacity', opacity / 100);
            const id = activeObject.toObject().id;
            if (this.props.overlays[id].state === 'updated') {
                this.props.overlays[id].state = 'modified';
            }

            if (activeObject.type === 'textbox') {
                activeObject.setCoords(true);
                this.props.overlays[id].dataurl = activeObject.toDataURL({ format: 'png' });
            }
            this.props.overlays[id].object = JSON.parse(JSON.stringify(activeObject.toObject()));
            activeObject.setCoords();

            $('#documentSyncStatus').html('Unsaved changes');
            this.props.modified = true;
        }
    }

    setActiveProp(name, value) {
        const object = this.element.canvas.getActiveObject();
        if (object) {
            object.set(name, value).setCoords();
            this.element.canvas.renderAll();
        }
    }

    extend(obj, additionalParams) {
        obj.toObject = (function (toObject) {
            return function () {
                return fabric.util.object.extend(toObject.call(this), additionalParams);
            };
        })(obj.toObject);
    }

    getObject(id) {
        return this.element.canvas.getObjects().find(object => '' + object.toObject().id === '' + id);
    }

    destructor() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }
}
