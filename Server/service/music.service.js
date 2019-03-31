/**
 * Music Service
 * konstantyn
 * 2018-03-21
 */

var download = require('url-download');
var path = require('path');
var mime = require('mime-types');
var getVideoDuration = require('get-video-duration');
var async = require('async');
var _ = require('underscore');

var helper = require('../helper/helper');
var config = require('../config/config');

var musicModel = require('../model/music.model');

module.exports = {
    
    /**
     * 
     * @param {*} message 
     * @param {*} metadata 
     * @param {*} callback 
     */
    addMusic(message, metadata, callback) {
        try {
            let prj_id = message.prj_id;
            let cloudPath = metadata.cloudPath;
            let duration = metadata.duration;
            let filename = message.filename;
            
            let notFilledFields = [];
            !prj_id ? notFilledFields.push('projectId') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let data = [prj_id, cloudPath, filename, duration, 1];

            musicModel.addMusic(data, (err, row) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {
                    mus_id: row.mus_id,
                    mus_path: cloudPath,
                    mus_name: filename,
                    mus_duration: duration
                });
            });
        } catch (err) {
            helper.response.onError('error: addMusic', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    deleteMusic (userInfo, message, callback) {
        try {
            let mus_id = message.mus_id;
            
            let notFilledFields = [];
            mus_id == undefined ? notFilledFields.push('mus_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            musicModel.deleteMusicByMusId(mus_id, function (err, result) {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteMusic' + err, callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    getMusics (userInfo, message, callback) {
        try {
            let prj_id = message.prj_id;

            let notFilledFields = [];
            message.prj_id == undefined ? notFilledFields.push('prj_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            musicModel.getMusicsByPrjId(prj_id, (err, musics) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {musics: musics});
            });
        } catch (err) {
            helper.response.onError('error: getMusics', callback);
        }
    },
}