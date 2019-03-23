import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { NgxMaskModule } from 'ngx-mask';

import { Ng5FilesModule } from '../../shared/module/ng5-files';
import { RangeSliderModule } from '../../shared/module/range-slider/range-slider.module';
import { NgbButtonsModule, NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import {
    CsSidebarComponent,
    CsSubtitleControlComponent,
    CsContentComponent,
    CsVideoPlayerComponent,
    CsSubtitleToolabarComponent,
    CsSubtitleTextComponent,
    CsSubtitleTextItemComponent,
    CsCompleteComponent
} from './components';
import { CaptionStudioComponent } from './caption-studio.component';
import { CaptionStudioRouting } from './caption-studio.routing';

import { FontPickerService } from '../../shared/services/font-picker.service';
import { VideoStudioService } from '../../shared/services/video-studio.service';
import { ProjectService } from '../../shared/services/project.service';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        RangeSliderModule,
        VgCoreModule,
        VgControlsModule,
        VgOverlayPlayModule,
        VgBufferingModule,
        NgxMaskModule.forRoot(),
        NgbButtonsModule,
        NgbDropdownModule,
        NgbTooltipModule,
        Ng5FilesModule,
        CaptionStudioRouting
    ],
    declarations: [
        CaptionStudioComponent,
        CsSidebarComponent,
        CsContentComponent,
        CsSubtitleControlComponent,
        CsVideoPlayerComponent,
        CsSubtitleToolabarComponent,
        CsSubtitleTextComponent,
        CsSubtitleTextItemComponent,
        CsCompleteComponent
    ],
    providers: [
        FontPickerService,
        VideoStudioService,
        ProjectService
    ]
})
export class CaptionStudioModule { }
