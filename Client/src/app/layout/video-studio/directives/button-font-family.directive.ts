import { Directive, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appButtonFontFamily]'
})
export class ButtonFontFamilyDirective implements OnInit, OnDestroy {
  private dom;
  private $uns;

  @Input() onSetFontFamily: any;
  @Input() name: string;
  @Input() displayName: string;
  @Input() imageSrc: string;
  @Input() family: string;

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    $(this.dom).addClass('toolbar__button toolbar__button--font');
    $(this.dom).data('family', this.family);
    $(this.dom).append(this.displayName);

    this.$uns = this.onSetFontFamily.subscribe({
      next: (fontFamily) => {
        if (this.family === fontFamily) {
          !$(this.dom).hasClass('toolbar__button--selected') ? $(this.dom).addClass('toolbar__button--selected') : '';
        } else {
          $(this.dom).hasClass('toolbar__button--selected') ? $(this.dom).removeClass('toolbar__button--selected') : '';
        }
      }
    });
  }

  ngOnDestroy() {
    this.$uns.unsubscribe();
  }
}
