import { Directive, Input, ElementRef, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appButtonFontSize]'
})
export class ButtonFontSizeDirective implements OnInit, OnDestroy {
  @Input() size: string;
  @Input() onSetFontSize: any;

  private dom;
  private $uns;

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    $(this.dom).addClass('toolbar__button');
    $(this.dom).data('size', this.size);
    $(this.dom).html(this.size);

    this.$uns = this.onSetFontSize.subscribe({
      next: (fontSize) => {
        if (this.size === fontSize) {
          // tslint:disable-next-line:no-unused-expression
          !$(this.dom).hasClass('toolbar__button--selected') ? $(this.dom).addClass('toolbar__button--selected') : '';
        } else {
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).hasClass('toolbar__button--selected') ? $(this.dom).removeClass('toolbar__button--selected') : '';
        }
      }
    });
  }

  ngOnDestroy() {
    this.$uns.unsubscribe();
  }
}
