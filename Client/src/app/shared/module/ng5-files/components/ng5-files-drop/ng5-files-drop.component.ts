import {
    Component,
    DoCheck,
    Input,
    Output,
    EventEmitter,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    HostListener
} from '@angular/core';

import {
    Ng5FilesUtilsService
} from '../../services';

import { Ng5FilesSelected } from '../../declarations';

@Component({
    selector: 'ng5-files-drop',
    templateUrl: './ng5-files-drop.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class Ng5FilesDropComponent implements DoCheck {

    @Input() private configId = 'shared';

    @Output() filesSelect: EventEmitter<Ng5FilesSelected> = new EventEmitter<Ng5FilesSelected>();

    @HostListener('dragenter', ['$event'])
    public onDragEnter(event: any) {
        this.preventEvent(event);
    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: any) {
        this.preventEvent(event);
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: any) {
        this.preventEvent(event);

        if (!event.dataTransfer || !event.dataTransfer.files) {
            return;
        }

        this.dropFilesHandler(event.dataTransfer.files);
    }

    constructor(private changeDetector: ChangeDetectorRef,
                private ng5FilesUtilsService: Ng5FilesUtilsService) {
    }

    ngDoCheck() {
        this.changeDetector.detectChanges();
    }

    private dropFilesHandler(files: FileList) {
        this.filesSelect.emit(
            this.ng5FilesUtilsService.verifyFiles(files, this.configId)
        );
    }

    private preventEvent(event: any): void {
        event.stopPropagation();
        event.preventDefault();
    }

}
