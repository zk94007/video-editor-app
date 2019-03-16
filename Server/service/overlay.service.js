/**
 * Overlay Service
 * konstantyn
 * 2018-04-07
 */

var _ = require('underscore');
var async = require('async');

var helper = require('../helper/helper');
var config = require('../config/config');
var overlayModel = require('../model/overlay.model');

module.exports = {
    addOverlay(userInfo, message, callback) {
        try {
            let fake_id = message.fake_id;
            let frm_id = message.frm_id;
            let width = message.width;
            let height = message.height;
            let offsetX = message.offsetX;
            let offsetY = message.offsetY;
            let angle = message.angle;
            let ovl_type = message.ovl_type;
            let ovl_content = message.ovl_content;
            let ovl_json = message.ovl_json;
            let ovl_order = message.ovl_order;
            // let opacity = message.opacity ? messsage.opacity : '1';

            var notFilledFields = [];
            fake_id == undefined ? notFilledFields.push('fake_id') : '';
            frm_id == undefined ? notFilledFields.push('frm_id') : '';
            width == undefined ? notFilledFields.push('width') : '';
            height == undefined ? notFilledFields.push('height') : '';
            offsetX == undefined ? notFilledFields.push('offsetX') : '';
            offsetY == undefined ? notFilledFields.push('offsetY') : '';
            angle == undefined ? notFilledFields.push('angle') : '';
            ovl_type == undefined ? notFilledFields.push('ovl_type') : '';
            ovl_content == undefined ? notFilledFields.push('ovl_content') : '';
            ovl_json == undefined ? notFilledFields.push('ovl_json') : '';
            ovl_order == undefined ? notFilledFields.push('ovl_order') : '';
            // opacity == undefined ? notFilledFields.push('opacity') : '';



            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let ovl_reposition = {
                width: width,
                height: height,
                offsetX: offsetX,
                offsetY: offsetY,
                angle: angle,
                opacity: 1,
            };

            let overlay = [frm_id, JSON.stringify(ovl_reposition), ovl_order, ovl_type, ovl_content, helper.query.base64(ovl_json)];
            overlayModel.addOverlay(overlay, (err, row) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {'ovl_id': row.ovl_id, 'fake_id': fake_id});
            });
        } catch (err) {
            helper.response.onError('error: addOverlay' + err, callback);
        }
    },

    duplicateOverlay(userInfo, message, callback) {
        try {
            let ovl_id = message.ovl_id;

            let notFilledFields = [];
            ovl_id == undefined ? notFilledFields.push('ovl_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let org_ovl_id = '';
            let new_ovl_id = '';
            let new_ovl_order = '';

            overlayModel.getOverlaysByOvlId(ovl_id, (err, overlay) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                overlayModel.backwardOrder(overlay.frm_id, overlay.ovl_order, (_err) => {
                    if (err) {
                        helper.response.onError(err, callback);
                        return;
                    }

                    org_ovl_id = overlay.ovl_id;

                    let data = [overlay.frm_id,
                        overlay.ovl_reposition,
                        overlay.ovl_order + 1,
                        overlay.ovl_type,
                        overlay.ovl_content,
                        overlay.ovl_json];
                    
                    overlayModel.addOverlay(data, (__err, row) => {
                        if (__err) {
                            helper.response.onError(_err, callback);
                            return;
                        }

                        new_ovl_id = row.ovl_id;
                        new_ovl_order = row.ovl_order;

                        helper.response.onSuccessPlus(callback, {
                            org_ovl_id: org_ovl_id,
                            new_ovl_id: new_ovl_id,
                            new_ovl_order: new_ovl_order
                        });
                    });
                });
            });
        } catch (err) {

        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    updateOverlayOrder(userInfo, message, callback) {
        try {
            let orders = message.orders;

            let notFilledFields = [];
            !orders ? notFilledFields.push('orders') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let ovl_ids = _.pluck(orders, 'ovl_id');
            let ovl_orders = _.pluck(orders, 'ovl_order');

            let parallelTasks = [];

            for (let i = 0; i < ovl_ids.length; i++) {
                parallelTasks.push((parallel_callback) => {
                    helper.model.update('overlay', [
                        {
                            name: 'ovl_order',
                            value: ovl_orders[i],
                        }
                    ], [
                            {
                                name: 'ovl_id =',
                                value: ovl_ids[i],
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
            helper.response.onError('error: updateFrameOrder' + err, callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    updateOverlay(userInfo, message, callback) {
        try {
            let ovl_id = message.ovl_id;
            let width = message.width;
            let height = message.height;
            let offsetX = message.offsetX;
            let offsetY = message.offsetY;
            let angle = message.angle;
            let opacity = message.opacity;
            let ovl_content = message.ovl_content;
            let ovl_json = message.ovl_json;

            let notFilledFields = [];
            ovl_id == undefined ? notFilledFields.push('ovl_id') : '';
            width == undefined ? notFilledFields.push('width') : '';
            height == undefined ? notFilledFields.push('height') : '';
            offsetX == undefined ? notFilledFields.push('offsetX') : '';
            offsetY == undefined ? notFilledFields.push('offsetY') : '';
            angle == undefined ? notFilledFields.push('angle') : '';
            ovl_content == undefined ? notFilledFields.push('ovl_content') : '';
            ovl_json == undefined ? notFilledFields.push('ovl_json') : '';
            opacity == undefined ? notFilledFields.push('opacity') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let ovl_reposition = {
                width: width,
                height: height,
                offsetX: offsetX,
                offsetY: offsetY,
                angle: angle,
                opacity: opacity,
            };

            const data = [
                {
                    name: 'ovl_reposition',
                    value: JSON.stringify(ovl_reposition)
                },
                {
                    name: 'ovl_content',
                    value: ovl_content
                },
                {
                    name: 'ovl_json',
                    value: helper.query.base64(ovl_json)
                }
            ];

            overlayModel.updateOverlay(ovl_id, data, (err) => {
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
    deleteOverlay (userInfo, message, callback) {
        try {
            var ovl_id = message.ovl_id;

            var notFilledFields = [];
            !ovl_id ? notFilledFields.push('ovl_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            overlayModel.deleteOverlayByOvlId(ovl_id, (err, result) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteOverlay' + err, callback);
        }
    },    
}