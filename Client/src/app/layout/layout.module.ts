import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { SettingsComponent } from './settings/settings.component';
import { UserManagementComponent } from './admin/user-management/user-management.component';

import { Ng5FilesModule } from '../shared/module/ng5-files';
import { UserService } from '../shared/services/user.service';
import { ProjectService } from '../shared/services/project.service';

import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbTabsetModule, NgbPopoverModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { YoutubePlayerModule } from 'ngx-youtube-player';
import { TagInputModule } from 'ngx-chips';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        NgbDropdownModule.forRoot(),
        NgbTabsetModule.forRoot(),
        NgbPopoverModule.forRoot(),
        FormsModule,
        YoutubePlayerModule,
        Ng5FilesModule,
        NgxDatatableModule,
        TagInputModule
    ],
    providers: [
        ProjectService,
        UserService
    ],
    declarations: [
        LayoutComponent,
        SidebarComponent,
        HeaderComponent,
        SettingsComponent,
        UserManagementComponent
    ]
})
export class LayoutModule { }
