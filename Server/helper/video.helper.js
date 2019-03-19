/**
 * Video Helper
 * Updated by Konstantyn Valentinov
 * 2018-05-01
 */

var uuidGen = require('node-uuid');
var shell = require('shelljs');
var _ = require('underscore');
var gm = require('gm');
var path = require('path');

var responseHelper = require('./response.helper');
var logHelper = require('./log.helper');
var serverConfig = require('../config/server.config');
var imageHelper = require('./image.helper');

module.exports = {
    /**
     * 
     * @param {*} videoWidth 
     * @param {*} videoHeight 
     * @param {*} frameWidth 
     * @param {*} frameHeight 
     */
    fit_video_2_frame(videoWidth, videoHeight, frameWidth, frameHeight) {
        const fit = { width: 0, height: 0, offsetX: 0, offsetY: 0 };

        const videoRatio = videoWidth / videoHeight;
        const frameRatio = frameWidth / frameHeight;

        if (frameRatio > videoRatio) {
            const scale = frameHeight / videoHeight;
            fit.width = Math.ceil(videoWidth * scale) % 2 === 0 ? Math.ceil(videoWidth * scale) : Math.ceil(videoWidth * scale) + 1;
            fit.height = frameHeight % 2 === 0 ? frameHeight : frameHeight + 1;
            fit.offsetX = Math.floor((frameWidth - fit.width) / 2);
            fit.offsetY = 0;
        } else {
            const scale = frameWidth / videoWidth;
            fit.width = frameWidth % 2 === 0 ? frameWidth : frameWidth + 1;
            // tslint:disable-next-line:max-line-length
            fit.height = Math.ceil(videoHeight * scale) % 2 === 0 ? Math.ceil(videoHeight * scale) : Math.ceil(videoHeight * scale) + 1;
            fit.offsetX = 0;
            fit.offsetY = Math.floor((frameHeight - fit.height) / 2);
        }

        return fit;
    },

    /**
     * 
     * @param {*} stlPath 
     * @param {*} stlX 
     * @param {*} stlY 
     * @param {*} stlWidth 
     * @param {*} stlHeight 
     * @param {*} stlAngle 
     * @param {*} videoPath 
     * @param {*} startTime 
     * @param {*} endTime 
     * @param {*} callback 
     */
    uploadSubtitle2Video(stlPath, stlX, stlY, stlWidth, stlHeight, stlAngle, videoPath, startTime, endTime, callback){
        if (stlPath == undefined || videoPath == undefined) {
            responseHelper.onError('error: uploadSubtitle2Video', callback);
            return;
        }

        let filterString = "[1:v] scale=-2:" + stlHeight +"[logo]; [logo]format=rgba,colorchannelmixer=aa=1[fg]; [fg]rotate="+stlAngle+"*PI/180:c=none:ow=rotw("+stlAngle+"*PI/180):oh=roth("+-stlAngle+"*PI/180)[rot]; [0:v][rot] overlay="+stlX+":"+stlY+":enable='between(t," + startTime + "," + endTime + ")'[out]";

        let newFilePath = serverConfig.downloadPath + uuidGen.v1() + '.mp4';

        shell.exec('ffmpeg -loglevel quiet -i ' + videoPath + ' ' + forGif1 + ' -i ' + ovlPath + ' -filter_complex "' + filterString + '" -map "[out]" -map 0:a? -c:v libx264 -c:a? copy ' + newFilePath, (code) => {
            if (code != 0) {
                responseHelper.onError('error: mergeOverlay2Video' + code, callback);
                return;
            }
            
            responseHelper.onSuccess(callback, newFilePath);
        });
    },

    /**
     * 
     * @param {*} ovlPath 
     * @param {*} ovlX 
     * @param {*} ovlY 
     * @param {*} ovlWidth 
     * @param {*} ovlHeight 
     * @param {*} ovlAngle 
     * @param {*} videoPath 
     * @param {*} callback 
     */
    mergeOverlay2Video(ovlPath, ovlX, ovlY, ovlWidth, ovlHeight, ovlAngle, videoPath, callback) {
        if (ovlPath == undefined || videoPath == undefined) {
            responseHelper.onError('error: mergeOverlay2Video', callback);
            return;
        }

        let rot = imageHelper.rotateRectagle(ovlX, ovlY, ovlWidth, ovlHeight, ovlAngle);
        
        let forGif1 = (path.extname(ovlPath) === '.gif' || path.extname(ovlPath) === '.GIF') ? '-ignore_loop 0' : '';
        let forGif2 = (path.extname(ovlPath) === '.gif' || path.extname(ovlPath) === '.GIF') ? ':shortest=1' : '';

        // let filterString = "[1]setsar=1,rotate=-" + -ovlAngle + "*PI/180:c=none:ow=rotw(" + -ovlAngle + "*PI/180):oh=roth(" + -ovlAngle + "*PI/180)[s]; [0][s]overlay=" + (ovlX) + ":" + (ovlY) + "[out]";
        let filterString = "[1:v] scale=-2:" + ovlHeight +"[logo]; [logo]format=rgba,colorchannelmixer=aa=1[fg]; [fg]rotate="+ovlAngle+"*PI/180:c=none:ow=rotw("+ovlAngle+"*PI/180):oh=roth("+-ovlAngle+"*PI/180)[rot]; [0:v][rot] overlay="+ovlX+":"+ovlY+forGif2+"[out]";
        
        let newFilePath = serverConfig.downloadPath + uuidGen.v1() + '.mp4';

        shell.exec('ffmpeg -loglevel quiet -i ' + videoPath + ' ' + forGif1 + ' -i ' + ovlPath + ' -filter_complex "' + filterString + '" -map "[out]" -map 0:a? -c:v libx264 -c:a? copy ' + newFilePath, (code) => {
            if (code != 0) {
                responseHelper.onError('error: mergeOverlay2Video' + code, callback);
                return;
            }
            
            responseHelper.onSuccess(callback, newFilePath);
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} duration 
     * @param {*} srcWidth 
     * @param {*} srcHeight 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} destWidth 
     * @param {*} destHeight 
     * @param {*} callback 
     */
    image2reposition(filepath, duration, srcWidth, srcHeight, offsetX, offsetY, destWidth, destHeight, color, callback) {
        if (filepath == undefined) {
            responseHelper.onError('error: image2reposition', callback);
            return;
        }

        console.log(color);

        if (color == undefined || color == '') {
            color = 'white';
        }

        console.log(color);

        duration = Number.parseInt(duration);
        duration = duration > 0 ? duration : 10;

        let cropX = _.max([0, offsetX]) - offsetX;
        let cropY = _.max([0, offsetY]) - offsetY;
        let cropWidth = (_.min([srcWidth + offsetX, destWidth]) - offsetX) - cropX;
        let cropHeight = (_.min([srcHeight + offsetY, destHeight]) - offsetY) - cropY;

        let forGif = (path.extname(filepath) === '.gif' || path.extname(filepath) === '.GIF') ? '-ignore_loop 0' : '-loop 1';

        let filterString = "-vf scale=" + srcWidth + ":" + srcHeight
            + ",crop=" + cropWidth + ":" + cropHeight + ":" + cropX + ":" + cropY
            + ",pad=" + destWidth + ":" + destHeight + ":" + (cropX + offsetX) + ":" + (cropY + offsetY) + ":color="+color+",setsar=1:1";
        let newFilePath = serverConfig.downloadPath + uuidGen.v1() + '.mp4';

        shell.exec('ffmpeg -loglevel quiet -f lavfi -i anullsrc=channel_layout=stereo:sample_rate=44100 ' + forGif + ' -i ' + filepath + ' -t ' + duration + ' ' + filterString + ' -codec:v libx264 -codec:a libmp3lame -ab 320k -pix_fmt yuv420p ' + newFilePath, (code) => {
            if (code != 0) {
                responseHelper.onError('error: image2reposition', callback);
                return;
            }

            responseHelper.onSuccess(callback, newFilePath);
        });
    },

    getRotateMetadata(filepath, callback) {
        try {
            if (filepath == undefined) {
                responseHelper.onError('error: getRotateMetadata', callback);
                return;
            }

            let commandLine = 'ffprobe -loglevel quiet -i ' + filepath + ' -show_entries stream_tags=rotate -loglevel error';

            shell.exec(commandLine, (err, result) => {
                if (err) {
                    responseHelper.onError('error: gifInfo' + err, callback);
                    return;
                }

                var rotate = 0;
                if (result.indexOf("rotate=90") != -1) {
                    rotate = 90;
                }
                if (result.indexOf("rotate=180") != -1) {
                    rotate = 90;
                }
                if (result.indexOf("rotate=270") != -1) {
                    rotate = 90;
                }

                // console.log(rotate);

                responseHelper.onSuccess(callback, rotate);
            });
        } catch (err) {
            responseHelper.onError('error: getRotateMetadata' + err, callback);
        }
    },

    resizevideo(filepath, destWidth, destHeight, callback) {
        if (filepath == undefined) {
            responseHelper.onError('error: resizevideo', callback);
            return;
        }

        let newFilePath = serverConfig.downloadPath + uuidGen.v1() + '.mp4';
        
        shell.exec('ffmpeg -loglevel quiet -i ' + filepath + ' -vf scale=' + destWidth + ':' + destHeight + ' ' + newFilePath, (code) => {
            if (code != 0) {
                responseHelper.onError('error: resizevideo', callback);
                return;
            }

            responseHelper.onSuccess(callback, newFilePath);
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} seekTime 
     * @param {*} duration 
     * @param {*} srcWidth 
     * @param {*} srcHeight 
     * @param {*} offsetX 
     * @param {*} offsetY 
     * @param {*} destWidth 
     * @param {*} destHeight 
     * @param {*} callback 
     */
    video2reposition(filepath, seekTime, duration, endTime, srcWidth, srcHeight, offsetX, offsetY, destWidth, destHeight, color, callback) {
        if (filepath == undefined) {
            responseHelper.onError('error: video2reposition' + ' filepath error', callback);
            return;
        }

        console.log(color);

        if (color == undefined || color == '') {
            color = 'white';
        }

        console.log(color);

        seekTime = seekTime != undefined ? seekTime : 0;
        duration = duration > 0 ? duration : 10;
        endTime = endTime != undefined ? endTime : duration;

        let cropX = _.max([0, offsetX]) - offsetX;
        let cropY = _.max([0, offsetY]) - offsetY;
        let cropWidth = (_.min([srcWidth + offsetX, destWidth]) - offsetX) - cropX;
        let cropHeight = (_.min([srcHeight + offsetY, destHeight]) - offsetY) - cropY;

        let filterString = "-vf scale=" + srcWidth + ":" + srcHeight
            + ",crop=" + cropWidth + ":" + cropHeight + ":" + cropX + ":" + cropY
            + ",pad=" + destWidth + ":" + destHeight + ":" + (cropX + offsetX) + ":" + (cropY + offsetY) + ":color="+color+",setsar=1:1";
        let newFilePath = serverConfig.downloadPath + uuidGen.v1() + '.mp4';

        shell.exec('ffmpeg -loglevel quiet -i ' + filepath + ' -ss ' + seekTime + ' -to ' + endTime + ' ' + filterString + ' -codec:v libx264 -codec:a libmp3lame ' + newFilePath, (code) => {
            if (code != 0) {
                responseHelper.onError('error: video2reposition' + code, callback);
                return;
            }

            responseHelper.onSuccess(callback, newFilePath);
        });

    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} outpath 
     * @param {*} callback 
     */
    convert2mp4(filepath, outpath, callback) {
        if (filepath == undefined) {
            responseHelper.onError('error: convert2mp4', callback);
            return;
        }

        let filename = uuidGen.v1() + '.mp4';
        shell.exec('ffmpeg -loglevel quiet -i ' + filepath + ' -f mp4 -codec:v libx264 -codec:a libmp3lame ' + outpath + filename, (code) => {
            if (code != 0) {
                responseHelper.onError('error: convert2mp4', callback);
                return;
            }

            responseHelper.onSuccess(callback, outpath + filename);
        });
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    convertTs(filepath, callback) {
        let newFilePath = serverConfig.downloadPath + uuidGen.v1() + '.ts';

        shell.exec('ffmpeg -loglevel quiet -i ' + filepath + ' -c copy -bsf:v h264_mp4toannexb -f mpegts -acodec copy ' + newFilePath, (code) => {
            if (code != 0) {
                responseHelper.onError('error: convertTs', callback);
                return;
            }

            responseHelper.onSuccess(callback, newFilePath);
        });
    },

    /**
     * 
     * @param {*} tsFiles 
     * @param {*} callback 
     */
    concatenate(tsFiles, callback) {
        let fileListString = tsFiles.join('|');
        if (tsFiles.length > 0) {
            let filepath = serverConfig.downloadPath + uuidGen.v1() + '.mp4';
            shell.exec('ffmpeg -loglevel quiet -i "concat:' + fileListString + '" -c copy -bsf:v h264_mp4toannexb -c:a aac -ac 2 -b:a 128k ' + filepath, (code) => {
                if (code != 0) {
                    responseHelper.onError('error: concatenate', callback);
                    return;
                }

                responseHelper.onSuccess(callback, filepath);
            });
        } else {
            responseHelper.onError('error: concatenate', callback);
        }       
    }
}