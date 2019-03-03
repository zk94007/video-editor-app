/**
 * Static Overlay Model
 * konstantyn
 * 2018-11-25
 */

var async = require('async');
var _ = require('underscore');

var helper = require('../helper/helper');

module.exports = {
    /**
     *  
     * @param {*} callback 
     */
    getStaticOverlays(callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.static_overlay;', [], function (err, result) {
                if (err) {
                    helper.response.onError('error: getStaticOverlays' + err, callback);
                    return;
                }

                let static_overlays = [];
                _.each(result.rows, (row) => {
                    var static_overlay = {
                        sov_id: row.sov_id,
                        sov_name: row.sov_name,
                        sov_path: row.sov_path,
                        sov_resolution: row.sov_resolution != '' ? JSON.parse(row.sov_resolution) : '',
                        sov_gif_delays : row.sov_gif_delays != '' ? JSON.parse(row.sov_gif_delays) : '',
                        sov_type : row.sov_type,
                    };
                    static_overlays.push(static_overlay);
                });

                helper.response.onSuccess(callback, static_overlays);
            });
        } catch (err) {
            helper.response.onError('error: getStaticOverlays' + err, callback);
        }
    }
}