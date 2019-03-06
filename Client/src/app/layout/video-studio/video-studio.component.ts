import { Component, OnInit, AfterViewInit, Input, ViewChild, OnDestroy, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgProgressComponent } from '@ngx-progressbar/core';
import { VideoStudioService } from '../../shared/services/video-studio.service';
import { createElement } from '@angular/core/src/view/element';
import * as $ from 'jquery';
import * as path from 'path';

@Component({
  selector: 'app-video-studio',
  templateUrl: './video-studio.component.html',
  styleUrls: ['./video-studio.component.scss']
})
export class VideoStudioComponent implements OnInit, OnDestroy {
  @ViewChild(NgProgressComponent) progressBar: NgProgressComponent;
  @ViewChild('draggableText') draggableText: ElementRef;

  public props: any = {
    isPrepairingView: true,
    isOnRepositionFrame: false,
    loadingData: '(1/6) Initializing Process',
    progress: null,

    isDraggableText: false,
    isDraggableImage: false,
    draggableObject: null,
    originRect: null,
    canvasScale: 1,

    idealWidth: 300
  };

  private $uns: any = [];

  constructor(private vsService: VideoStudioService, private route: ActivatedRoute, private router: Router) {
    this.route.params.subscribe((res) => {
      vsService._load(res.prj_id);
    });
  }

  ngOnInit() {
    $('body').toggleClass('preroll');
    $('body').toggleClass('compactHeader');

    this.$uns.push(this.vsService.onLoad.subscribe((success) => {
      if (success) {
        this.props.isPrepairingView = false;
        $('body').toggleClass('preroll');
      }
    }));

    this.$uns.push(this.vsService.onDragStart.subscribe((object) => {
      this.props.draggableObject = object;
      this.props.originRect = object.rect;

      if (object.type === 'text') {
        this.props.isDraggableText = true;
        setTimeout(() => {
          const element = document.getElementById('draggableText');

          element.style.position = 'absolute';
          element.style.left = (object.rect.x) + 'px';
          element.style.top = (object.rect.y) + 'px';
          element.style.width = object.rect.width + 'px';
          element.style.height = object.rect.height + 'px';
          element.style.textAlign = 'center';
          element.style.alignItems = 'center';
          element.style.fontFamily = object.fontFamily;
          element.style.fontSize = object.fontSize + 'px';
          element.style.fontStyle = object.fontStyle;

          element.textContent = object.text;

          $('#draggableText')[0].dispatchEvent(object.event);
        }, 10);
      } else if (object.type === 'image') {
        this.props.isDraggableImage = true;
        setTimeout(() => {
          const element = <HTMLImageElement>document.getElementById('draggableImage');

          element.style.position = 'absolute';
          element.style.left = (object.rect.x) + 'px';
          element.style.top = (object.rect.y) + 'px';
          element.style.width = object.rect.width + 'px';
          element.style.height = object.rect.height + 'px';

          element.src = object.src;
          $('#draggableImage')[0].dispatchEvent(object.event);
        }, 10);
      }
    }));

    this.$uns.push(this.vsService.onChangeCanvasScale.subscribe((scale) => {
      this.props.canvasScale = scale;
    }));
  }

  onRepositionFrame($event) {
    $('body').toggleClass('modalContentBlurAndDarkenVisible');
    $('body').toggleClass('modalContentVisible');
    $('.modalContent').toggleClass('modalContentOn');
    $('.multipageDialog').toggleClass('multipageDialogAppearing');
    setTimeout(() => {
      $('.multipageDialog').toggleClass('multipageDialogAppearing');
    }, 300);
    this.props.isOnRepositionFrame = true;
    setTimeout(() => {
      this.vsService.startFrameReposition();
    }, 300);
  }
  onEndFrameReposition($event) {
    this.onCloseModal();
  }
  onCloseModal() {
    $('.modalContent').toggleClass('modalContentOn');
    $('.multipageDialogCurrentPage').toggleClass('multipageDialogDisappearing');
    setTimeout(() => {
      $('body').toggleClass('modalContentBlurAndDarkenVisible');
      $('body').toggleClass('modalContentVisible');
      this.props.isOnRepositionFrame = false;
    }, 300);
  }

