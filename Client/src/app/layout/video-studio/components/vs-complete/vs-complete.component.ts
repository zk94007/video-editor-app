import { Component, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { NgProgressComponent } from '@ngx-progressbar/core';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';
import { VgAPI } from 'videogular2/core';
import { Location } from '@angular/common';

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
    isConcatenating: false,
    percent: 10,
    loading: 'publishing',
    finalvideo: '',

    previousURL: ''
  };

  constructor(private vsService: VideoStudioService, private location: Location) {
  }

  ngOnInit() {

    this.$uns.push(this.vsService.onStartConcatenate.subscribe((complete) => {
      if (complete === true) {
        this.props.isConcatenating = true;
        this.props.percent = 10;
        this.props.loading = '';
        this.props.finalvideo = '';
      } else {
        this.props.isConcatenating = false;
        this.props.finalvideo = this.vsService.getProjectVideoPath();
        this.api.getDefaultMedia().currentTime = 0;
        this.api.play();
      }
    }));

    this.$uns.push(this.vsService.onConcatenateProgress.subscribe((response) => {
      this.props.percent = response.percent;
      this.props.loading = response.loading;
    }));

    this.$uns.push(this.vsService.onConcatenate.subscribe((response) => {
      if (response.success) {
        this.props.isConcatenating = false;
        this.props.finalvideo = response.finalvideo;

        this.api.getDefaultMedia().currentTime = 0;
        this.api.play();
      } else {
      }
    }));

  }

  onPlayerReady(api: VgAPI) {
    this.api = api;

    // this.api.getDefaultMedia().subscriptions.canPlayThrough.subscribe(() => {
    //   this.api.play();
    // });

    // this.api.getDefaultMedia().subscriptions.loadedData.subscribe(() => {
    //   this.api.play();
    // });
    this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
      // Set the video to the beginning
      // this.api.getDefaultMedia().currentTime = 0;
    });
    this.api.getDefaultMedia().subscriptions.seeked.subscribe(() => {
      console.log(this.api.getDefaultMedia().currentTime);
    });
  }

  onPlayerLoadStart() {
    $('#singleVideo').addClass('loading');
  }

  onPlayerCanPlay() {
    $('#singleVideo').removeClass('loading');
  }

  onCloseModal() {
    this.location.back();
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
