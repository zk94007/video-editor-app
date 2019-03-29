import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubtitleRoutingModule } from './subtitle-routing.module';
import { SubtitleComponent } from './subtitle.component';
import { SubtitleListComponent } from './components/subtitle-list/subtitle-list.component';

@NgModule({
    imports: [
        CommonModule,
        SubtitleRoutingModule
    ],
    declarations: [
        SubtitleComponent,
        SubtitleListComponent
    ]
})
export class SubtitleModule { }
