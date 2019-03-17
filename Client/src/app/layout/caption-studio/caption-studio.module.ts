import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { VgCoreModule } from 'videogular2/core';
import { VgControlsModule } from 'videogular2/controls';
import { VgOverlayPlayModule } from 'videogular2/overlay-play';
import { VgBufferingModule } from 'videogular2/buffering';

import { RangeSliderModule } from '../../shared/module/range-slider/range-slider.module';

import { CsSidebarComponent, CsSubtitleControlComponent, CsContentComponent } from './components';
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
        CaptionStudioRouting
    ],
    declarations: [
        CaptionStudioComponent,
        CsSidebarComponent,
        CsContentComponent,
        CsSubtitleControlComponent
    ],
})
export class CaptionStudioModule { }
