import { Directive, Input, HostListener, ElementRef, OnInit, OnDestroy } from '@angular/core';
import * as $ from 'jquery';

@Directive({
  selector: '[appASidebar]'
})
export class ASidebarDirective implements OnInit, OnDestroy {
  private dom;
  private $uns;

  @Input() value: number;
  @Input() onChangeStage: any;

  constructor(private el: ElementRef) {
    this.dom = el.nativeElement;
  }

  ngOnInit() {
    this.$uns = this.onChangeStage.subscribe({
      next: (stage: number) => {
        if (stage === this.value) {
          // tslint:disable-next-line:no-unused-expression
          !$(this.dom).parent().hasClass('on') ? $(this.dom).parent().addClass('on') : '';
        } else {
          // tslint:disable-next-line:no-unused-expression
          $(this.dom).parent().hasClass('on') ? $(this.dom).parent().removeClass('on') : '';
        }
      }
    });
  }

  ngOnDestroy() {
    this.$uns.unsubscribe();
  }
}
