import * as iro from '@jaames/iro';
import { EventEmitter } from '@angular/core';

export class MyColorpicker {
    public picker: any;
    public onColorChange = new EventEmitter();
    public onInputEnd = new EventEmitter();

    constructor(className: String) {
        this.init(className);
    }

    init(className: String): any {
        this.picker = new iro.ColorPicker(className, {
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
        this.picker.on('input:end', (color) => {
            const hex = color.hexString;
            this.onInputEnd.emit(hex);
        });
    }

    setColor(textColor: any) {
        this.picker.color.hexString = textColor;
    }
}
