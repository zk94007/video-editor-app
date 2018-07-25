/**
 * Frame Service
 * konstantyn
 * 2018-03-10
 */

var download = require('url-download');
var path = require('path');
var mime = require('mime-types');
var getVideoDuration = require('get-video-duration');
var async = require('async');
var _ = require('underscore');

var helper = require('../helper/helper');
var config = require('../config/config');

var projectModel = require('../model/project.model');
var frameModel = require('../model/frame.model');
var overlayModel = require('../model/overlay.model');
var uploadImageModel = require('../model/upload_image.model');

module.exports = {
    
    /**
     * 
     * @param {*} message 
     * @param {*} metadata 
     * @param {*} callback 
     */
    addUploadImage(message, metadata, callback) {
        try {
            let prj_id = message.prj_id;
            let cloudPath = metadata.cloudPath;
            let resolution = metadata.resolution;
            let filename = message.filename;
            let filepath = metadata.filepath;
            let gif_delays = metadata.gif_delays;
            
            let notFilledFields = [];
            !prj_id ? notFilledFields.push('projectId') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let mimeType = mime.lookup(cloudPath);

            let data = [prj_id, cloudPath, resolution, filename, gif_delays];

            uploadImageModel.addUploadImage(data, (err, row) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {
                    uim_id: row.uim_id,
                    uim_path: row.uim_path,
                    uim_name: row.uim_name,
                    uim_resolution: row.uim_resolution,
                    uim_gif_delays: row.uim_gif_delays,
                });
            });
        } catch (err) {
            helper.response.onError('error: addFrame', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    deleteUploadImage (userInfo, message, callback) {
        try {
            let uim_id = message.uim_id;
            
            let notFilledFields = [];
            uim_id == undefined ? notFilledFields.push('uim_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            uploadImageModel.deleteUploadImageByUimId(uim_id, function (err, result) {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteUploadImage' + err, callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    getUploadImages (userInfo, message, callback) {
        try {
            let prj_id = message.prj_id;

            let notFilledFields = [];
            message.prj_id == undefined ? notFilledFields.push('prj_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            frameModel.getFramesByPrjId(prj_id, (err, frames) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {frames: frames});
            });
        } catch (err) {
            helper.response.onError('error: getFrameList', callback);
        }
    },
}