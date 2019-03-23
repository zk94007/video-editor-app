import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NgProgressComponent } from '@ngx-progressbar/core';
import { VideoStudioService } from '../../../../shared/services/video-studio.service';
import { VgAPI } from 'videogular2/core';
import { Location } from '@angular/common';
import { ProjectService } from '../../../../shared/services/project.service';

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
    finalvideosd: '',
    finalvideohd: '',
    finalvideofhd: '',
    downloadOption: -1,
    projectName: '',
    projectNameAbbr: '',
    previousURL: ''
  };

  constructor(private vsService: VideoStudioService, private location: Location, private service: ProjectService) {
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
      this.props.finalvideosd = this.vsService.getProjectVideoPathSD();
      this.props.finalvideohd = this.vsService.getProjectVideoPathHD();
      this.props.finalvideofhd = this.vsService.getProjectVideoPathFullHD();
      this.props.projectName = this.vsService.getProjectName();
      this.props.projectNameAbbr = this.props.projectName.length > 17 ? this.props.projectName.slice(0, 16) + '...' : this.props.projectName;
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
        this.props.finalvideosd = response.finalvideoSD;
        this.props.finalvideohd = response.finalvideoHD;
        this.props.finalvideofhd = response.finalvideoFullHD;
        this.props.projectName = this.vsService.getProjectName();
        this.props.projectNameAbbr = this.props.projectName.length > 17 ? this.props.projectName.slice(0, 16) + '...' : this.props.projectName;
        if (this.api) {
          this.api.getDefaultMedia().currentTime = 0;
          this.api.play();
        }
      } else {
      }
    }));
  }

  ngOnInit() {
    this.$uns.push(this.service.onGenerateSas.subscribe((message) => {
      if (this.props.downloadOption == 1) {
          this.download(this.props.projectName, this.props.finalvideosd + '?' + message.token);
      } else if (this.props.downloadOption == 2) {
          this.download(this.props.projectName, this.props.finalvideohd + '?' + message.token);
      } else if (this.props.downloadOption == 3) {
          this.download(this.props.projectName, this.props.finalvideofhd + '?' + message.token);
      }
    }));
  }

  download(filename, src) {
    const element = document.createElement('a');
    element.setAttribute('href', src);
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  onPlayerReady(api: VgAPI) {
    this.api = api;

    this.api.getDefaultMedia().subscriptions.ended.subscribe(() => {
    });
    this.api.getDefaultMedia().subscriptions.seeked.subscribe(() => {
    });
  }

  _downloadProjectVideo(option) {
    this.props.downloadOption = option;
    this.service._generateSas();
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
}
