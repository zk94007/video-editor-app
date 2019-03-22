import { SocketService } from './socket.service';
import { Injectable, EventEmitter, Output } from '@angular/core';

import * as _ from 'underscore';
import { Project } from '../models/project.model';
import { Frame } from '../models/frame.model';
import { EventManager } from '@angular/platform-browser';

let $this: VideoStudioService;

@Injectable()
export class VideoStudioService {
  private sceneSize: any = {
    '916': {
      width: 1080,
      height: 1920,
    },
    '11': {
      width: 1080,
      height: 1080,
    },
    '169': {
      width: 1920,
      height: 1080,
    }
  };

  public screenScale = 1;

  public project: Project;

  public selected_frm_id;

  public loadedFonts = [];
  // private selected_ovl_index;

  @Output() onLoad = new EventEmitter();

  @Output() onChangeSceneRatio = new EventEmitter();

  @Output() onSelectFrame = new EventEmitter();
  @Output() onDeleteFrame = new EventEmitter();
  @Output() onDuplicateFrame = new EventEmitter();

  @Output() onAddUploadImageProgress = new EventEmitter();
  @Output() onAddUploadImage = new EventEmitter();
  @Output() onAddTextOverlay = new EventEmitter();
  @Output() onAddImageOverlay = new EventEmitter();
  @Output() onAddOverlay = new EventEmitter();

  @Output() onChangeTextProps = new EventEmitter();
  @Output() onCopyOverlay = new EventEmitter();
  @Output() onArrangeOverlay = new EventEmitter();
  @Output() onDeleteOverlay = new EventEmitter();
  @Output() onChangeArrangeOverlay = new EventEmitter();
  @Output() onChangeTransparent = new EventEmitter();

  @Output() onSelectOverlay = new EventEmitter();
  @Output() onDeselectOverlay = new EventEmitter();

  @Output() onStartConcatenate = new EventEmitter();
  @Output() onEndConcatenate = new EventEmitter();
  @Output() onConcatenateProgress = new EventEmitter();
  @Output() onConcatenate = new EventEmitter();

  @Output() onUploadSubtitlesProgress = new EventEmitter();
  @Output() onUploadSubtitlesResponse = new EventEmitter();

  @Output() onUpdateCanvas = new EventEmitter();

  //@Kostya
  @Output() onUpdateFrameline = new EventEmitter();

  @Output() onChangeDuration = new EventEmitter();

  @Output() onStartFrameReposition = new EventEmitter();
  @Output() onEndFrameReposition = new EventEmitter();

  @Output() onDragStart = new EventEmitter();
  @Output() onDragEnd = new EventEmitter();

  @Output() onModified = new EventEmitter();

  @Output() onChangeCanvasScale = new EventEmitter();
  @Output() onChangeBackground = new EventEmitter();
  @Output() onGetStaticOverlays = new EventEmitter();

  public binds = [
    {
      name: 'GET_FRAMES_WITH_OVERLAY_RESPONSE',
      function: this._loadResponse,
    },
    {
      name: 'DELETE_FRAME_RESPONSE',
      function: this._deleteFrameResponse,
    },
    {
      name: 'DUPLICATE_FRAME_RESPONSE',
      function: this._duplicateFrameResponse,
    },
    {
      name: 'CONCATENATE_PROGRESS',
      function: this._concatenateProgress,
    },
    {
      name: 'CONCATENATE_RESPONSE',
      function: this._concatenateResponse,
    },
    {
      name: 'ADD_OVERLAY_RESPONSE',
      function: this._addOverlayResponse,
    },
    {
      name: 'ADD_UPLOAD_IMAGE_RESPONSE',
      function: this._addUploadImageResponse,
    },
    {
      name: 'DELETE_UPLOAD_IMAGE_RESPONSE',
      function: this._deleteUplpoadImageResponse,
    },
    {
      name: 'GET_STATIC_OVERLAYS_RESPONSE',
      function: this._getStaticOverlaysResponse,
    },
    {
      name: 'UPLOAD_SUBTITLES_PROGRESS',
      function: this._uploadSubtitlesProgress
    },
    {
      name: 'UPLOAD_SUBTITLES_RESPONSE',
      function: this._uploadSubtitlesResponse
    }
  ];

  constructor(private socket: SocketService) {
    $this = this;

    _.each(this.binds, (bind) => {
      this.socket.bind(bind.name, bind.function);
    });
  }

  changeSceneRatio(sceneRatio) {
    if (!this.isModified()) {
      this.onModified.emit();
    }
    this.project.setSceneRatio(sceneRatio);
    this.onChangeSceneRatio.emit(this.project.getSceneRatio());
    this.socket.sendMessageWithToken('UPDATE_PROJECT', {prj_id: this.project.prj_id, data: [{name: 'prj_scene_ratio', value: sceneRatio}]});
  }

