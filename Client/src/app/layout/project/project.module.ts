import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProjectRoutingModule } from './project-routing.module';
import { ProjectComponent } from './project.component';
import { ProjectListComponent } from './components/project-list/project-list.component';
import { ProjectDetailComponent } from './components/project-detail/project-detail.component';
import { FormsModule } from '@angular/forms';
import { Ng5FilesModule } from '../../shared/module/ng5-files';
import { SortablejsModule } from 'angular-sortablejs/dist';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';

import {
    PerfectScrollbarModule, PerfectScrollbarConfigInterface,
    PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';

import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { VideoStudioService } from '../../shared/services/video-studio.service';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
};

@NgModule({
    imports: [
        CommonModule,
        ProjectRoutingModule,
        FormsModule,
        Ng5FilesModule,
        SortablejsModule,
        NgbDropdownModule.forRoot(),
        PerfectScrollbarModule,
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
    ],
    providers: [
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
        VideoStudioService
    ],
    declarations: [
        ProjectComponent,
        ProjectListComponent,
        ProjectDetailComponent
    ]
})
export class ProjectModule { }
