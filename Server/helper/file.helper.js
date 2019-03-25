/**
 * File Helper
 * konstantyn
 * 2018-03-10
 */

var path = require('path');
var fs = require('fs');
var azure = require('azure-storage');
var readChunk = require('read-chunk');
var mime = require('mime-types');
var fileType = require('file-type');
var async = require('async');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var gm = require('gm').subClass({ imageMagick: true });
var uuidGen = require('node-uuid');
var getResolution = require('get-video-dimensions');
var download = require('url-download');
var _ = require('underscore');
var youtubedl = require('youtube-dl');
var imgur = require('imgur');
var download_file = require('download-file');

var config = require('../config/config');
var logHelper = require('./log.helper');
var videoHelper = require('./video.helper');
var imageHelper = require('./image.helper');
var responseHelper = require('./response.helper');
var serverConfig = require('../config/server.config');

var blobService = azure.createBlobService(config.cloud.azure.AZURE_STORAGE_ACCOUNT, config.cloud.azure.AZURE_STORAGE_ACCESS_KEY);

blobService.getServiceProperties(function (error, result, response) {
    if (!error) {
        var serviceProperties = result;

        // modify the properties
        serviceProperties['DefaultServiceVersion'] = '2017-07-29';

        blobService.setServiceProperties(serviceProperties, function (error, result, response) {
            // blobService.getServiceProperties(function (error, result, response) {
            //     if (!error) {
            //         // console.log(serviceProperties);
            //     }
            // });
        });
    }
});

blobService.createContainerIfNotExists('stage', { publicAccessLevel: 'blob' }, function (error, result, response) {
});

