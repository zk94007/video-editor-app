import { Directive, Input, HostListener, ElementRef } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appBlColorpicker]'
})
export class BlColorpickerDirective {
  @Input() iroClass: any;

  private dom: any;

  @HostListener('document:click', ['$event'])
  onDocumentClick($event) {
    if ($event.target != this.dom) {
      if (this.findAllChildren($(this.iroClass), $event) !== true && this.findAllChildren($(this.iroClass + '-colorcode'), $event) !== true) {
        $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ? $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
      }
    } else {
      $(this.dom).parent().toggleClass('toolbar__item--submenuExpanded');
    }
  }

  constructor(private _el: ElementRef) {
    this.dom = _el.nativeElement;
  }

  findAllChildren(element, $event): boolean {
    let ret_val = false;
    const BreakException = {};
    try {
      element.find('*').each(function() {
        if ($event.target === $(this)[0]) {
          ret_val = true;
          throw BreakException;
        }
      });
    } catch (e) {
      if (e !== BreakException) {
        throw e;
      }
    }
    return ret_val;
  }
}
