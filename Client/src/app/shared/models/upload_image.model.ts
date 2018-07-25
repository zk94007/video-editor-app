declare var $: any;

export class UploadImage /*extends FrameRecord*/ {
    uim_id: number;
    prj_id: number;
    uim_path: string;
    uim_name: string;
    uim_gif_delays: any;
    uim_resolution: any;

    constructor( jsonData: any ) {
        $.extend(this, jsonData);
    }

    toJSON() {
        return {
            uim_id: this.uim_id,
            prj_id: this.prj_id,
            uim_path: this.uim_path,
            uim_name: this.uim_name,
            uim_resolution: this.uim_resolution,
            uim_gif_delays: this.uim_gif_delays,
        };
    }

    clone() {
        return new UploadImage(this.toJSON());
    }
}
