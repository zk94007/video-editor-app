import { Directive, Input, ElementRef, OnDestroy, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appButtonTextAlign]'
})
export class ButtonTextAlignDirective implements OnInit, OnDestroy {
  @Input() textAlign: string;
  @Input() onSetTextAlign: any;

  private dom;
  private $uns;

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    $(this.dom).addClass('toolbar__button toolbar__button--' + this.textAlign + ' toolbar__button--icon');

    this.$uns = this.onSetTextAlign.subscribe({
      next: (textAlign) => {
        if (this.textAlign === textAlign) {
          !$(this.dom).parent().hasClass('toolbar__item--active') ? $(this.dom).parent().addClass('toolbar__item--active') : '';
        } else {
          $(this.dom).parent().hasClass('toolbar__item--active') ? $(this.dom).parent().removeClass('toolbar__item--active') : '';
        }
      }
    });
  }

  ngOnDestroy() {
    this.$uns.unsubscribe();
  }
}
