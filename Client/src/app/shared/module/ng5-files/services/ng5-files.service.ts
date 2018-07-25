import { Injectable } from '@angular/core';

import {
    Ng5FilesConfig,
    ng5FilesConfigDefault
} from '../declarations';

@Injectable()
export class Ng5FilesService {

    private static readonly ERROR_MSG_PREFIX = 'ng5Files:';

    private configs: { [key: string]: Ng5FilesConfig } = {};

    private static throwError(
        msg: string,
        type: 'default' | 'range' | 'syntax' | 'reference' = 'default'
    ): never {
        const fullMsg = `${Ng5FilesService.ERROR_MSG_PREFIX} ${msg}`;

        switch (type) {
            case 'default':
                throw new Error(fullMsg);
            case 'range':
                throw new RangeError(fullMsg);
            case 'syntax':
                throw new SyntaxError(fullMsg);
            case 'reference':
                throw new ReferenceError(fullMsg);
        }
    }

    public addConfig(config: Ng5FilesConfig, configId = 'shared'): void {
        this.newConfigVerifyPipeline(config);
        this.configs[configId] = config;
    }

    public getConfig(configId = 'shared'): Ng5FilesConfig {
        if (configId === 'shared' && !this.configs['shared']) {
            this.configs['shared'] = <Ng5FilesConfig>{};
            this.setDefaultProperties(this.configs['shared']);
        }

        if (!this.configs[configId]) {
            Ng5FilesService.throwError(`Config '${configId}' is not found`, 'reference');
        }

        return this.configs[configId];
    }

    private newConfigVerifyPipeline(config): void {
        this.isUnique(config)
            .setDefaultProperties(config)
            .isFilesCountValid(config)
            .isAcceptExtensionsValid(config)
            .isFileSizeRangesValid(config)
            .transformAcceptExtensions(config);
    }

    private isUnique(config): Ng5FilesService {
        const isConfigExist = Object.keys(this.configs).find((key: string) => this.configs[key] === config);
        if (isConfigExist) {
            Ng5FilesService.throwError('Avoid add the same config more than once');
        }

        return this;
    }

    private setDefaultProperties(config: Ng5FilesConfig): Ng5FilesService {
        config.acceptExtensions = config.acceptExtensions || ng5FilesConfigDefault.acceptExtensions;
        config.maxFileSize = config.maxFileSize || ng5FilesConfigDefault.maxFileSize;
        config.totalFilesSize = config.totalFilesSize || ng5FilesConfigDefault.totalFilesSize;
        config.maxFilesCount = config.maxFilesCount === 0 ?
            config.maxFilesCount :
            config.maxFilesCount || ng5FilesConfigDefault.maxFilesCount;

        return this;
    }

    private isFilesCountValid(config): Ng5FilesService {
        if (config.maxFilesCount < 1) {
            const FILES_COUNT_MIN = 1;
            const FILES_COUNT_MAX = Infinity;

            Ng5FilesService.throwError(`maxFilesCount must be between ${FILES_COUNT_MIN} and ${FILES_COUNT_MAX}`, 'range');
        }

        return this;
    }

    private isAcceptExtensionsValid(config): Ng5FilesService {
        if (typeof config.acceptExtensions === 'string' && config.acceptExtensions !== '*') {
            Ng5FilesService.throwError(`acceptanceExtensions type must be "*" or string[]`, 'syntax');
        }

        return this;
    }

    private isFileSizeRangesValid(config): Ng5FilesService {
        if (config.maxFileSize > config.totalFilesSize) {
            Ng5FilesService.throwError('maxFileSize must be less than totalFilesSize', 'range');
        }

        return this;
    }

    private transformAcceptExtensions(config): Ng5FilesService {
        if (
            config.acceptExtensions === '*' ||
            config.acceptExtensions.indexOf('*') !== -1 ||
            Array.isArray(config.acceptExtensions) && config.acceptExtensions.length === 0
        ) {
            config.acceptExtensions = '*/*';
        } else {
            config.acceptExtensions = (config.acceptExtensions as string[])
                .map(extension => '.' + extension.toLowerCase()).join(', ');
        }

        return this;
    }

}
