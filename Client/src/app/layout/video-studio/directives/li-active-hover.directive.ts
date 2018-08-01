import { Directive, ElementRef, HostListener } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appLiActiveHover]'
})
export class LiActiveHoverDirective {
  private dom;

  @HostListener('mouseenter')
  onMouseEnter() {
    !$(this.dom).hasClass('active') ? $(this.dom).addClass('active') : '';
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    $(this.dom).hasClass('active') ? $(this.dom).removeClass('active') : '';
  }

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
    $(this.dom).addClass('selectable');
  }

}
