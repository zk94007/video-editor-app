import { NgModule } from '@angular/core';

import {
  Ng5FilesService,
  Ng5FilesUtilsService
} from './services';

import {
  Ng5FilesClickComponent,
  Ng5FilesDropComponent
} from './components';

@NgModule({
  declarations: [
    Ng5FilesClickComponent,
    Ng5FilesDropComponent
  ],
  exports: [
    Ng5FilesClickComponent,
    Ng5FilesDropComponent
  ],
  providers: [
    Ng5FilesService,
    Ng5FilesUtilsService
  ]
})
export class Ng5FilesModule {
  // todo: except exports Ng5FilesUtilsService
}
