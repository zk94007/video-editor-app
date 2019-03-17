import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RangeSliderComponent } from './range-slider.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    RangeSliderComponent
  ],
  exports: [
    RangeSliderComponent
  ]
})
export class RangeSliderModule { }
