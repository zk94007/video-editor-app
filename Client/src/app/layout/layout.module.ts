import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule, NgbTabsetModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../shared/services/project.service';
import { YoutubePlayerModule } from 'ngx-youtube-player';
import { UserService } from '../shared/services/user.service';
import { SettingsComponent } from './settings/settings.component';
import { Ng5FilesModule } from '../shared/module/ng5-files';
import { UserManagementComponent } from './admin/user-management/user-management.component';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        NgbDropdownModule.forRoot(),
        NgbTabsetModule.forRoot(),
        FormsModule,
        YoutubePlayerModule,
        Ng5FilesModule
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
