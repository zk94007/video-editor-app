import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VideoStudioRoutingModule } from './video-studio-routing.module';
import { VideoStudioComponent } from './video-studio.component';
import { SortablejsModule} from 'angular-sortablejs/dist';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ColorPickerModule } from '../../shared/module/color-picker';
import { Ng5FilesModule } from '../../shared/module/ng5-files';
import { NgMasonryGridModule } from 'ng-masonry-grid';
import { NgProgressModule } from '@ngx-progressbar/core';

import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';

import { SliderModule } from 'primeng/slider';
import { TooltipModule } from 'primeng/tooltip';
import { AngularDraggableModule } from 'angular2-draggable';
import { LazyLoadImageModule } from 'ng-lazyload-image';

import {
    PerfectScrollbarModule, PerfectScrollbarConfigInterface,
    PERFECT_SCROLLBAR_CONFIG
} from 'ngx-perfect-scrollbar';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
    wheelPropagation: true
};

import {
    VsSidebarComponent,
    VsControlbarComponent,
    VsWorkspaceComponent,
    VsFramelineComponent,
    VsToolbarComponent,
    VsSidebarPanelComponent,
    VsWorkareaLatestComponent
} from './components';

import { ButtonSubmenuDirective } from './directives/button-submenu.directive';
import { ASidebarDirective } from './directives/a-sidebar.directive';
import { LiActiveHoverDirective } from './directives/li-active-hover.directive';
import { ButtonFontFamilyDirective } from './directives/button-font-family.directive';
import { ButtonToolbarDirective } from './directives/button-toolbar.directive';
import { ButtonFontSizeDirective } from './directives/button-font-size.directive';
import { ButtonTextAlignDirective } from './directives/button-text-align.directive';
import { ButtonArrangeDirective } from './directives/button-arrange.directive';
import { FontPickerService } from '../../shared/services/font-picker.service';
import { StatefulSlicePipe, FontSizePipe, FontStylesPipe } from '../../shared/interfaces/font-picker.pipes';
import { VideoStudioService } from '../../shared/services/video-studio.service';
import { VsRepositionComponent } from './components/vs-reposition/vs-reposition.component';
import { VsCompleteComponent } from './components/vs-complete/vs-complete.component';
import { DivModalDirective } from './directives/div-modal.directive';
import { BlColorpickerDirective } from './directives/bl-colorpicker.directive';

@NgModule({
    imports: [
        CommonModule,
        VideoStudioRoutingModule,
        PerfectScrollbarModule,
        SortablejsModule,
        NgbDropdownModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        ColorPickerModule,
        Ng5FilesModule,
        NgMasonryGridModule,
        NgProgressModule.forRoot(),
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
        SliderModule,
        TooltipModule,
        AngularDraggableModule,
        LazyLoadImageModule
    ],
    declarations: [
        VsSidebarComponent,
        VsControlbarComponent,
        VsWorkspaceComponent,
        VsFramelineComponent,
        VsToolbarComponent,
        VideoStudioComponent,
        VsSidebarPanelComponent,
        ButtonSubmenuDirective,
        ASidebarDirective,
        LiActiveHoverDirective,
        ButtonFontFamilyDirective,
        ButtonToolbarDirective,
        ButtonFontSizeDirective,
        ButtonTextAlignDirective,
        StatefulSlicePipe,
        FontSizePipe,
        FontStylesPipe,
        ButtonArrangeDirective,
        VsRepositionComponent,
        VsCompleteComponent,
        DivModalDirective,
        VsWorkareaLatestComponent,
        BlColorpickerDirective
    ],
    providers: [
        {
            provide: PERFECT_SCROLLBAR_CONFIG,
            useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
        },
        FontPickerService,
        VideoStudioService
    ],
    exports: [
        StatefulSlicePipe
    ]
})
export class VideoStudioModule { }
