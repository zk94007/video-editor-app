import { Component, OnInit, ViewChild, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { frameAnimation } from './animations';

import { PerfectScrollbarConfigInterface, PerfectScrollbarComponent, PerfectScrollbarDirective } from 'ngx-perfect-scrollbar';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';

const loadingURL = 'assets/video-studio/wait.gif';

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
    selectedFrmId: null,
    isDuplicating: false,
    isDeleting: false
  };

  public sortableOptions: any;
  public config: PerfectScrollbarConfigInterface = {};

  @ViewChild(PerfectScrollbarComponent) componentScroll: PerfectScrollbarComponent;
  @ViewChild(PerfectScrollbarDirective) directiveScroll: PerfectScrollbarDirective;

  constructor(private vsService: VideoStudioService, private cdRef: ChangeDetectorRef) {
    this.config = {
      wheelSpeed: 1,
      wheelPropagation: true,
      useBothWheelAxes: true,
      suppressScrollY: true
    };

    this.sortableOptions = {
      animation: 150,
      filter: '.disabled',
      onUpdate: (event: any) => {
        this.changeOrders();
      },
      onMove: (event: any) => {
        return !event.related.classList.contains('disabled');
      }
    };

    this.$uns.push(this.vsService.onLoad.subscribe(() => {
      this.frames = this.vsService.getFrames();
      if (this.frames.length > 0) {
        this.selectFrame(this.frames[0].frm_id);
      }
    }));

    this.$uns.push(this.vsService.onDeleteFrame.subscribe((response) => {
      const index = this.frames.findIndex(f => f.frm_id === response.frm_id);
      this.frames.splice(index, 1);
      this.props.isDeleting = false;
      this.changeOrders();
    }));

    this.$uns.push(this.vsService.onDuplicateFrame.subscribe((response) => {
      this.frames[response.index] = response.frame;
      this.props.isDuplicating = false;
      this.cdRef.detectChanges();
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
    const index = this.frames.findIndex(f => f.frm_id == frm_id);
    if (this.frames[index].frm_path != loadingURL) {
      this.vsService.selectFrame(frm_id);
    }
  }

  deleteFrame($event, frm_id) {
    if (this.props.isDeleting == true || this.props.isDuplicating == true) {
      return;
    }
    if (this.frames.length >= 2) {
      $event.stopPropagation();
      const index = this.frames.findIndex(f => f.frm_id === frm_id);
      let fake_frame = {
        frm_path: loadingURL,
        frm_type: 2
      }
      this.frames[index] = fake_frame;
      this.props.isDeleting = true;

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
    if (this.props.isDuplicating == true || this.props.isDeleting == true) {
      return;
    }
    $event.stopPropagation();
    const index = this.frames.findIndex(f => f.frm_id === frm_id);
    let fake_frame = {
      frm_path: loadingURL,
      frm_type: 2
    }
    this.frames.splice(index + 1, 0, fake_frame);
    this.props.isDuplicating = true;
    
    this.vsService._duplicateFrame(frm_id);
  }

  changeOrders() {
    if (this.props.isDeleting == false && this.props.isDuplicating == false) {
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
}
