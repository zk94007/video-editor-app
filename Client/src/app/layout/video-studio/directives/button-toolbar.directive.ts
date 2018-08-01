import { Directive, Input, ElementRef, OnInit, OnDestroy, HostListener } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appButtonToolbar]'
})
export class ButtonToolbarDirective implements OnInit, OnDestroy {
  private dom;
  private $uns;

  @Input() name: any;
  @Input() displayName: any;
  @Input() iconable: any;
  @Input() checkable: string;
  @Input() onCheck: any;

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
    $(this.dom).addClass('toolbar__button');
  }

  ngOnInit() {
    if (this.iconable === 'true') {
      $(this.dom).addClass('toolbar__button--icon');
    }
    $(this.dom).addClass('toolbar__button--' + this.name);
    $(this.dom).append('<span class="toolbar__label">' + this.displayName + '</span>');

    if (this.checkable === 'true') {
      this.$uns = this.onCheck.subscribe({
        next: (check) => {
          if (check) {
            !$(this.dom).parent().hasClass('toolbar__item--active') ? $(this.dom).parent().addClass('toolbar__item--active') : '';
          } else {
            $(this.dom).parent().hasClass('toolbar__item--active') ? $(this.dom).parent().removeClass('toolbar__item--active') : '';
          }
        }
      });
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick($event) {
    if ($event.target !== this.dom) {
      if (this.name === 'arrange' || this.name === 'transparent') {
        $(this.dom).parent().hasClass('toolbar__item--submenuExpanded') ?
        $(this.dom).parent().removeClass('toolbar__item--submenuExpanded') : '';
      }
    } else {
      $(this.dom).parent().toggleClass('toolbar__item--submenuExpanded');
    }
  }

  ngOnDestroy() {
    if (this.checkable === 'true') {
      this.$uns.unsubscribe();
    }
  }
}