module.exports = {
    /**
     * 
     * @param {*} filename 
     * @param {*} localPath 
     * @param {*} callback 
     */
    putFileToCloud(filename, prjname, localPath, callback) {
        if (prjname === '') {
            blobService.createBlockBlobFromLocalFile('stage', filename, localPath, (err, result, response) => {
                if (err) {
                    responseHelper.onError('error: putFileToCloud', callback);
                    return;
                }

                let cloudPath = 'https://' + config.cloud.azure.AZURE_STORAGE_ACCOUNT + '.blob.core.windows.net/stage/' + filename;
                responseHelper.onSuccess(callback, cloudPath);
            });
        } else {
            blobService.createBlockBlobFromLocalFile('stage', filename, localPath, { contentSettings: { contentDisposition: 'attachment; filename="' + encodeURI(prjname) + '.mp4"'} }, (err, result, response) => {
                if (err) {
                    responseHelper.onError('error: putFileToCloud', callback);
                    return;
                }

                let cloudPath = 'https://' + config.cloud.azure.AZURE_STORAGE_ACCOUNT + '.blob.core.windows.net/stage/' + filename;
                responseHelper.onSuccess(callback, cloudPath);
            });
        }
    },

    /**
     * 
     * @param {*} callback 
     */
    generateSasToken(callback) {
        let perms = azure.BlobUtilities.SharedAccessPermissions;

        let startDate = new Date();
        startDate.setMinutes(startDate.getMinutes() - 5);
        let expiryDate = new Date(startDate);
        expiryDate.setMinutes(startDate.getMinutes() + 60);

        let sharedAccessPolicy = {
          AccessPolicy: {
            Permissions: azure.BlobUtilities.SharedAccessPermissions.READ,
            Start: startDate,
            Expiry: expiryDate
          }
        };
        let sasToken = blobService.generateSharedAccessSignature('stage', undefined, sharedAccessPolicy);
        let data = {
          token: sasToken,
          expiryDate,
          issDate: startDate
        };
        responseHelper.onSuccess(callback, data);
    },

    blobService: blobService,

    /**
     * 
     * @param {*} stream 
     * @param {*} outpath 
     * @param {*} filename
     * @param {*} callback 
     */
    writeStream(stream, outpath, filename, callback) {
        let ext = mime.extension(mime.lookup(filename));
        let filepath = outpath + uuidGen.v1() + '.' + ext;
        let writeStream = fs.createWriteStream(filepath, { highWaterMark: 102400 * 5 });
        stream.pipe(writeStream);

        writeStream.on('close', () => {
            responseHelper.onSuccess(callback, filepath);
        });

        writeStream.on('error', (err) => {
            responseHelper.onError('error: writeStream', callback);
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    readFile(filepath, callback) {
        fs.readFile(filepath, (err, buffer) => {
            if (err) {
                responseHelper.onError('error: readFile', callback);
                return;
            }
            responseHelper.onSuccess(callback, buffer);
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} buffer 
     * @param {*} mode 
     * @param {*} callback 
     */
    writeFile(filepath, buffer, mode, callback) {
        fs.writeFile(filepath, buffer, mode, (err) => {
            if (err) {
                responseHelper.onError('error: writeFile', callback);
                return;
            }
            responseHelper.onSuccess(callback);
        })
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    deleteFile(filepath, callback) {
        fs.unlink(filepath, (err) => {
            if (err) {
                responseHelper.onError('error: deleteFile', callback);
                return;
            }
            responseHelper.onSuccess(callback);
        });
    },

    /**
     * 
     * @param {*} srcpath 
     * @param {*} destpath 
     * @param {*} callback 
     */
    copyFile(srcpath, destpath, callback) {
        fs.copyFile(srcpath, destpath, (err) => {
            if (err) {
                responseHelper.onError('error: copyFile', callback);
                return;
            }
            responseHelper.onSuccess(callback);
        });
    },

    /**
     * 
     * @param {*} filepaths 
     * @param {*} callback 
     */
    deleteFiles(filepaths, callback) {
        let parallelTasks = [];

        _.each(filepaths, (filepath) => {
            parallelTasks.push((parallel_callback) => {
                fs.unlink(filepath, (err) => {
                    parallel_callback();
                });
            })
        });

        async.parallel(parallelTasks, (err) => {
            if (err) {
                responseHelper.onError('error: deleteFiles', callback);
            } else {
                responseHelper.onSuccess(callback);
            }
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    getFileFromCloud(filepath, callback) {
        download(filepath, config.server.uploadPath)
            .on('close', () => {
                let filename = path.basename(filepath);
                responseHelper.onSuccess(callback, filename);
            })
            .on('error', (err) => {
                responseHelper.onError('error: getFileFromCloud', callback);
            });
    },

    matchYoutubeUrl(url) {
        var p = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/;
        if(url.match(p)){
            return url.match(p)[1];
        }
        return false;
    },

    download_youtube_video_from_url(youtube_url, callback) {
        try {
            if (!this.matchYoutubeUrl(youtube_url)) {
                responseHelper.onError('error: invalid youtube url', callback);
            }
            
            var filepath = '';
            var filename = '';
            var video = youtubedl(youtube_url, [], {cwd: __dirname});
            video.on('error', (err) => {
                responseHelper.onError('error: download_youtube_video_from_url ' + err, callback);
            });
            video.on('end', () => {
                responseHelper.onSuccess(callback, {filepath: filepath, filename: filename});
            });
            video.on('info', function(info) {
                var mins = 0;
                if (info.duration.split(':').length == 2) {
                    mins = parseInt(info.duration.split(':')[0]);
                } else if (info.duration.split(':').length == 3) {
                    mins = parseInt(info.duration.split(':')[0]) * 60 + parseInt(info.duration.split(':')[1]);
                };
                if (mins > 5) {
                    responseHelper.onErrorPlus(callback, 'error: download_youtube_video_from_url', {type: -100});
                } else {
                    filename = info._filename;
                    // var format_id = info.format_id;
                    // var _v = youtubedl(youtube_url, ['--format='+format_id], {cwd: __dirname});
                    filepath = config.server.uploadPath + uuidGen.v1() + '.mp4';
                    video.pipe(fs.createWriteStream(filepath));
                }
            });
        } catch(e) {
            responseHelper.onError('error: download_youtube_video_from_url ' + e, callback);
        }
    },

    isImgurURL(url) {
        var _imgurDomain = /.*\/\/((i|m)\.)?imgur.com\/.*$/;
        return _imgurDomain.test(url);
    },

    download_imgur_image_from_url(imgur_url, callback) {
        if (!this.isImgurURL(imgur_url)) {
            responseHelper.onError('error: invalid imgur url', callback);
        }

        function parseImageIds(url) {
            var _imgurIdParse = /^.*\/([a-zA-Z0-9,]+)[\?#\.]?.*$/;
            var match = _imgurIdParse.exec(url);
            if(!match || !match[1]) {
                return [];
            }
            return match[1].split(',');  
        }

        var filepath = '';
        var filename = '';

        var idArr = parseImageIds(imgur_url);
        if (idArr.length == 1) {
            imgur.getInfo(idArr[0])
                .then(function(json) {
                    filename = uuidGen.v1() + path.extname(json.data.link);
                    filepath = config.server.uploadPath + filename;
                    download_file(json.data.link, {directory: config.server.uploadPath, filename: filename}, function(err) {
                        if (err) {
                            responseHelper.onError('error: invalid imgur url', callback);
                        } else {
                            responseHelper.onSuccess(callback, {filepath: filepath, filename: filename});
                        }
                    });
                })
                .catch(function(err) {
                    responseHelper.onError('error: invalid imgur url', callback);
                });
        }
        
    },

    /**
     * 
     * @param {*} url 
     * @param {*} callback 
     */
    getFileFromUrl(url, callback) {
        if (this.matchYoutubeUrl(url)) {
            this.download_youtube_video_from_url(url, callback);
        } else if (this.isImgurURL(url)) {
            this.download_imgur_image_from_url(url, callback);
        } else {
            responseHelper.onError('Invalid Url', callback);
        }
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} setProgress 
     * @param {*} callback 
     */
    putMediaToCloud(filepath, setProgress, callback) {
        let mimeType = mime.lookup(filepath);
        if (!mimeType || !(mimeType.includes('video/') || mimeType.includes('image/'))) {
            responseHelper.onError('error: putMediaToCloud' + 'unsupported file', callback);
            return;
        }

        let ext = mime.extension(mimeType);
        let filename = path.basename(filepath, path.extname(filepath));
        let newFileName = filename;

        let resolution = '';
        let gif_delays = '';

        let metadata = {};

        let seriesTasks = [];

        seriesTasks.push((series_callback) => {
            setProgress(80);

            if (mimeType.includes('video/')) {
                newFileName += '.mp4';
                if (ext != 'mp4') {
                    videoHelper.convert2mp4(filepath, serverConfig.uploadPath, (err, newPath) => {
                        if (!err) {
                            fs.unlink(filepath, (err) => {
                                filepath = newPath;
                                getResolution(filepath)
                                    .then((size) => {
                                        resolution = size;
                                        videoHelper.getRotateMetadata(filepath, (err, rotate) => {
                                            if (rotate == 90 || rotate == 270) {
                                                resolution.width = size.height;
                                                resolution.height = size.width;
                                            }
                                            series_callback(err);
                                        });
                                    });
                            });
                        } else {
                            series_callback(err);
                        }
                    });
                } else {
                    getResolution(filepath)
                        .then((size) => {
                            resolution = size;
                            videoHelper.getRotateMetadata(filepath, (err, rotate) => {
                                if (rotate == 90 || rotate == 270) {
                                    resolution = {
                                        width: size.height,
                                        height: size.width
                                    };
                                }
                                series_callback(err);
                            });
                        });
                }
            } else {
                newFileName += '.' + ext;
                if (ext === 'gif' || ext === 'GIF') {
                    imageHelper.fixGif(filepath, () => {
                        imageHelper.convertGif2Sprite(filepath, (err, result) => {
                            if (err) {
                                series_callback(err);
                            } else {
                                gif_delays = result.delays;
                                this.putFileToCloud(path.basename(result.spritepath), '', result.spritepath, (_err, cloudPath) => {
                                    if (_err) {
                                        series_callback(_err);
                                    } else {
                                        this.deleteFiles(result.deleteFiles, (__err) => {
                                            if (__err) {
                                                series_callback(__err);
                                            } else {
                                                gm(filepath)
                                                    .size((___err, size) => {
                                                        if (!___err) {
                                                            resolution = size;
                                                        }
                                                        series_callback(___err);
                                                    });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    });                    
                } else {
                    gm(filepath)
                        .size((err, size) => {
                            if (!err) {
                                resolution = size;
                            }
                            series_callback(err);
                        });
                }
            }
        });

        seriesTasks.push((series_callback) => {
            setProgress(90);
            this.putFileToCloud(newFileName, '', filepath, (err, cloudPath) => {
                if (!err) {
                    fs.rename(filepath, config.server.uploadPath + newFileName, (err) => {
                        if (!err) {
                            metadata = {
                                cloudPath: cloudPath,
                                resolution: resolution,
                                filepath: config.server.uploadPath + newFileName,
                                gif_delays: gif_delays,
                            };
                        }
                        series_callback('');
                    });
                } else {
                    series_callback(err);
                }
            });
        });

        async.series(seriesTasks, (err) => {
            if (!err) {
                responseHelper.onSuccess(callback, metadata);
            } else {
                responseHelper.onError('error: putMediaToCloud' + err, callback);
            }
        });
    },
}