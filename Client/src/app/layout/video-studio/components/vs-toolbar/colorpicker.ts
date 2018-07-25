import * as iro from '@jaames/iro';
import { EventEmitter } from '@angular/core';

export class MyColorpicker {
    public picker: any;
    public onColorChange = new EventEmitter();

    constructor() {
        this.init();
    }

    init(): any {
        this.picker = new iro.ColorPicker('.my-colorpicker', {
            width: 200,
            height: 240,
            color: {r: 255, g: 255, b: 255},
            anticlockwise: true,
            borderWidth: 1,
            borderColor: '#fff',
        });

        this.picker.on('color:change', (color) => {
            const hex = color.hexString;
            this.onColorChange.emit(hex);
        });
    }

    setColor(textColor: any) {
        this.picker.color.hexString = textColor;
    }
}
