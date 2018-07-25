import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vs-controlbar',
  templateUrl: './vs-controlbar.component.html',
  styleUrls: ['./vs-controlbar.component.scss']
})
export class VsControlbarComponent implements OnInit, OnDestroy {
  @Output() onCompleteProject = new EventEmitter();
  @Output() onRepositionFrame = new EventEmitter();
  @Output() onBack = new EventEmitter();
  private $uns: any = [];

  public props: any = {
    projectId: 1,
    completeText: ''
  };

  constructor(private vsService: VideoStudioService, public router: Router) {
    this.$uns.push(this.vsService.onLoad.subscribe(() => {
      this.props.projectId = vsService.project.prj_id;
      if (this.vsService.isModified()) {
        this.props.completeText = 'Complete';
      } else {
        this.props.completeText = 'Preview';
      }
    }));
    this.$uns.push(this.vsService.onModified.subscribe(() => {
      console.log('complete');
      this.props.completeText = 'Complete';
    }));
    this.$uns.push(this.vsService.onConcatenate.subscribe(() => {
      this.props.completeText = 'Preview';
    }));
  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.$uns.forEach(($uns) => {
      $uns.unsubscribe();
    });
  }

  public reposition() {
    this.onRepositionFrame.emit();
  }
  public complete() {
    setTimeout(() => {
      if (this.props.completeText === 'Complete') {
        console.log('true');
        this.vsService._startConcatenate(true);
      } else if (this.props.completeText === 'Preview') {
        this.vsService._startConcatenate(false);
      }
    }, 300);
  }
  public replace() {}
}
