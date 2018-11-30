/**
 * Static Overlay Service
 * konstantyn
 * 2018-11-25
 */
var helper = require('../helper/helper');

var staticOverlayModel = require('../model/static_overlay');

module.exports = {
    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    getStaticOverlays (userInfo, message, callback) {
        try {
            staticOverlayModel.getStaticOverlays((err, overlays) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {overlays: overlays});
            });
        } catch (err) {
            helper.response.onError('error: getStaticOverlays', callback);
        }
    },
}