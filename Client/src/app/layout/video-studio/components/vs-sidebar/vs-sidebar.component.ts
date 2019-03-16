import { Component, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarComponent, PerfectScrollbarDirective
} from 'ngx-perfect-scrollbar';
import { Font } from '../../../../shared/interfaces/font-picker.interfaces';

@Component({
  selector: 'app-vs-sidebar',
  templateUrl: './vs-sidebar.component.html',
  styleUrls: ['./vs-sidebar.component.scss'],
})

export class VsSidebarComponent implements OnInit {

  public onChangeStage = new EventEmitter<number>();
  public config: PerfectScrollbarConfigInterface = {};

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;
  @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;

  public props: any = {
    stage: null,
  };

  // public SIDEBAR_STAGE_SEARCH = 1;
  // public SIDEBAR_STAGE_TEXT = 2;
  // public SIDEBAR_STAGE_BACKGROUND = 3;
  
  // public SIDEBAR_STAGE_MUSIC = 5;
  // public SIDEBAR_STAGE_UPLOAD = 6;

  public SIDEBAR_STAGE_TEXT = 1;
  public SIDEBAR_STAGE_BACKGROUND = 2;
  public SIDEBAR_STAGE_ELEMENTS = 3;
  public SIDEBAR_STAGE_UPLOAD = 4;  

  constructor() { }

  ngOnInit() {
    this.config = {
      wheelSpeed: 2,
      wheelPropagation: true,
      minScrollbarLength: 20
    };

    this.props.stage = this.SIDEBAR_STAGE_ELEMENTS;
  }

  changeStage(stage) {
    this.props.stage = stage;
    this.onChangeStage.emit(this.props.stage);
  }
}
