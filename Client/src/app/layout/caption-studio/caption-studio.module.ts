import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';
import { NgxMaskModule } from 'ngx-mask';

import { RangeSliderModule } from '../../shared/module/range-slider/range-slider.module';
import { NgbButtonsModule, NgbDropdownModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';

import {
    CsSidebarComponent,
    CsSubtitleControlComponent,
    CsContentComponent,
    CsVideoPlayerComponent,
    CsSubtitleToolabarComponent
} from './components';
import { CaptionStudioComponent } from './caption-studio.component';
import { CaptionStudioRouting } from './caption-studio.routing';

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
        CaptionStudioRouting
    ],
    declarations: [
        CaptionStudioComponent,
        CsSidebarComponent,
        CsContentComponent,
        CsSubtitleControlComponent,
        CsVideoPlayerComponent,
        CsSubtitleToolabarComponent
    ],
})
export class CaptionStudioModule { }
