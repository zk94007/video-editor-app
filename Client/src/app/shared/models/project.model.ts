import { Frame } from './frame.model';
import { UploadImage } from './upload_image.model';
declare var $: any;

export class Project /*extends ProjectRecord*/ {
    prj_id: number;
    prj_name: string;
    prj_frame_count: number;
    prj_created_at: string;
    prj_representative: string;
    prj_is_frames_loaded: boolean;
    prj_is_overlays_loaded: boolean;
    prj_scene_ratio: string;
    prj_frames: Frame[];
    prj_video_path: string;
    upload_images: UploadImage[];
    modified: boolean;

    constructor(jsonData: any) {
        $.extend(this, jsonData);

        if (jsonData.prj_frames) {
            this.prj_frames = $.map( jsonData.prj_frames , (frame) => {
                return new Frame( frame );
            });
        }

        if (jsonData.upload_images) {
            this.upload_images = $.map(jsonData.upload_images, (element) => {
                return new UploadImage(element);
            });
        }

        if (this.prj_video_path !== '' && this.prj_video_path !== undefined && this.prj_video_path !== null) {
            this.modified = false;
        } else {
            this.modified = true;
        }
    }

    getProjectId() {
        return this.prj_id;
    }

    setSceneRatio(sceneRatio) {
        this.modified = true;

        const previous_scene_ratio = this.prj_scene_ratio;
        this.prj_scene_ratio = sceneRatio;

        this.prj_frames.forEach((frame) => {
            function fit_video_2_frame(videoWidth, videoHeight, frameWidth, frameHeight) {
                const fit = {width: 0, height: 0, offsetX: 0, offsetY: 0};

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

            const dimension: any = {
                '916': {
                    width: 400,
                    height: 712,
                },
                '11': {
                    width: 400,
                    height: 400,
                },
                '169': {
                    width: 712,
                    height: 400,
                }
            };

            const fit = fit_video_2_frame(frame.frm_resolution.width,
                frame.frm_resolution.height,
                dimension[this.prj_scene_ratio].width,
                dimension[this.prj_scene_ratio].height);

            frame.frm_reposition = fit;
        });
    }

    getSceneRatio() {
        return this.prj_scene_ratio;
    }

    getOverlay(ovl_id) {
        const frame = this.prj_frames.find(frame => frame.frm_overlays.find(overlay => '' + overlay.ovl_id === '' + ovl_id) !== undefined);
        if (frame !== undefined) {
            return frame.getOverlay(ovl_id);
        }
        return undefined;
    }

    getOverlayIndex(ovl_id) {
        const frame = this.prj_frames.find(frame => frame.frm_overlays.find(overlay => '' + overlay.ovl_id === '' + ovl_id) !== undefined);
        if (frame !== undefined) {
            return frame.getOverlayIndex(ovl_id);
        }

        return undefined;
    }

    addOverlay(frm_id, overlay) {
        const frame = this.getFrame(frm_id);
        if (frame !== undefined) {
            this.modified = true;
            frame.addOverlay(overlay);
        }
    }

    updateOverlay(ovl_id, overlay) {
        const _overlay = this.getOverlay(ovl_id);

        if (_overlay !== undefined) {
            this.modified = true;
            _overlay.ovl_content = overlay.ovl_content;
            _overlay.ovl_json = overlay.ovl_json;
            _overlay.ovl_reposition = overlay.ovl_reposition;
            _overlay.ovl_type = overlay.ovl_type;
        }
    }

    updateOverlayId(fake_id, ovl_id) {
        this.prj_frames.forEach((frame) => {
            if (frame.getFakeOverlay(fake_id) !== undefined) {
                const overlay = frame.getFakeOverlay(fake_id);
                if (overlay !== undefined) {
                    this.modified = true;
                    overlay.ovl_id = ovl_id;
                }
            }
        });
    }

    getUploadImages() {
        const uploadImages = [];
        this.upload_images.forEach(element => uploadImages.push(element.toJSON()));
        return uploadImages;
    }

    getFrames2Json() {
        const prj_frames = [];
        this.prj_frames.forEach(frame => prj_frames.push(frame.toJSON()));
        return prj_frames;
    }

    getFrame(frm_id) {
        return this.prj_frames.find(f => '' + f.frm_id === '' + frm_id);
    }

    getFrameIndex(frm_id) {
        return this.prj_frames.findIndex(f => '' + f.frm_id === '' + frm_id);
    }

    deleteFrame(frm_id) {
        const frame = this.getFrame(frm_id);
        if (frame !== undefined) {
            this.modified = true;

            //@Kostya
            // this.prj_frames.forEach(f => { if (f.frm_order > frame.frm_order) { f.frm_order--; } });
            
            this.prj_frames.splice(this.getFrameIndex(frm_id), 1);
        }
    }

    duplicateFrame(org_frm_id, new_frm_id, new_frm_order, new_overlay_ids) {
        const frame = this.getFrame(org_frm_id);
        if (frame !== undefined) {
            this.modified = true;

            //@Kostya
            // this.prj_frames.forEach(f => { if (f.frm_order > frame.frm_order) { f.frm_order ++; }});
            
            const new_frame = frame.clone();
            new_frame.frm_id = new_frm_id;
            new_frame.frm_order = new_frm_order;
            for (let i = 0; i < new_frame.frm_overlays.length; i++) {
                new_frame.frm_overlays[i].ovl_id = new_overlay_ids[i];
            }
            this.prj_frames.splice(this.getFrameIndex(org_frm_id) + 1, 0, new_frame);
        }
    }

    deleteOverlay(ovl_id) {
        const frame = this.prj_frames.find(frame => frame.frm_overlays.find(overlay => '' + overlay.ovl_id === '' + ovl_id) !== undefined);
        if (frame !== undefined) {
            this.modified = true;
            frame.frm_overlays.splice(frame.getOverlayIndex(ovl_id), 1);
        }
    }

    duplicateOverlay(org_ovl_id, new_ovl_id, new_ovl_order) {
        const overlay = this.getOverlay(org_ovl_id);
        if (overlay !== undefined) {
            this.modified = true;
            const frame = this.getFrame(overlay.frm_id);
            frame.frm_overlays.forEach(o => { if (o.ovl_order > overlay.ovl_order) { o.ovl_order++; } });
            const new_overlay = overlay.clone();
            new_overlay.ovl_id = new_ovl_id;
            new_overlay.ovl_order = new_ovl_order;
            frame.frm_overlays.splice(this.getOverlayIndex(org_ovl_id) + 1, 0, new_overlay);
        }
    }

    toJSON() {
        return {
            prj_id: this.prj_id,
            prj_name: this.prj_name,
            prj_frame_count: this.prj_frame_count,
            prj_created_at: this.prj_created_at,
            prj_representative: this.prj_representative,
            prj_scene_ratio: this.prj_scene_ratio,
        };
    }
}
