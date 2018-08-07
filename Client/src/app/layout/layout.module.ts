import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule } from '@angular/forms';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { ProjectService } from '../shared/services/project.service';
import { YoutubePlayerModule } from 'ngx-youtube-player';
import { SignService } from '../shared/services/sign.service';
import { UserService } from '../shared/services/user.service';

@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        NgbDropdownModule.forRoot(),
        FormsModule,
        YoutubePlayerModule
    ],
    providers: [
        ProjectService,
        UserService
    ],
    declarations: [
        LayoutComponent,
        SidebarComponent,
        HeaderComponent
    ]
})
export class LayoutModule { }
