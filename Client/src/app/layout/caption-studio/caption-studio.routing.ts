import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CaptionStudioComponent } from './caption-studio.component';

const routes: Routes = [{
    path: '',
    component: CaptionStudioComponent
}];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CaptionStudioRouting {}
