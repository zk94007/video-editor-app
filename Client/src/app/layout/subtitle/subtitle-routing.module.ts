import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubtitleComponent } from './subtitle.component';
import { SubtitleListComponent } from './components/subtitle-list/subtitle-list.component';

const routes: Routes = [{
    path: '',
    component: SubtitleComponent,
    children: [{
        path: '',
        component: SubtitleListComponent
    }]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubtitleRoutingModule { }
