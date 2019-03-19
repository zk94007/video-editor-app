import { EventEmitter } from '@angular/core';

import iro from '@jaames/iro';
import * as iroTransparencyPlugin from 'iro-transparency-plugin';

export class MyColorpicker {
    public picker: iro;

    public onColorChange = new EventEmitter();

    public onInputEnd = new EventEmitter();

    constructor(className: String) {
        iro.use(iroTransparencyPlugin);

        this.init(className);
    }

    init(className: String): any {
        this.picker = new iro.ColorPicker(className, {
            width: 160,
            height: 160,
            color: { r: 255, g: 255, b: 255, a: 0.6 },
            transparency: true
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
