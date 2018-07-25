export interface Ng5FilesConfig {
  acceptExtensions?: string[] | string;
  maxFilesCount?: number;
  maxFileSize?: number;
  totalFilesSize?: number;
}

export const ng5FilesConfigDefault: Ng5FilesConfig = {
  acceptExtensions: '*',
  maxFilesCount: Infinity,
  maxFileSize: Infinity,
  totalFilesSize: Infinity
};
