import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectComponent } from './project.component';
import {
    ProjectListComponent,
    ProjectDetailComponent } from './components/index';

const routes: Routes = [
    {
        path: '',
        component: ProjectComponent,
        children: [
            { path: '', component: ProjectListComponent },
            { path: 'detail/:prj_id', component: ProjectDetailComponent },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProjectRoutingModule { }
