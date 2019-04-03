declare var $: any;

export class Music /*extends FrameRecord*/ {
    mus_id: number;
    prj_id: number;
    mus_path: string;
    mus_name: string;
    mus_duration: any;
    mus_type: any;

    constructor( jsonData: any ) {
        $.extend(this, jsonData);
    }

    toJSON() {
        return {
            mus_id: this.mus_id,
            prj_id: this.prj_id,
            mus_path: this.mus_path,
            mus_name: this.mus_name,
            mus_duration: this.mus_duration,
            mus_type: this.mus_type,
        };
    }

    clone() {
        return new Music(this.toJSON());
    }
}
