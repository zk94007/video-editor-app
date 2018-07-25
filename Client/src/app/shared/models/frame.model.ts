import { Overlay } from './overlay.model';
declare var $: any;

export class Frame /*extends FrameRecord*/ {
    frm_id: number;
    frm_name: string;
    frm_path: string;
    frm_order: number;
    frm_duration: any;
    frm_type: number;
    frm_reposition: any;
    frm_resolution: any;
    frm_gif_delays: any;
    frm_overlays: Overlay[];

    constructor( jsonData: any ) {
        $.extend( this, jsonData );

        if (jsonData.frm_overlays) {
            this.frm_overlays = $.map(jsonData.frm_overlays, (overlay) => {
                return new Overlay(overlay);
            });
        }
    }

    getOverlays2Json() {
        const frm_overlays = [];
        this.frm_overlays.forEach(overlay => frm_overlays.push(overlay.toJSON()));
        return frm_overlays;
    }

    toJSON() {
        return {
            frm_id: this.frm_id,
            frm_name: this.frm_name,
            frm_path: this.frm_path,
            frm_order: this.frm_order,
            frm_duration: this.frm_duration,
            frm_type: this.frm_type,
            frm_reposition: this.frm_reposition,
            frm_resolution: this.frm_resolution,
            frm_gif_delays: this.frm_gif_delays
        };
    }

    getOverlay(ovl_id) {
        const overlay = this.frm_overlays.find(o => '' + o.ovl_id === '' + ovl_id);
        return overlay;
    }

    getOverlayIndex(ovl_id) {
        const index = this.frm_overlays.findIndex(o => '' + o.ovl_id === '' + ovl_id);
        return index;
    }

    getFakeOverlay(fake_id) {
        const overlay = this.frm_overlays.find(o => o.fake_id ? '' + o.fake_id === '' + fake_id : false);
        return overlay;
    }

    addOverlay(overlay) {
        this.frm_overlays.push(new Overlay({
            fake_id: overlay.fake_id,
            ovl_id: overlay.ovl_id,
            ovl_type: overlay.ovl_type,
            ovl_content: overlay.ovl_content,
            ovl_order: overlay.ovl_order,
            ovl_reposition: overlay.ovl_reposition,
            ovl_json: overlay.ovl_json
        }));
    }

    clone() {
        const frame: any = this.toJSON();
        frame.frm_overlays = this.getOverlays2Json();
        return new Frame(frame);
    }
}
