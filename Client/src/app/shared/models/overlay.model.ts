declare var $: any;

export class Overlay /*extends FrameRecord*/ {
    fake_id: string;
    ovl_id: number;
    ovl_type: number;
    ovl_content: any;
    ovl_order: number;
    ovl_reposition: any;
    ovl_json: string;
    ovl_state: string;
    frm_id: number;

    constructor( jsonData: any ) {
        $.extend(this, jsonData);
        this.ovl_state = 'updated';
    }

    toJSON() {
        return {
            fake_id: this.fake_id,
            ovl_id: this.ovl_id,
            ovl_type: this.ovl_type,
            ovl_content: this.ovl_content,
            ovl_order: this.ovl_order,
            ovl_reposition: this.ovl_reposition,
            ovl_json: this.ovl_json,
            ovl_state: this.ovl_state,
        };
    }

    clone() {
        return new Overlay(this.toJSON());
    }
}
