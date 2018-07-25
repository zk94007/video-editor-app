import { Component, OnInit, ViewChild, Input, OnDestroy, Output } from '@angular/core';
import { frameAnimation } from './animations';

import {
  PerfectScrollbarConfigInterface,
  PerfectScrollbarComponent, PerfectScrollbarDirective
} from 'ngx-perfect-scrollbar';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';

@Component({
  selector: 'app-vs-frameline',
  templateUrl: './vs-frameline.component.html',
  styleUrls: ['./vs-frameline.component.scss'],
  animations: [
    frameAnimation
  ]
})
export class VsFramelineComponent implements OnInit, OnDestroy {
  private $uns: any = [];

  public frames: any = [];
  public props: any = {
    selectedFrmId: null
  };

  public sortableOptions: any;
  public config: PerfectScrollbarConfigInterface = {};

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;
  @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;

  constructor(private vsService: VideoStudioService) {
    this.config = {
      wheelSpeed: 1,
      wheelPropagation: true,
      useBothWheelAxes: true,
      suppressScrollY: true
    };

    this.sortableOptions = {
      animation: 150,
      onUpdate: (event: any) => {
        this.changeOrders();
      }
    };

    this.$uns.push(this.vsService.onLoad.subscribe(() => {
      this.frames = this.vsService.getFrames();
      if (this.frames.length > 0) {
        this.selectFrame(this.frames[0].frm_id);
      }
    }));

    this.$uns.push(this.vsService.onDeleteFrame.subscribe((response) => {
      this.frames.splice(response.index, 1);
    }));

    this.$uns.push(this.vsService.onDuplicateFrame.subscribe((response) => {
      this.frames.splice(response.index, 0, response.frame);
    }));
  }

  ngOnInit() {
    if (this.directiveScroll) {
      this.directiveScroll.scrollToRight(1);
    }
  }

  ngOnDestroy() {
    this.$uns.forEach(element => {
      element.unsubscribe();
    });
  }

  selectFrame(frm_id) {
    this.props.selectedFrmId = frm_id;
    this.vsService.selectFrame(frm_id);
  }

  deleteFrame($event, frm_id) {
    if (this.frames.length >= 2) {
      $event.stopPropagation();
      const index = this.frames.findIndex(f => f.frm_id === frm_id);
      if (index === this.frames.length - 1) {
        this.vsService.selectFrame(this.frames[index - 1].frm_id);
      } else {
        this.vsService.selectFrame(this.frames[index + 1].frm_id);
      }
      this.vsService._deleteFrame(frm_id);
    } else {
      alert('There must be at least one frame');
    }
  }

  duplicateFrame($event, frm_id) {
    $event.stopPropagation();
    this.vsService._duplicateFrame(frm_id);
  }

  changeOrders() {
    const orders = [];

    for (let i = 0; i < this.frames.length; i++) {
      orders.push({
        frm_id: this.frames[i].frm_id,
        frm_order: i + 1
      });
    }

    this.vsService._updateFrameOrders(orders);
  }
}
