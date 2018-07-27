import { Component, OnInit, EventEmitter, Output, OnDestroy } from '@angular/core';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';
import { Router, ActivatedRoute } from '@angular/router';

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

  constructor(private vsService: VideoStudioService, private router: Router, private route: ActivatedRoute) {
    localStorage.setItem('complete_preview', null);
    this.$uns.push(this.vsService.onLoad.subscribe(() => {
      this.props.projectId = vsService.project.prj_id;
      if (this.vsService.isModified()) {
        this.props.completeText = 'Complete';
      } else {
        this.props.completeText = 'Preview';
      }
    }));
    this.$uns.push(this.vsService.onModified.subscribe(() => {
      this.props.completeText = 'Complete';
    }));
    this.$uns.push(this.vsService.onConcatenate.subscribe(() => {
      this.props.completeText = 'Preview';
    }));
    this.$uns.push(this.vsService.onStartConcatenate.subscribe((complete) => {
      localStorage.setItem('complete_preview', complete);
      this.router.navigate(['complete'], {relativeTo: this.route});
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
    if (this.props.completeText === 'Complete') {
      this.vsService._startConcatenate(true);
    } else if (this.props.completeText === 'Preview') {
      this.vsService._startConcatenate(false);
    }
  }
  public replace() {}
}
