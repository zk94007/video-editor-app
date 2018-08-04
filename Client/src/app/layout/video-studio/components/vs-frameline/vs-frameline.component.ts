import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
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
    frames: {},
    modified: false,
    duplicatingObject: null
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

      this.props.frames = {};
      this.frames.forEach((_frame) => {
        const frame = {
          id: _frame.frm_id,
          state: 'updated',
          ostate: 'updated',
          order: _frame.frm_order
        };
        this.props.frames[frame.id] = frame;
      });
    }));

    //@Kostya
    this.$uns.push(this.vsService.onDeleteFrame.subscribe((response) => {
      // const index = this.frames.findIndex(f => f.frm_id === response.frm_id);
      // this.frames.splice(index, 1);
      // this.props.isDeleting = false;
      // this.changeOrders();
    }));

    //@Kostya
    this.$uns.push(this.vsService.onDuplicateFrame.subscribe((response) => {
      // this.frames[response.index] = response.frame;
      const fake_id = response.fake_id;
      const frm_id = response.frm_id;

      if (this.props.frames[fake_id] === undefined) {
        return;
      }

      this.props.frames[frm_id] = {
        id: frm_id,
        state: 'updated',
        ostate: 'updated',
        order: this.props.frames[fake_id].order,
        src_id: this.props.frames[fake_id].src_id,
      }

      delete this.props.frames[fake_id];

      const index = this.frames.findIndex(f => f.frm_id === fake_id);

      this.props.duplicatingObject.frm_id = frm_id;
      this.frames[index] = this.props.duplicatingObject;
      this.props.duplicatingObject = null;
    }));

    //@Kostya
    this.$uns.push(this.vsService.onUpdateFrameline.subscribe(frames => {
      if (this.props.modified) {
          this.updateFrameline();
      }
    }));
  }

  updateFrameline() {
    this.props.modified = false;
    $('#documentSyncStatus').html('Saving...');

    for (const id in this.props.frames) {
      if (this.props.frames.hasOwnProperty(id)) {
        if (this.props.frames[id].state === 'added') {
          this.props.frames[id].state = 'pending';
          this.vsService._duplicateFrame(this.props.frames[id].src_id, this.props.frames[id].id, this.props.frames[id].order);
        }
        if (this.props.frames[id].state === 'removed' && !this.isFake(id)) {
          delete this.props.frames[id];
          this.vsService._deleteFrame(id);
        }
      }
    }

    const orders = [];
    for (const id in this.props.frames) {
      if (this.props.frames.hasOwnProperty(id) && !this.isFake(id)) {
        if (this.props.frames[id].state !== 'removed' && this.props.frames[id].ostate == 'modified') {
          orders.push({
            frm_id: id,
            frm_order : this.props.frames[id].order
          });

          this.props.frames[id].ostate = 'updated';
        }
      }
    }

    if (orders.length) {
      this.vsService._updateFrameOrders(orders);
    }

    setTimeout(() => {
      if (!this.props.modified) {
          $('#documentSyncStatus').html('All changes saved');
      }
    }, 800);
  }

  isFake(id) {
    return (id + '').includes('fake');
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
    if (this.isFake(frm_id)) {
      return;
    }
    this.props.selectedFrmId = frm_id;
    const index = this.frames.findIndex(f => f.frm_id == frm_id);
    if (this.frames[index].frm_path != loadingURL) {
      this.vsService.selectFrame(frm_id);
    }
  }

  //@Kostya
  deleteFrame($event, frm_id) {
    if (this.frames.length >= 2) {
      $event.stopPropagation();
      const index = this.frames.findIndex(f => f.frm_id === frm_id);
      const aid = this.frames[index].frm_id;
      this.props.frames[aid].state = 'removed';
      this.frames.splice(index, 1);

      const order = index + 1;
      for (const id in this.props.frames) {
        if (this.props.frames.hasOwnProperty(id)) {
          if (this.props.frames[id].order > order) {
            this.props.frames[id].order -= 1;
            this.props.frames[id].ostate = 'modified';
          }
        }
      }

      $('#documentSyncStatus').html('Unsaved changes');
      this.props.modified = true;
    } else {
      alert('There must be at least one frame');
    }
  }

  //@Kostya
  duplicateFrame($event, frm_id) {
    $event.stopPropagation();
    const index = this.frames.findIndex(f => f.frm_id === frm_id);
    this.props.duplicatingObject = JSON.parse(JSON.stringify(this.frames[index]));
    const frame = {
      id: this.vsService.fakeId(),
      state: 'added',
      ostate: 'updated',
      order: index + 2,
      src_id: this.props.duplicatingObject.frm_id
    };
    if (this.isFake(frame.src_id)) {
      frame.src_id = this.props.frames[this.props.duplicatingObject.frm_id].src_id;
    }

    for (const id in this.props.frames) {
      if (this.props.frames.hasOwnProperty(id)) {
        if (this.props.frames[id].order >= frame.order) {
          this.props.frames[id].order += 1;
          this.props.frames[id].ostate = "modified";
        }
      }
    }

    this.props.frames[frame.id] = frame;

    this.props.duplicatingObject.frm_id = frame.id;
    let fake_frame = {
      frm_id: frame.id,
      frm_path: loadingURL,
      frm_type: 2
    }
    this.frames.splice(index + 1, 0, fake_frame);

    $('#documentSyncStatus').html('Unsaved changes');
    this.props.modified = true;
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
