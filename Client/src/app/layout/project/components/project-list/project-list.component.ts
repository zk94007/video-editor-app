import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Project } from '../../../../shared/models/project.model';
import { Router, ActivatedRoute } from '@angular/router';
import {
    PerfectScrollbarConfigInterface,
    PerfectScrollbarComponent, PerfectScrollbarDirective
} from 'ngx-perfect-scrollbar';
import { ProjectService } from '../../../../shared/services/project.service';

const loadingURL = 'assets/video-studio/wait.gif';

@Component({
    selector: 'app-project-list',
    templateUrl: './project-list.component.html',
    styleUrls: ['./project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {

    public props = {
        deletedPrjId: null,

        displayCreateProjectModal: 'none',
        displayDeleteProjectModal: 'none',

        newProject: {
            prj_name: null,
            perror: null
        },

        optionDisabled: false,
        project_type: 1,
        project_name_edit: false,

        sortTypes: ['Newest First', 'A - Z', 'Z -  A'],
        selectedSortType: 0,

        pageData: {
            pageTitle: 'All Projects',
            isPageDetail: false
        }
    };

    public projects: any[] = [];
    public $uns: any[] = [];

    constructor(public service: ProjectService, public router: Router, private activatedRoute: ActivatedRoute) {
        // CHECK IF MODAL IS OPEN VIA QUERY PARAM
        this.$uns.push(this.activatedRoute.queryParams.subscribe(params => {
            this.props.project_type = params.project_type;

            if (params.modal_create === 'true' || params.modal_create === true) {
                this.props.displayCreateProjectModal = 'block';
            }
        }));

        // GET_PROJECT_LIST_RESPONSE
        this.$uns.push(this.service.onGetProjectList.subscribe((message) => {
            const success = message['success'];
            if (success) {
                if (message['projects'] != null) {
                    message['projects'] = message['projects'].map(project => {
                        return {
                            ...project,
                            prj_editable: false
                        };
                    });

                    this.projects = message['projects'];
                    this.sortProject(this.props.selectedSortType);
                }
            } else {
            }
        }));

        // CREATE_PROJECT_RESPONSE
        this.$uns.push(this.service.onCreateProject.subscribe((message) => {
            const success = message['success'];
            if (success) {
                this.props.newProject.perror = null;
                this.props.displayCreateProjectModal = 'none';
                this.router.navigate(['/detail', message['prj_id']]);
            } else {
                this.props.newProject.perror = 'OOPS! A project with this name already exists';
            }
        }));

        // DELETE_PROJECT_RESPONSE
        this.$uns.push(this.service.onDeleteProject.subscribe((message) => {
            const success = message['success'];
            if (success) {
                const index = this.projects.findIndex(p => p.prj_id === message.prj_id);
                this.projects.splice(index, 1);
            } else {
            }
        }));
    }

    ngOnInit() {
        // GET PROJECT LIST
        this.projects = <any>this.service._getProjectList();
        this.service.changePageTitle(this.props.pageData);
    }

    ngOnDestroy() {
        this.$uns.forEach($uns => {
            $uns.unsubscribe();
        });
    }

    sortProject(type) {
        if (type === 0) {
            this.props.selectedSortType = 0;
            this.projects.sort((leftSide, rightSide): number => {
                if (leftSide.prj_created_at < rightSide.prj_created_at) {
                    return 1;
                } else if (leftSide.prj_created_at > rightSide.prj_created_at) {
                    return -1;
                }
                return 0;
            });
        } else if (type === 1) {
            this.props.selectedSortType = 0;
            this.projects.sort((leftSide, rightSide): number => {
                if (leftSide.prj_name < rightSide.prj_name) {
                    return -1;
                } else if (leftSide.prj_name > rightSide.prj_name) {
                    return 1;
                }
                return 0;
            });
        } else {
            this.props.selectedSortType = 0;
            this.projects.sort((leftSide, rightSide): number => {
                if (leftSide.prj_name < rightSide.prj_name) {
                    return 1;
                } else if (leftSide.prj_name > rightSide.prj_name) {
                    return -1;
                }
                return 0;
            });
        }
    }

    // CreateProjectModal Dialog management
    openCreateProjectModal() {
        this.props.displayCreateProjectModal = 'block';
        this.props.newProject.perror = null;
        this.props.newProject.prj_name = '';
    }
    cancelCreateProject() {
        this.router.navigate(['/project']);
        this.props.displayCreateProjectModal = 'none';
        this.props.project_type = 1;
    }
    okCreateProject() {
        if (this.props.newProject.prj_name && (this.props.newProject.prj_name).trim() !== '') {
            this.service._createProject(this.props.newProject.prj_name, Number(this.props.project_type));
            // this.props.displayCreateProjectModal = 'none';
        } else {
            this.props.newProject.perror = 'Please enter project name.';
        }
    }
    onChangeCreateProjectName() {
        this.props.newProject.perror = null;
    }

    // DeleteProjectModal Dialog management
    deleteProject(prj_id) {
        this.openDeleteProjectModal();
        this.props.deletedPrjId = prj_id;
    }
    openDeleteProjectModal() {
        this.props.displayDeleteProjectModal = 'block';
    }
    cancelDeleteProject() {
        this.props.displayDeleteProjectModal = 'none';
    }
    okDeleteProject() {
        this.props.displayDeleteProjectModal = 'none';
        const index = this.projects.findIndex((p) => p.prj_id === this.props.deletedPrjId);
        this.projects[index].prj_representative = loadingURL;
        this.service._deleteProject(this.props.deletedPrjId);
    }

    // Show Project Video
    showProjectVideo(result_video, representative, project_name) {

    }

    saveProjectName(name, prj_id) {
        this.service._updateProject(prj_id, [{name: 'prj_name', value: name}]);
        this.projects.forEach(project => {
            if (project.prj_id === prj_id) {
                project.prj_editable = false;
            }
        });
    }

    isImage(path) {
        if (!path) {
            return false;
        }
        return !!path.match(/.+(\.jpg|\.jpeg|\.png|\.gif)$/);
    }

    isVideo(path) {
        if (!path) {
            return false;
        }
        return !!path.match(/.+(\.mp4|\.avi|\.mpeg|\.flv|\.mov)$/);
    }
}
