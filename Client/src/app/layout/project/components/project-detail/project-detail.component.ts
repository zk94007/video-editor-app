import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { Ng5FilesStatus, Ng5FilesSelected, Ng5FilesConfig, Ng5FilesService } from '../../../../shared/module/ng5-files';
import { ProjectService } from '../../../../shared/services/project.service';
import * as path from 'path';
import { VgAPI } from 'videogular2/core';

const loadingURL = 'assets/video-studio/wait.gif';

@Component({
  selector: 'app-project-detail',
  templateUrl: './project-detail.component.html',
  styleUrls: ['./project-detail.component.scss']
})
export class ProjectDetailComponent implements OnInit, OnDestroy {

    public props = {
        projectId: null,
        projectName: '',
        media: [],
        showProjects: null,
        disableDownloadButton: true,
        videoPath: null,

        upload: {
            selectedFiles: null,
            uploadPercent: null
        },

        isDragAvailable: false,
        isUploading: false,
        isPlaying: null,
        isPlayingProjectVideo: false,
        isDeleting: -1,

        displayDeleteFileModal: null,

        wait: 'assets/layout/images/wait.gif'
    };

    public fileUploadConfig: Ng5FilesConfig;

    public options: any;
    private api: any;

    public $uns: any = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private ng5FilesService: Ng5FilesService,
        private service: ProjectService,
    ) {
        this.fileUploadConfig = {
            acceptExtensions: ['png', 'jpeg', 'jpg', 'avi', 'mp4', 'gif'],
            maxFilesCount: 5,
            maxFileSize: 5120000,
            totalFilesSize: 10120000
        };

        this.options = {
            animation: 150,
            onUpdate: (event: any) => {
                this.postChangesToServer();
            }
        };
        this.props.media = [];

        this.$uns.push(this.route.params.subscribe( (params) => {
            this.props.projectId = params['prj_id'];
            this.service._getFrameList(this.props.projectId);
        }));

        this.props.displayDeleteFileModal = 'none';
    }

    ngOnInit() {
        this.props.isPlaying = false;
        this.props.isPlayingProjectVideo = false;
        this.props.media = [];

        this.ng5FilesService.addConfig(this.fileUploadConfig);

        this.$uns.push(this.service.onGetFrameList.subscribe((message) => {
            const success = message['success'];
            if (success) {
                this.service.changePageTitle(message.project.prj_name);

                if (message.project.prj_video_path !== null) {
                    this.props.videoPath = message.project.prj_video_path;
                    this.props.disableDownloadButton = false;
                } else {
                    this.props.disableDownloadButton = true;
                }
                this.props.projectName = message.project.prj_name;

                this.props.media = message['frames'];
                if (this.props.media.length === 0) {
                    this.props.showProjects = false;
                } else {
                    this.props.showProjects = true;
                }
            } else {
                console.log('Error get frame list');
            }
        }));

        this.$uns.push(this.service.onDeleteFrame.subscribe((message) => {
            const success = message.success;
            if (success) {
                const index = this.props.media.findIndex(m => m.frm_id === message.frm_id);
                this.props.media.splice(index, 1);
                if (this.props.media.length === 0) {
                    this.props.showProjects = false;
                }
            } else {
                console.log('Error delete frame');
            }
        }));

        this.$uns.push(this.service.onAddFrame.subscribe((message) => {
            const success = message.success;
            this.props.upload.uploadPercent = 0;
            if (success) {
                if (this.props.media !== null) {
                    this.props.isUploading = false;
                    const index = this.props.media.findIndex(m => m.guid === message.guid);
                    const temp = {
                        frm_id: message.frm_id,
                        frm_name: message.frm_name,
                        frm_order: message.frm_order,
                        frm_path: message.frm_path,
                        frm_resolution: message.frm_resolution,
                        isUploading: false
                    };
                    this.props.media[index] = temp;
                    this.props.showProjects = true;
                }
            }
        }));

        this.$uns.push(this.service.onAddFrameProgress.subscribe((message) => {
            if (this.props.media !== null) {
                const index = this.props.media.findIndex(m => m.guid === message.guid);
                this.props.media[index].uploadPercent = Math.round(message.percent) + '%';
            }
        }));

        this.$uns.push(this.service.onGenerateSas.subscribe((message) => {
            this.download(this.props.projectName, this.props.videoPath + '?' + message.token);
        }));
    }

    postChangesToServer() {
        const orders = [];
        const $this = this;
        this.props.media.forEach((item, index) => {
            if (item.frm_order !== index + 1) {
                $this.props.media[index].frm_order = index + 1;

                if (!item.isUploading) {
                    orders.push({frm_id: item.frm_id, frm_order: index + 1});
                }
            }
        });

        this.service._updateFrameOrder(orders);
    }

    filesSelect(selectedFiles: Ng5FilesSelected): void {
        if (selectedFiles.status !== Ng5FilesStatus.STATUS_SUCCESS) {
            this.props.upload.selectedFiles = selectedFiles.status;
        }
        this.props.upload.selectedFiles = Array.from(selectedFiles.files);
        for (let i = 0; i < this.props.upload.selectedFiles.length; i ++) {
            const file = this.props.upload.selectedFiles[i];
            const ext = path.extname(file.name).toLowerCase();
            if (ext === '.jpg' || ext === '.png' || ext === '.jpeg' || ext === '.mp4' || ext === '.gif') {
                if (!file.$error) {
                    const preview = this.fakePreview(file.name);
                    this.props.showProjects = true;
                    this.props.isUploading = true;
                    this.props.media.push(preview);
                    this.service._addFrame(file, {prj_id: this.props.projectId, guid: preview.guid});
                }
            }
        }
    }

    onDragEnter($event) {
        this.props.isDragAvailable = true;
    }
    onDragLeave($event) {
        this.props.isDragAvailable = false;
    }
    onDrop($event) {
        this.props.isDragAvailable = false;
    }

    downloadProjectVideo() {
        this.service._generateSas();
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

        this.api.getDefaultMedia().subscriptions.canPlayThrough.subscribe(() => {
          this.api.play();
        });

        this.api.getDefaultMedia().subscriptions.loadedData.subscribe(() => {
          this.api.play();
        });
    }

    playProjectVideo() {
        this.props.isPlayingProjectVideo = true;
        $('body').toggleClass('modalContentBlurAndDarkenVisible');
        $('body').toggleClass('modalContentVisible');
        $('.modalContent').toggleClass('modalContentOn');
    }
    onCloseModal() {
        $('.modalContent').toggleClass('modalContentOn');
        $('.multipageDialogCurrentPage').toggleClass('multipageDialogDisappearing');
        setTimeout(() => {
            $('body').toggleClass('modalContentBlurAndDarkenVisible');
            $('body').toggleClass('modalContentVisible');
            this.props.isPlayingProjectVideo = false;
        }, 300);
    }

    fakePreview(previewPath) {
        return {frm_name: previewPath.substring(previewPath.lastIndexOf('/') + 1), frm_path: this.props.wait, guid:  this.guid(), isUploading: true, uploadPercent: 0, frm_order: this.props.media.length + 1, isPlaying: false};
    }

    guid() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    getUuid(realPath) {
        const arr = realPath.match(/([^\/]+)(?=\.\w+$)/);
        return (arr && arr.length > 0) ? 'id' + arr[0] : '';
    }

    resolveFilename(filename): string {
        if (filename.length < 18) {
            return filename;
        } else {
            return path.basename(filename, path.extname(filename)).substring(0, 15) + '..' + path.extname(filename);
        }
    }

    isImage(realPath: string) {
        if (!realPath) {
            return false;
        }
        return !!realPath.match(/.+(\.jpg|\.jpeg|\.png|\.gif)$/);
    }

    isVideo(realPath: string) {
        if (!realPath) {
            return false;
        }
        return !!realPath.match(/.+(\.mp4|\.avi|\.mpeg|\.flv|\.mov)$/);
    }

    isFake(fakePath: string) {
        return fakePath === this.props.wait;
    }

    // Option for each file
    deleteFile( frm_id ) {
        this.openDeleteFileConfirmModal();
        this.props.isDeleting = this.props.media.findIndex((m) => m.frm_id == frm_id);
    }
    openDeleteFileConfirmModal() {
        this.props.displayDeleteFileModal = 'block';
    }
    cancelDeleteFileConfirm() {
        this.props.displayDeleteFileModal = 'none';
    }
    okDeleteFileConfirm() {
        this.props.displayDeleteFileModal = 'none';
        if (this.props.isDeleting != -1) {
            this.props.media[this.props.isDeleting].frm_path = loadingURL;
            this.service._deleteFrame(this.props.media[this.props.isDeleting].frm_id);
        }
    }

    playVideo(frm_id) {
        const index = this.props.media.findIndex(m => m.frm_id === frm_id);
        const videoElement = <HTMLVideoElement>document.getElementById(this.getUuid(this.props.media[index].frm_path));
        this.props.media[index].isPlaying = true;
        videoElement.play();
    }
    pauseVideo(frm_id) {
        const index = this.props.media.findIndex(m => m.frm_id === frm_id);
        const videoElement = <HTMLVideoElement>document.getElementById(this.getUuid(this.props.media[index].frm_path));
        this.props.media[index].isPlaying = false;
        videoElement.pause();
    }

    ngOnDestroy() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }
}
