import { Component, OnInit, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { RepositionCanvas } from './reposition-canvas';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
declare var $: any;

@Component({
  selector: 'app-vs-reposition',
  templateUrl: './vs-reposition.component.html',
  styleUrls: ['./vs-reposition.component.scss']
})
export class VsRepositionComponent implements OnInit, OnDestroy {
  @Output() onEndFrameReposition = new EventEmitter();
  public canvas: RepositionCanvas;
  public props = {
    sceneRatio: null
  };

  constructor(private vsService: VideoStudioService, private location: Location, private router: Router) {
  }

  ngOnInit() {
    this.canvas = new RepositionCanvas(this.vsService);
  }

  ngOnDestroy() {
    this.canvas.destructor();
  }

  done() {
    this.vsService._updateFrameReposition(this.canvas.getReposition());
    this.vsService.onEndFrameReposition.emit();
    this.onEndFrameReposition.emit();
  }

  onCloseModal() {
    this.location.back();
  }

  // Resize event interaction
  @HostListener('window:resize', ['$event'])
  onResize(event) {
      this.canvas.update();
  }
}
