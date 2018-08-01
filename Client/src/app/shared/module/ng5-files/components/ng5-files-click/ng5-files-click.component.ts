import {
  Component,
  OnInit,
  DoCheck,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ChangeDetectorRef
} from '@angular/core';

import {
  Ng5FilesService,
  Ng5FilesUtilsService
} from '../../services';

import { Ng5FilesSelected } from '../../declarations/ng5-files-selected';

@Component({
    selector: 'ng5-files-click',
    templateUrl: './ng5-files-click.component.html',
    styles: ['.ng5-files-upload-btn { display: none; }'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Ng5FilesClickComponent implements OnInit, DoCheck {

  @Input() configId = 'shared';

  @Output() filesSelect: EventEmitter<Ng5FilesSelected> = new EventEmitter<Ng5FilesSelected>();

  public maxFilesCount: number;
  public acceptExtensions: string;

  constructor(
    private changeDetector: ChangeDetectorRef,
    private ng5FilesService: Ng5FilesService,
    private ng5FilesUtilsService: Ng5FilesUtilsService
  ) {}

  ngDoCheck() {
    this.changeDetector.detectChanges();
  }

  ngOnInit() {
    const config = this.ng5FilesService.getConfig(this.configId);

    this.maxFilesCount = config.maxFilesCount;
    this.acceptExtensions = <string>config.acceptExtensions;
  }

  public onChange(files: FileList): void {
    if (!files.length) {
        return;
    }

    this.filesSelect.emit(
      this.ng5FilesUtilsService.verifyFiles(files, this.configId)
    );
  }

}