  // Drag Event: Text
  onDragTextBegin($event) {
    const element = document.getElementById('draggableText');
    element.classList.add('selected');
    // element.style.transform += 'scale(' + this.props.canvasScale + ',' + this.props.canvasScale + ')';
  }
  onDragTextEnd($event) {
    document.getElementById('draggableText').classList.remove('moving');
    document.getElementById('draggableText').classList.remove('selected');

    const draggableTextRect = document.getElementById('draggableText').getBoundingClientRect();
    const workareaRect = document.getElementById('workarea-container').getBoundingClientRect();

    if (this.isRectInRect(draggableTextRect, workareaRect)) {
      const data = {
        fontFamily: this.props.draggableObject.fontFamily,
        fontSize: Math.floor(this.props.draggableObject.fontSize / this.props.canvasScale),
        fontStyle: this.props.draggableObject.fontStyle,
        text: this.props.draggableObject.text,
        x: draggableTextRect.left - workareaRect.left,
        y: draggableTextRect.top - workareaRect.top,
        width: draggableTextRect.width,
        height: draggableTextRect.height
      };

      this.vsService.addTextOverlay(data);
    }
    this.props.isDraggableText = false;
    this.vsService.dragEnd();
  }
  onTextMoving($event) {
    const element = document.getElementById('draggableText');
    element.classList.add('moving');
    // element.style.transform += 'scale(' + this.props.canvasScale + ',' + this.props.canvasScale + ')';
  }
  onTextMoveEnd($event) {
  }

  isGif(src) {
    return path.extname(src) === '.gif' || path.extname(src) === '.GIF';
  }
  // Drag Event Image
  onDragImageBegin($event) {
    if (this.isGif(this.props.draggableObject.src)) {
      this.props.idealWidth = 120;
    } else {
      this.props.idealWidth = 300;
    }
    const element = document.getElementById('draggableImage');
    const scale = this.props.canvasScale * (this.props.idealWidth / this.props.draggableObject.rect.width);
    element.classList.add('selected');
    element.style.transform += 'scale(' + scale + ',' + scale + ')';
  }
  onDragImageEnd($event) {
    document.getElementById('draggableImage').classList.remove('moving');
    document.getElementById('draggableImage').classList.remove('selected');

    const draggableImageRect = document.getElementById('draggableImage').getBoundingClientRect();
    const workareaRect = document.getElementById('workarea-container').getBoundingClientRect();

    if (this.isRectInRect(draggableImageRect, workareaRect)) {
      const data = {
        src: this.props.draggableObject.src,
        resolution: this.props.draggableObject.resolution,
        x: draggableImageRect.left - workareaRect.left,
        y: draggableImageRect.top - workareaRect.top,
        gif_delays: this.props.draggableObject.gif_delays
      };
      this.vsService.addImageOverlay(data);
    }
    this.props.isDraggableImage = false;
    this.vsService.dragEnd();
  }
  onImageMoving($event) {
    const element = document.getElementById('draggableImage');
    const scale = this.props.canvasScale * (this.props.idealWidth / this.props.draggableObject.rect.width);
    element.classList.add('moving');
    element.style.transform += 'scale(' + scale + ',' + scale + ')';
  }
  onImageMoveEnd($event) {
  }

  isRectInRect(rect2, rect1) {
    return (rect1.left <= rect2.right &&
            rect2.left <= rect1.right &&
            rect1.top <= rect2.bottom &&
            rect2.top <= rect1.bottom);
  }
  createElementFromHTML(htmlString) {
    const div = document.createElement('div');
    div.innerHTML = htmlString.trim();

    // Change this to div.childNodes to support multiple top-level nodes
    return div.firstChild;
  }

  ngOnDestroy() {
    this.$uns.forEach($uns => {
      $uns.unsubscribe();
    });
  }
}