  isModified() {
    return this.project.modified;
  }

  getProjectVideoPath() {
    return this.project.prj_video_path;
  }

  getProjectVideoPathHD() {
    return this.project.prj_video_path_hd;
  }

  getProjectVideoPathSD() {
    return this.project.prj_video_path_sd;
  }

  getProjectVideoPathFullHD() {
    return this.project.prj_video_path_full_hd;
  }

  getProjectName() {
    return this.project.prj_name;
  }

  getSceneRatio() {
    return this.project.getSceneRatio();
  }

  getSceneSize() {
    return this.sceneSize[this.getSceneRatio()];
  }

  getFrames() {
    return this.project.getFrames2Json();
  }

  getUploadImages() {
    return this.project.getUploadImages();
  }

  selectFrame(frm_id) {
    this.selected_frm_id = frm_id;
    const frame: any = this.project.getFrame(frm_id).toJSON();
    frame.frm_overlays = this.project.getFrame(frm_id).getOverlays2Json();
    this.onSelectFrame.emit(frame);
  }

  dragStart(object) {
    $this.onDragStart.emit(object);
  }

  dragEnd() {
    $this.onDragEnd.emit();
  }

  changeCanvasScale(scale) {
    $this.onChangeCanvasScale.emit(scale);
  }

  fakeId() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
    }
    return 'fake-' + s4() + '-' + s4();
  }

  selectOverlay(selectedObject) {
    $this.onSelectOverlay.emit(selectedObject);
  }

  changeArrangeOverlay(arrange) {
    this.onChangeArrangeOverlay.emit(arrange);
  }

  deleteOverlay() {
    this.onDeleteOverlay.emit();
  }

  copyOverlay() {
    this.onCopyOverlay.emit();
  }

  changeTransparent(opacity) {
    this.onChangeTransparent.emit(opacity);
  }

  /**
   *
   * @param data fontFamily: 'Times New Roman', ...
   */
  changeTextProps(data: any) {
    this.onChangeTextProps.emit(data);
  }

  /**
   *
   */
  addTextOverlay(data) {
    this.onAddTextOverlay.emit(data);
  }

  /**
   *
   * @param image
   */
  addImageOverlay(image) {
    this.onAddImageOverlay.emit(image);
  }

  /**
   *
   */
  deselectOverlay() {
    this.onDeselectOverlay.emit();
  }

  /**
   * @param duration
   */
  changeSeek(duration) {
    const frame = this.project.getFrame(this.selected_frm_id);
    if (frame) {
      if (!this.isModified()) {
        this.onModified.emit();
      }
      this.project.modified = true;
      frame.frm_duration = duration;
      this.socket.sendMessageWithToken('UPDATE_FRAME', { frm_id: this.selected_frm_id, data: [{ name: 'frm_duration', value: JSON.stringify(duration) }] });
    }
  }

  /**
   *
   * @param delta
   */
  changeDuration(delta) {
    this.onChangeDuration.emit(delta);
  }

  startFrameReposition() {
    const frame = this.project.getFrame(this.selected_frm_id);
    if (frame) {
      this.onStartFrameReposition.emit(frame.toJSON());
    }
  }



  _updateFrameReposition(reposition) {
    const frame = this.project.getFrame(this.selected_frm_id);
    if (frame) {
      if (!this.isModified()) {
        this.onModified.emit();
      }
      this.project.modified = true;
      frame.frm_reposition = reposition;
      this.socket.sendMessageWithToken('UPDATE_FRAME', { frm_id: this.selected_frm_id, data: [{ name: 'frm_reposition', value: JSON.stringify(reposition) }] });
    }
  }

  _changeBackground(color) {
    const frame = this.project.getFrame(this.selected_frm_id);
    if (frame) {
      if (!this.isModified()) {
        this.onModified.emit();
      }

      this.project.modified = true;
      frame.frm_background = {
        color: color
      };
      this.socket.sendMessageWithToken('UPDATE_FRAME', { frm_id: this.selected_frm_id, data: [{ name: 'frm_background', value: JSON.stringify(frame.frm_background) }] });
      this.onChangeBackground.emit(frame.frm_background);
    }
  }

  _changeSceneRatio(sceneRatio) {
    if (this.project && this.project.getSceneRatio !== sceneRatio) {
      if (!this.isModified()) {
        this.onModified.emit();
      }
      this.project.setSceneRatio(sceneRatio);
      this.onChangeSceneRatio.emit(this.project.getSceneRatio());
      this.socket.sendMessageWithToken('UPDATE_PROJECT', { prj_id: this.project.prj_id, data: [{ name: 'prj_scene_ratio', value: sceneRatio }] });
      const frames = this.project.getFrames2Json();
      frames.forEach(element => {
        this.socket.sendMessageWithToken('UPDATE_FRAME', { frm_id: element.frm_id, data: [{ name: 'frm_reposition', value: JSON.stringify(element.frm_reposition)}]});
      });
    }
  }

  /**
   *
   * @param fontFamily
   */
  loadFontFamily(fontFamily) {
    this.loadedFonts.push(fontFamily);
  }

  /**
   *
   * @param fontFamily
   */
  isLoadedFontFamily(fontFamily): boolean {
    return this.loadedFonts.find(f => f === fontFamily) ? true : false;
  }

  _load(prj_id) {
    this.socket.sendMessageWithToken('GET_FRAMES_WITH_OVERLAY', { prj_id: prj_id });
    this.socket.sendMessageWithToken('GET_STATIC_OVERLAYS', {  });
  }

  _loadResponse(response) {
    $this.project = new Project(response.project);
    setTimeout(() => {
      $this.onLoad.emit(response.success);
    }, 1000);

    setInterval(() => {
      $this.onUpdateCanvas.emit($this.project.getFrame($this.selected_frm_id).getOverlays2Json());
      $this.onUpdateFrameline.emit($this.project.getFrames2Json());
    }, 3000);
  }

  _deleteFrame(frm_id) {
    if (!this.isModified()) {
      this.onModified.emit();
    }
    this.project.modified = true;
    this.socket.sendMessageWithToken('DELETE_FRAME', { frm_id: frm_id, is_video_studio: true });
  }

  _deleteFrameResponse(response) {
    if (response.success) {
      const index = $this.project.getFrameIndex(response.frm_id);
      $this.project.deleteFrame(response.frm_id);
      const result: any = {};
      result.index = index;
      $this.onDeleteFrame.emit(result);
    }
  }

  _duplicateFrame(frm_id, fake_id, frm_order) {
    if (!this.isModified()) {
      this.onModified.emit();
    }
    this.project.modified = true;
    this.socket.sendMessageWithToken('DUPLICATE_FRAME', { frm_id: frm_id, fake_id: fake_id, frm_order: frm_order });
  }

  _duplicateFrameResponse(response) {
    if (response.success) {
      $this.project.duplicateFrame(response.org_frm_id, response.new_frm_id, response.new_frm_order, response.new_overlay_ids);
      const frame = $this.project.getFrame(response.new_frm_id);
      const result: any = {};
      result.index = $this.project.getFrameIndex(frame.frm_id);
      result.frame = frame.toJSON();

      // @Kostya
      result.frm_id = response.new_frm_id;
      result.fake_id = response.fake_id;

      $this.onDuplicateFrame.emit(result);
    }
  }

  /**
   *
   * @param orders
   */
  _updateFrameOrders(orders) {
    const updatedOrders = [];

    _.each(orders, (order) => {
      if ($this.project.getFrame(order.frm_id).frm_order !== order.frm_order) {
        if (!this.isModified()) {
          this.onModified.emit();
        }
        this.project.modified = true;
        updatedOrders.push({ frm_id: order.frm_id, frm_order: order.frm_order });
        $this.project.getFrame(order.frm_id).frm_order = order.frm_order;
      }
    });

    this.socket.sendMessageWithToken('UPDATE_FRAME_ORDER', {orders: updatedOrders});
  }

  /**
   *
   * @param orders
   */
  _updateOverlayOrders(orders) {
    const updatedOrders = [];

    _.each(orders, (order) => {
      if (this.project.getOverlay(order.ovl_id).ovl_order !== order.ovl_order) {
        if (!this.isModified()) {
          this.onModified.emit();
        }
        this.project.modified = true;
        this.project.getOverlay(order.ovl_id).ovl_order = order.ovl_order;
      }
    });

    this.socket.sendMessageWithToken('UPDATE_OVERLAY_ORDER', {orders: orders});
  }

  /**
   *
   * @param file
   * @param metadata {guid: <guid>}
   */
  _addUploadImage(file, metadata: any) {
    metadata.prj_id = this.project.getProjectId();
    metadata.size = file.size;
    metadata.filename = file.name;

    this.socket.sendStream('ADD_UPLOAD_IMAGE', file, metadata, this.onAddUploadImageProgress);
  }

  _addUploadImageResponse(response) {
    $this.onAddUploadImage.emit({
      uim_id: response.uim_id,
      guid: response.guid,
      src: response.uim_path,
      resolution: response.uim_resolution,
      gif_delays: response.uim_gif_delays,
    });
  }

  _deleteUploadImage(uim_id) {
    this.socket.sendMessageWithToken('DELETE_UPLOAD_IMAGE', {uim_id: uim_id});
  }

  _deleteUplpoadImageResponse(response) {

  }

  _getStaticOverlaysResponse(response) {
    if (response.success) {
      $this.onGetStaticOverlays.emit(response.overlays);
    }
  }

  /**
   *
   */
  _addOverlay(data) {
    const message: any = {
      fake_id: data.id,
      frm_id: data.frm_id,
      width: data.width,
      height: data.height,
      ovl_content: data.ovl_content,
      offsetX: data.offsetX,
      offsetY: data.offsetY,
      opacity: data.opacity,
      ovl_type: data.type,
      angle: data.angle,
      ovl_order: data.ovl_order,
      ovl_json: JSON.stringify(data.ovl_json),
    };

    this.socket.sendMessageWithToken('ADD_OVERLAY', message);

    const overlay: any = {
      fake_id: data.id,
      frm_id: data.frm_id,
      ovl_reposition: {
        width: data.width,
        height: data.height,
        offsetX: data.offsetX,
        offsetY: data.offsetY,
        angle: data.angle,
        opacity: data.opacity,
      },
      ovl_order: data.ovl_order,
      ovl_type: data.ovl_type,
      ovl_json: JSON.stringify(data.ovl_json),
    };
    if (!this.isModified()) {
      this.onModified.emit();
    }
    this.project.addOverlay(data.frm_id, overlay);
  }

  _addOverlayResponse(response) {
    $this.project.updateOverlayId(response.fake_id, response.ovl_id);
    $this.onAddOverlay.emit(response);
  }

  _updateOverlay(data) {
    const message: any = {
      ovl_id: data.id,
      frm_id: data.frm_id,
      width: data.width,
      height: data.height,
      ovl_content: data.ovl_content,
      offsetX: data.offsetX,
      offsetY: data.offsetY,
      ovl_type: data.type,
      opacity: data.opacity,
      angle: data.angle,
      ovl_json: JSON.stringify(data.ovl_json),
    };

    this.socket.sendMessageWithToken('UPDATE_OVERLAY', message);

    const overlay: any = {
      frm_id: data.frm_id,
      ovl_reposition: {
        width: data.width,
        height: data.height,
        offsetX: data.offsetX,
        offsetY: data.offsetY,
        angle: data.angle,
        opacity: data.opacity,
      },
      ovl_content: data.dataurl,
      ovl_type: data.type,
      ovl_json: JSON.stringify(data.ovl_json),
    };
    if (!this.isModified()) {
      this.onModified.emit();
    }
    this.project.updateOverlay(data.id, overlay);
  }

  _updateOverlayResponse(response) {

  }

  _deleteOverlay(ovl_id) {
    if (!this.isModified()) {
      this.onModified.emit();
    }
    this.project.deleteOverlay(ovl_id);
    this.socket.sendMessageWithToken('DELETE_OVERLAY', {ovl_id: ovl_id});
  }

  _duplicateOverlay(ovl_id) {
    if (!this.isModified()) {
      this.onModified.emit();
    }
    this.project.modified = true;
    this.socket.sendMessageWithToken('DUPLICATE_OVERLAY', {ovl_id: ovl_id});
  }

  _duplicateOverlayResponse(response) {
    if (response.success) {
      $this.project.duplicateOverlay(response.org_ovl_id, response.new_ovl_id, response.new_ovl_order);
      const overlay = $this.project.getOverlay(response.new_ovl_id);
      const result: any = {};
      result.index = $this.project.getOverlayIndex(overlay.ovl_id);
      result.overlay = overlay.toJSON();
      $this.onCopyOverlay.emit(result);
    }
  }

  _uploadSubtitles(prj_id, subtitles) {
    if (prj_id) {
      console.log({prj_id: prj_id, subtitles: subtitles});
      this.socket.sendMessageWithToken('UPLOAD_SUBTITLES', {prj_id: prj_id, subtitles: subtitles});
    }
  }

  _uploadSubtitlesProgress(response) {
    $this.onUploadSubtitlesProgress.emit(response);
  }

  _uploadSubtitlesResponse(response) {
    $this.onUploadSubtitlesResponse.emit(response);
  }

  _startConcatenate(complete) {
    this.onStartConcatenate.emit(complete);
    if (complete === true) {
      setTimeout(() => {
        this.socket.sendMessageWithToken('CONCATENATE', { prj_id: this.project.prj_id, prj_scene_ratio: this.project.prj_scene_ratio, prj_name: this.project.prj_name });
      }, 5000);
    }
  }

  _concatenateProgress(response) {
    $this.onConcatenateProgress.emit(response);
  }

  _concatenateResponse(response) {
    $this.onConcatenate.emit(response);
    if (response.success) {
      $this.project.modified = false;
      $this.project.prj_video_path = response.finalvideo;
    }
  }
}
