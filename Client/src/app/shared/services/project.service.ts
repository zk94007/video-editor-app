import { SocketService } from './socket.service';
import { Injectable, EventEmitter } from '@angular/core';

let $this: ProjectService;

/**
 * Project Service For Project List View & Project Detail View
 */
@Injectable()
export class ProjectService {
    public onGetProjectList = new EventEmitter();
    public onCreateProject = new EventEmitter();
    public onDeleteProject = new EventEmitter();
    public onUpdateProject = new EventEmitter();
    public onGenerateSas = new EventEmitter();

    public onGetFrameList = new EventEmitter();
    public onUpdateFrameOrder = new EventEmitter();
    public onDeleteFrame = new EventEmitter();
    public onAddFrameProgress = new EventEmitter();
    public onAddFrameByUrlProgress = new EventEmitter();
    public onChangePageTitle = new EventEmitter();
    public onAddFrame = new EventEmitter();
    public onAddFrameByUrl = new EventEmitter();

    constructor(private socket: SocketService) {
        $this = this;

        this.socket.bind('GET_PROJECT_LIST_RESPONSE', this._getProjectListResponse);
        this.socket.bind('CREATE_PROJECT_RESPONSE', this._createProjectResponse);
        this.socket.bind('DELETE_PROJECT_RESPONSE', this._deleteProjectResponse);
        this.socket.bind('UPDATE_PROJECT_RESPONSE', this._updateProjectResponse);

        this.socket.bind('GENERATE_SAS_RESPONSE', this._generateSasResponse);

        this.socket.bind('GET_FRAME_LIST_RESPONSE', this._getFrameListResponse);
        this.socket.bind('UPDATE_FRAME_ORDER_RESPONSE', this._updateFrameOrderResponse);
        this.socket.bind('DELETE_FRAME_RESPONSE', this._deleteFrameResponse);
        this.socket.bind('ADD_FRAME_RESPONSE', this._addFrameResponse);
        this.socket.bind('ADD_FRAME_BY_URL_RESPONSE', this._addFrameByUrlResponse);
        this.socket.bind('ADD_FRAME_PROGRESS', this._addFrameProgress);
        this.socket.bind('ADD_FRAME_BY_URL_PROGRESS', this._addFrameByUrlProgress);
    }

    changePageTitle(pageTitle) {
        this.onChangePageTitle.emit(pageTitle);
    }

    /**
     *
     */
    _getProjectList() {
        this.socket.sendMessageWithToken('GET_PROJECT_LIST', {});
    }

    /**
     *
     * @param projectName
     */
    _createProject(projectName) {
        this.socket.sendMessageWithToken('CREATE_PROJECT', { prj_name: projectName });
    }

    /**
     *
     * @param projectId
     */
    _deleteProject(projectId) {
        this.socket.sendMessageWithToken('DELETE_PROJECT', { prj_id: projectId });
    }

    /**
     *
     * @param projectId
     * @param data = [{name: x, value: x}, ...]
     */
    _updateProject(projectId, data) {
        this.socket.sendMessageWithToken('UPDATE_PROJECT', { prj_id: projectId, data: data });
    }

    /**
     *
     */
    _generateSas() {
        this.socket.sendMessageWithToken('GENERATE_SAS', {});
    }

    /**
     *
     * @param projectId
     */
    _getFrameList(projectId) {
        this.socket.sendMessageWithToken('GET_FRAME_LIST', { prj_id: projectId });
    }

    /**
     *
     * @param orders = [{frm_id: x, frm_order: x}, ...]
     */
    _updateFrameOrder(orders) {
        this.socket.sendMessageWithToken('UPDATE_FRAME_ORDER', { orders: orders });
    }

    /**
     *
     * @param frameId
     */
    _deleteFrame(frameId) {
        this.socket.sendMessageWithToken('DELETE_FRAME', { frm_id: frameId });
    }

    /**
     *
     * @param file
     * @param metadata = {prj_id: x, guid: x}
     */
    _addFrame(file, metadata: any) {
        this.socket.sendStream('ADD_FRAME', file, metadata, this.onAddFrameProgress);
    }

    _addFrameByUrl(filename, url, prj_id, guid) {
        this.socket.sendMessageWithToken('ADD_FRAME_BY_URL', { filename: filename, url: url, prj_id: prj_id, guid: guid });
    }

    _getProjectListResponse(response) {
        $this.onGetProjectList.emit(response);
    }

    _createProjectResponse(response) {
        $this.onCreateProject.emit(response);
    }

    _deleteProjectResponse(response) {
        $this.onDeleteProject.emit(response);
    }

    _updateProjectResponse(response) {
        $this.onUpdateProject.emit(response);
    }

    _generateSasResponse(response) {
        $this.onGenerateSas.emit(response);
    }

    _getFrameListResponse(response) {
        $this.onGetFrameList.emit(response);
    }

    _updateFrameOrderResponse(response) {
        $this.onUpdateFrameOrder.emit(response);
    }

    _deleteFrameResponse(response) {
        $this.onDeleteFrame.emit(response);
    }

    _addFrameResponse(response) {
        $this.onAddFrame.emit(response);
    }

    _addFrameByUrlResponse(response) {
        $this.onAddFrameByUrl.emit(response);
    }

    _addFrameProgress(response) {
        $this.onAddFrameProgress.emit(response);
    }

    _addFrameByUrlProgress(response) {
        $this.onAddFrameByUrlProgress.emit(response);
    }
}
