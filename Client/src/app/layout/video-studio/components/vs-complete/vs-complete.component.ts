import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgProgressComponent } from '@ngx-progressbar/core';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';
import { VgAPI } from 'videogular2/core';
import { Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

declare var $: any;

@Component({
  selector: 'app-vs-complete',
  templateUrl: './vs-complete.component.html',
  styleUrls: ['./vs-complete.component.scss']
})

export class VsCompleteComponent implements OnInit, OnDestroy {
  private $uns: any = [];

  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;

  private api: any;

  public props: any = {
    isConcatenating: null,
    percent: null,
    loading: '',
    finalvideo: '',

    previousURL: ''
  };

  constructor(private vsService: VideoStudioService, private location: Location, private router: Router, private route: ActivatedRoute) {
    let response : string;
    response = localStorage.getItem('complete_preview');
    if (response === 'true') {
      this.props.isConcatenating = true;
      this.props.percent = 10;
      this.props.loading = '';
      this.props.finalvideo = '';
    } else if (response === 'false') {
      this.props.isConcatenating = false;
      this.props.finalvideo = this.vsService.getProjectVideoPath();
      if (this.api) {
        this.api.getDefaultMedia().currentTime = 0;
        this.api.play();
      }
    } else {
      this.location.back();
    }
    
    this.$uns.push(this.vsService.onConcatenateProgress.subscribe((response) => {
      this.props.percent = response.percent;
      this.props.loading = response.loading;
    }));

    this.$uns.push(this.vsService.onConcatenate.subscribe((response) => {
      if (response.success) {
        this.props.isConcatenating = false;
        this.props.finalvideo = response.finalvideo;

        if (this.api) {
          this.api.getDefaultMedia().currentTime = 0;
          this.api.play();
        }
      } else {
      }
    }));
  }

  ngOnInit() {

  }

  onPlayerReady(api: VgAPI) {
    this.api = api;

    this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
    });
    this.api.getDefaultMedia().subscriptions.seeked.subscribe(() => {
    });
  }

  onPlayerLoadStart() {
    $('#singleVideo').addClass('loading');
  }

  onPlayerCanPlay() {
    $('#singleVideo').removeClass('loading');
  }

  onCloseModal() {
    window.location.href = "/video-studio";
  }

  ngOnDestroy() {
    this.$uns.forEach($uns => {
      $uns.unsubscribe();
    });
  }

  download() {
      const element = document.createElement('a');
      element.setAttribute('href', this.props.finalvideo);
      element.setAttribute('download', '');

      element.style.display = 'none';
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
  }
}
