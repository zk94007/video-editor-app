import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appButtonSubmenu]'
})
export class ButtonSubmenuDirective {
  @Input() type: any;

  private dom: any;

  @HostListener('document:click', ['$event'])
  onDocumentClick($event) {
    if ($event.target !== this.dom) {
      if (this.type === 'textSize') {
        if ($event.target === $(this.dom).children()[0]) {
        } else {
          $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
            // tslint:disable-next-line:no-unused-expression
            $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
          $(this.dom).children().removeClass('toolbar__inputButton--active');
        }
      } else if (this.type === 'textAlign') {
        if ($event.target === $('.toolbar__button--left')[0] ||
            $event.target === $('.toolbar__button--center')[0] ||
            $event.target === $('.toolbar__button--right')[0]) {
        } else {
          $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
            // tslint:disable-next-line:no-unused-expression
            $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
        }
      } else if (this.type === 'transparent') {
        if (this.findAllChildren($('.toolbar--transparent'), $event) === true) {
        } else {
          $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
            // tslint:disable-next-line:no-unused-expression
            $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
        }
      } else if (this.type === 'spacing') {
        if (this.findAllChildren($('.toolbar--spacing'), $event) === true) {
        } else {
          $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
            // tslint:disable-next-line:no-unused-expression
            $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
        }
      } else if (this.type === 'textColor') {
        if (this.findAllChildren($('.my-colorpicker'), $event) === true ||
            this.findAllChildren($('.my-colorpicker-colorcode'), $event) === true) {
        } else {
          $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
        }
      } else {
        $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
      }
    } else {
      if (this.type === 'textSize') {
        !$(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).parent().addClass('toolbar__item--submenuExpanded') : '';
        !$(this.dom).children().hasClass('toolbar__inputButton--active') ?
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).children().addClass('toolbar__inputButton--active') : '';

        $(this.dom).children().hasClass('toolbar__inputButton--active') ?
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).children().focus() : '';
        $(this.dom).children().hasClass('toolbar__inputButton--active') ?
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).children().select() : '';
      } else {
        $(this.dom).parent().toggleClass('toolbar__item--submenuExpanded');
      }
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
