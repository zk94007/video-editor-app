/**
 * Upload Image Model
 * konstantyn
 * 2018-11-25
 */

var async = require('async');
var _ = require('underscore');

var helper = require('../helper/helper');

module.exports = {
    /**
     * 
     * @param {*} data 
     * @param {*} callback 
     */
    addUploadImage(data, callback) {
        try {
            let query = 'INSERT INTO public.upload_image (prj_id, uim_path, uim_resolution, uim_name, uim_gif_delays) VALUES($1, $2, $3, $4, $5) RETURNING uim_id, uim_path, uim_name, uim_resolution, uim_gif_delays;';
            helper.query.runQuery(query, data, (err, result) => {
                if (err) {
                    helper.response.onError('error: addUploadImage', callback);
                    return;
                }

                let row = result.rows[0];
                row.uim_resolution = row.uim_resolution != '' ? JSON.parse(row.uim_resolution) : '';
                row.uim_gif_delays = row.uim_gif_delays != '' ? JSON.parse(row.uim_gif_delays) : '';
                helper.response.onSuccess(callback, row);
            });
        } catch (err) {
            helper.response.onError('error: addUploadImage', callback);
        }
    },

    /**
     * 
     * @param {*} uim_id 
     * @param {*} callback 
     */
    deleteUploadImageByUimId(uim_id, callback) {
        try {
            helper.query.runQuery('DELETE FROM public.upload_image WHERE uim_id = $1 RETURNING uim_id', [uim_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: deleteUploadImageByUimId' + err, callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteUploadImageByUimId' + err, callback);
        }
    },

    /**
     * 
     * @param {*} prj_id 
     * @param {*} callback 
     */
    getUploadImagesByPrjId(prj_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.upload_image where prj_id = $1;', [prj_id], function (err, result) {
                if (err) {
                    helper.response.onError('error: getUploadImagesByPrjId' + err, callback);
                    return;
                }

                let upload_images = [];
                _.each(result.rows, (row) => {
                    var upload_image = {
                        uim_id: row.uim_id,
                        prj_id: row.prj_id,
                        uim_path: row.uim_path,
                        uim_resolution: row.uim_resolution != '' ? JSON.parse(row.uim_resolution) : '',
                        uim_gif_delays : row.uim_gif_delays != '' ? JSON.parse(row.uim_gif_delays) : '',
                    };
                    upload_images.push(upload_image);
                });

                helper.response.onSuccess(callback, upload_images);
            });
        } catch (err) {
            helper.response.onError('error: getUploadImagesByPrjId' + err, callback);
        }
    }
}