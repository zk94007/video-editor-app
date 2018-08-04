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
    addFrame(message, metadata, callback) {
        try {
            let prj_id = message.prj_id;
            let cloudPath = metadata.cloudPath;
            let resolution = JSON.stringify(metadata.resolution);
            let filename = message.filename;
            let filepath = metadata.filepath;
            let gif_delays = metadata.gif_delays;

            let notFilledFields = [];
            !prj_id ? notFilledFields.push('projectId') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            projectModel.getProjectByPrjId(prj_id, (err, project) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }
                
                let mimeType = mime.lookup(cloudPath);
                let frm_type = mimeType.includes('video/') ? 1 : 2;

                if (frm_type == 1) {
                    getVideoDuration(filepath).then(duration => {
                        const reposition = helper.video.fit_video_2_frame(metadata.resolution.width, metadata.resolution.height, config.video.scene[project.prj_scene_ratio].width, config.video.scene[project.prj_scene_ratio].height);
                        let data = [prj_id, cloudPath, resolution, filename, '{"seekTime":0,"duration":' + duration + ',"endTime":' + duration + '}', JSON.stringify(reposition), frm_type, gif_delays];

                        frameModel.addFrame(data, (err, row) => {
                            if (err) {
                                helper.response.onError(err, callback);
                                return;
                            }

                            helper.response.onSuccessPlus(callback, {
                                frm_id: row.frm_id,
                                frm_path: row.frm_path,
                                frm_order: row.frm_order,
                                frm_resolution: row.frm_resolution,
                                frm_name: row.frm_name,
                                frm_gif_delays: row.frm_gif_delays
                            });
                        });
                    });
                } else {
                    const reposition = helper.video.fit_video_2_frame(metadata.resolution.width, metadata.resolution.height, config.video.scene[project.prj_scene_ratio].width, config.video.scene[project.prj_scene_ratio].height);
                    let data = [prj_id, cloudPath, resolution, filename, '10', JSON.stringify(reposition), frm_type, gif_delays];

                    frameModel.addFrame(data, (err, row) => {
                        if (err) {
                            helper.response.onError(err, callback);
                            return;
                        }

                        helper.response.onSuccessPlus(callback, {
                            frm_id: row.frm_id,
                            frm_path: row.frm_path,
                            frm_order: row.frm_order,
                            frm_resolution: row.frm_resolution,
                            frm_reposition: row.frm_reposition,
                            frm_name: row.frm_name,
                            frm_gif_delays: row.frm_gif_delays
                        });
                    });
                }
            });
        } catch (err) {
            helper.response.onError('error: addFrame' + err, callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    updateFrame(userInfo, message, callback) {
        try {
            let frm_id = message.frm_id;
            let data = message.data;

            let notFilledFields = [];
            !frm_id ? notFilledFields.push('prj_id') : '';
            !data ? notFilledFields.push('data') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            frameModel.updateFrame(frm_id, data, (err) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateFrame' + err, callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    duplicateFrame(userInfo, message, callback) {
        try {
            let frm_id = message.frm_id;
            let fake_id = message.fake_id;
            let frm_order = message.frm_order;

            let notFilledFields = [];
            frm_id == undefined ? notFilledFields.push('frm_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let org_frm_id = '';
            let new_frm_id = '';
            let new_frm_order = '';
            let new_overlay_ids = [];

            frameModel.getFrameByFrmId(frm_id, (err, frame) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                //@Kostya
                // frameModel.backwardOrder(frame.prj_id, frame.frm_order, (err) => {
                //     if (err) {
                //         helper.response.onError(err, callback);
                //         return;
                //     }

                    org_frm_id = frame.frm_id;

                    let data = [frame.prj_id,
                        frame.frm_path,
                        frame.frm_resolution,
                        
                        //@Kostya
                        frm_order,
                        //frame.frm_order + 1,
                        
                        frame.frm_name,
                        frame.frm_duration,
                        frame.frm_reposition,
                        frame.frm_type,
                        frame.frm_gif_delays];

                    frameModel.addFrame(data, (_err, row) => {
                        new_frm_id = row.frm_id;
                        new_frm_order = row.frm_order;

                        overlayModel.getOverlaysByFrmId(org_frm_id, (_err, overlays) => {
                            if (_err) {
                                helper.response.onError(_err, callback);
                                return;
                            }

                            let parallelTasks = [];

                            _.each(overlays, (overlay) => {
                                parallelTasks.push((parallel_callback) => {
                                    let data = [new_frm_id,
                                    JSON.stringify(overlay.ovl_reposition),
                                    overlay.ovl_order,
                                    overlay.ovl_type,
                                    overlay.ovl_content,
                                    overlay.ovl_json];
                                    overlayModel.addOverlay(data, (__err, _new_overlay) => {
                                        if (!__err) {
                                            new_overlay_ids.push(_new_overlay.ovl_id);
                                        }

                                        parallel_callback(__err);
                                    });
                                });
                            });

                            async.parallel(parallelTasks, (err) => {
                                if (err) {
                                    helper.response.onError('error: duplicateFrame', callback);
                                    return;
                                }

                                helper.response.onSuccessPlus(callback, {
                                    org_frm_id: org_frm_id,
                                    new_frm_id: new_frm_id,
                                    new_frm_order: new_frm_order,
                                    new_overlay_ids: new_overlay_ids,

                                    //@Kostya
                                    fake_id: fake_id
                                });
                            });
                        });
                    });

                // });
            });
        } catch (err) {
            helper.response.onError('error: duplicateFrame', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    deleteFrame (userInfo, message, callback) {
        try {
            let frm_id = message.frm_id;
            let frm_path = message.frm_path;
            let is_video_studio = message.is_video_studio;

            if (frm_id != '' && frm_id != undefined) {
                let seriesTasks = [];
                seriesTasks.push((series_callback) => {
                    overlayModel.deleteOverlayByFrmId(frm_id, (err) => {
                        series_callback(err);
                    });
                });

                seriesTasks.push((series_callback) => {
                    frameModel.deleteFrameByFrmId(frm_id, function (err, result) {
                        if (err) {
                            series_callback(err);
                            return;
                        }

                        //@Kostya
                        if (is_video_studio == undefined) {
                            frameModel.forwardOrder(result.prj_id, result.frm_order, function (_err, _result) {
                                series_callback(_err);
                            });
                        }
                    });
                });

                async.series(seriesTasks, function (err, res) {
                    if (err) {
                        helper.response.onError(err, callback);
                        return;
                    } else {
                        helper.response.onSuccessPlus(callback, {frm_id: frm_id});
                    }
                });
            }
        } catch (err) {
            helper.response.onError('error: deleteFrame', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    updateFrameOrder (userInfo, message, callback) {
        try {            
            let orders = message.orders;
            
            let notFilledFields = [];
            !orders ? notFilledFields.push('orders') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let frm_ids = _.pluck(orders, 'frm_id');
            let frm_orders = _.pluck(orders, 'frm_order');

            let parallelTasks = [];

            for (let i = 0; i< frm_ids.length; i++) {
                parallelTasks.push((parallel_callback) => {
                    helper.model.update('frame', [
                        {
                            name: 'frm_order',
                            value: frm_orders[i],
                        }
                    ], [
                        {
                            name: 'frm_id =',
                                value: frm_ids[i],
                        }
                    ], (err) => {
                        parallel_callback(err);
                    });
                });
            };

            async.parallel(parallelTasks, (err) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateFrameOrder', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    getFrameList (userInfo, message, callback) {
        try {
            let prj_id = message.prj_id;

            let notFilledFields = [];
            message.prj_id == undefined ? notFilledFields.push('prj_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            projectModel.getProjectByPrjId(prj_id, (err, project) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                frameModel.getFramesByPrjId(prj_id, (_err, frames) => {
                    if (_err) {
                        helper.response.onError(_err, callback);
                        return;
                    }

                    helper.response.onSuccessPlus(callback, { project: project, frames: frames });
                });
            });
        } catch (err) {
            helper.response.onError('error: getFrameList', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    getFramesWithOverlay(userInfo, message, callback) {
        try {
            let prj_id = message.prj_id;

            let notFilledFields = [];
            message.prj_id == undefined ? notFilledFields.push('prj_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            projectModel.getProjectByPrjId(prj_id, (err, project) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                let frames = [];

                frameModel.getFramesByPrjId(prj_id, (_err, _frames) => {
                    if (_err) {
                        helper.response.onError(_err, callback);
                        return;
                    }
                    frames = _frames;

                    let parallelTasks = [];

                    _.each(frames, (frame) => {
                        parallelTasks.push((parallel_callback) => {
                            overlayModel.getOverlaysByFrmId(frame.frm_id, (__err, overlays) => {
                                frames[_.findIndex(frames, { frm_id: frame.frm_id })].frm_overlays = overlays;
                                parallel_callback(__err);
                            });
                        });
                    });

                    async.parallel(parallelTasks, (_err) => {
                        if (_err) {
                            helper.response.onError('error: getFramesWithOverlay', callback);
                            return;
                        }

                        project.prj_frames = frames;

                        uploadImageModel.getUploadImagesByPrjId(project.prj_id, (err, upload_images) => {
                            if (err) {
                                helper.response.onError(err);
                                return;
                            }
                            
                            project.upload_images = upload_images;
                            helper.response.onSuccessPlus(callback, {
                                project: project
                            });
                        });                        
                    });
                });
            });
        } catch (err) {
            helper.response.onError('error: getFramesWithOverlay', callback);
        }
    }
}