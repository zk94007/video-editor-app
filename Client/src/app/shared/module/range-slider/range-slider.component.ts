import { Component, OnInit, ElementRef, ViewEncapsulation, Input, Output, EventEmitter } from '@angular/core';

import * as noUiSlider from 'nouislider';

@Component({
  selector: 'app-range-slider',
  templateUrl: './range-slider.component.html',
  styleUrls: ['./range-slider.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class RangeSliderComponent implements OnInit {

  public slider;

  @Input()
  public start: number | Array<number> = 0;

  @Input()
  public rangeMin = 0;

  @Input()
  public rangeMax = 255;

  @Output()
  public change = new EventEmitter();

  @Output()
  public update = new EventEmitter();

  constructor(
    private sliderElement: ElementRef
  ) { }

  ngOnInit() {
    this.slider = noUiSlider.create(this.sliderElement.nativeElement, {
      start: this.start,
      connect: true,
      range: {
        min: this.rangeMin,
        max: this.rangeMax
      }
    });

    this.slider.on('change', (value) => this.change.emit(value));
    this.slider.on('update', (value) => this.update.emit(value));
  }

}
