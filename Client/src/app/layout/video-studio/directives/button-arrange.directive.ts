import { Directive, Input, ElementRef, OnDestroy, OnInit } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appButtonArrange]'
})
export class ButtonArrangeDirective implements OnInit {
  @Input() arrange: string;

  private dom;
  private $uns;

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    $(this.dom).addClass('toolbar__button toolbar__button--' + this.arrange + ' toolbar__button--icon');
  }
}
