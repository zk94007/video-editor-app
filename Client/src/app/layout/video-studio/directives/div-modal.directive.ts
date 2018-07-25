import { Directive, HostListener, ElementRef, EventEmitter, Output } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appDivModal]'
})
export class DivModalDirective {
  @Output() dismiss = new EventEmitter();

  private dom: any;

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown($event) {
    if ($(this.dom).hasClass('active')) {
      if ($($event.target).parents('.' + $(this.dom).data('class')).length === 0) {
        this.dismiss.emit();
      }
    }
  }

  constructor(private _el: ElementRef) {
    this.dom = _el.nativeElement;
  }

}
