import { Directive, ElementRef, HostListener } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appLiActiveHover]'
})
export class LiActiveHoverDirective {
  private dom;

  @HostListener('mouseenter')
  onMouseEnter() {
    // tslint:disable-next-line:no-unused-expression
    !$(this.dom).hasClass('active') ? $(this.dom).addClass('active') : '';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    // tslint:disable-next-line:no-unused-expression
    $(this.dom).hasClass('active') ? $(this.dom).removeClass('active') : '';
  }

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
    $(this.dom).addClass('selectable');
  }

}
