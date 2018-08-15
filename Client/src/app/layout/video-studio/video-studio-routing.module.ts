import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VideoStudioComponent } from './video-studio.component';
import { VsCompleteComponent } from './components/vs-complete/vs-complete.component';
import { VsRepositionComponent } from './components/vs-reposition/vs-reposition.component';
import { VsMainComponent } from './components/vs-main/vs-main.component';

const routes: Routes = [
    {
        path: '',
        component: VideoStudioComponent,
        children: [
            {path: '', component: VsMainComponent},
            {path: 'back', redirectTo: ''},
            {path: 'complete', component: VsCompleteComponent},
            {path: 'reposition', component: VsRepositionComponent}
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class VideoStudioRoutingModule { }
