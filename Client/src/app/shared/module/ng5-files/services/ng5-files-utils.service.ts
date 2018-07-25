import { Injectable } from '@angular/core';

import { Ng5FilesService } from './ng5-files.service';

import {
    Ng5FilesSelected,
    Ng5FilesStatus
} from '../declarations';

@Injectable()
export class Ng5FilesUtilsService {

    private static getRegExp(extensions: string): RegExp {
        return new RegExp(`(.*?)\.(${extensions})$`);
    }

    constructor(private ng5FilesService: Ng5FilesService) {
    }

    public verifyFiles(files: FileList, configId = 'shared'): Ng5FilesSelected {
        const filesArray = Array.from(files);

        const config = this.ng5FilesService.getConfig(configId);
        const maxFilesCount = config.maxFilesCount;
        const totalFilesSize = config.totalFilesSize;
        const acceptExtensions = config.acceptExtensions;

        if (filesArray.length > maxFilesCount) {
            return <Ng5FilesSelected> {
                status: Ng5FilesStatus.STATUS_MAX_FILES_COUNT_EXCEED,
                files: filesArray
            };
        }

        const filesWithExceedSize = filesArray.filter((file: File) => file.size > config.maxFileSize);
        if (filesWithExceedSize.length) {
            return <Ng5FilesSelected> {
                status: Ng5FilesStatus.STATUS_MAX_FILE_SIZE_EXCEED,
                files: filesWithExceedSize
            };
        }

        let filesSize = 0;
        filesArray.forEach((file: File) => filesSize += file.size);
        if (filesSize > totalFilesSize) {
            return <Ng5FilesSelected> {
                status: Ng5FilesStatus.STATUS_MAX_FILES_TOTAL_SIZE_EXCEED,
                files: filesArray
            };
        }

        const filesNotMatchExtensions = filesArray.filter((file: File) => {
            const extensionsList = (acceptExtensions as string)
                .split(', ')
                .map(extension => extension.slice(1))
                .join('|');

            const regexp = Ng5FilesUtilsService.getRegExp(extensionsList);

            return !regexp.test(file.name);
        });

        if (filesNotMatchExtensions.length) {
            return <Ng5FilesSelected> {
                status: Ng5FilesStatus.STATUS_NOT_MATCH_EXTENSIONS,
                files: filesNotMatchExtensions
            };
        }

        return <Ng5FilesSelected> {
            status: Ng5FilesStatus.STATUS_SUCCESS,
            files: filesArray
        };
    }

}
