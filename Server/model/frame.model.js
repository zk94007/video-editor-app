/**
 * Frame Model
 * konstantyn
 * 2018-03-10
 */

var async = require('async');
var _ = require('underscore');

var helper = require('../helper/helper');

module.exports = {
    /**
     * 
     * @param {*} prj_id 
     * @param {*} callback 
     */
    getFramesByPrjId(prj_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.frame where prj_id = $1 ORDER BY frm_order ASC;', [prj_id], function (err, result) {
                if (err) {
                    helper.response.onError('error: getFramesByPrjId', callback);
                    return;
                }

                let frames = [];
                _.each(result.rows, (row) => {
                    var frame = {
                        frm_id: row.frm_id,
                        frm_order: row.frm_order,
                        frm_type: row.frm_type,
                        frm_duration: row.frm_type == 1 ? JSON.parse(row.frm_duration) : row.frm_duration,
                        frm_name: row.frm_name,
                        frm_path: row.frm_path,
                        frm_resolution: row.frm_resolution != '' ? JSON.parse(row.frm_resolution) : '',
                        frm_reposition: row.frm_reposition != '' ? JSON.parse(row.frm_reposition) : '',
                        frm_gif_delays: row.frm_gif_delays != '' ? JSON.parse(row.frm_gif_delays) : '',
                    };
                    frames.push(frame);
                });

                helper.response.onSuccess(callback, frames);
            });
        } catch (err) {
            helper.response.onError('error: getFramesByPrjId', callback);
        }
    },

    getFrameByFrmId(frm_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.frame where frm_id = $1 ORDER BY frm_order ASC;', [frm_id], function (err, result) {
                if (err) {
                    helper.response.onError('error: getFrameByFrmId', callback);
                    return;
                }

                if (result.rows.length == 0) {
                    helper.response.onError('error: getFrameByFrmId', callback);
                    return;
                }

                let row = result.rows[0];
                let frame = {
                    prj_id: row.prj_id,
                    frm_id: row.frm_id,
                    frm_order: row.frm_order,
                    frm_type: row.frm_type,
                    frm_duration: row.frm_type == 1 ? JSON.parse(row.frm_duration) : row.frm_duration,
                    frm_name: row.frm_name,
                    frm_path: row.frm_path,
                    frm_resolution: row.frm_resolution != '' ? JSON.parse(row.frm_resolution) : '',
                    frm_reposition: row.frm_reposition != '' ? JSON.parse(row.frm_reposition) : '',
                    frm_gif_delays: row.frm_gif_delays != '' ? JSON.parse(row.frm_gif_delays) : '',
                };

                helper.response.onSuccess(callback, frame);
            });
        } catch (err) {
            helper.response.onError('error: getFrameByFrmId', callback);
        }
    },

    /**
     * 
     * @param {*} frm_path 
     * @param {*} callback 
     */
    deleteFrameByFrmPath(frm_path, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.frame WHERE frm_id = $1', [frm_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: deleteFrameByFrmId', callback);
                    return;
                }

                helper.query.runQuery('DELETE FROM public.frame WHERE frm_path = $1 RETURNING prj_id, frm_order', [frm_path], (_err, _result) => {
                    if (_err || _result.rows.length == 0) {
                        helper.response.onError('error: deleteFrameByFrmPath', callback);
                        return;
                    }
                    
                    helper.response.onSuccess(callback, { prj_id: _result.rows[0].prj_id, frm_order: _result.rows[0].frm_order });
                });
            });
        } catch (err) {
            helper.response.onError('error: deleteFrameByFrmPath', callback);
        }
    },

    /**
     * 
     * @param {*} frm_id 
     * @param {*} callback 
     */
    deleteFrameByFrmId(frm_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.frame WHERE frm_id = $1', [frm_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: deleteFrameByFrmId', callback);
                    return;
                }

                helper.query.runQuery('DELETE FROM public.frame WHERE frm_id = $1 RETURNING prj_id, frm_order', [frm_id], (_err, _result) => {
                    if (_err || _result.rows.length == 0) {
                        helper.response.onError('error: deleteFrameByFrmId', callback);
                        return;
                    }

                    helper.response.onSuccess(callback, { prj_id: _result.rows[0].prj_id, frm_order: _result.rows[0].frm_order });
                });
            });
        } catch (err) {
            helper.response.onError('error: deleteFrameByFrmId', callback);
        }
    },

    /**
     * 
     * @param {*} data 
     * @param {*} callback 
     */
    addFrame(data, callback) {
        try {
            let query = '';

            if (data.length == 8)
                query = 'INSERT INTO public.frame (prj_id, frm_path, frm_resolution, frm_order, frm_name, frm_duration, frm_reposition, frm_type, frm_gif_delays) VALUES($1, $2, $3, (SELECT COALESCE(MAX(frm_order), 0) + 1 AS frm_order_max FROM public.frame WHERE prj_id = $1), $4, $5, $6, $7, $8) RETURNING frm_id, frm_path, frm_order, frm_resolution, frm_name, frm_gif_delays, frm_reposition;';
            else
                query = 'INSERT INTO public.frame (prj_id, frm_path, frm_resolution, frm_order, frm_name, frm_duration, frm_reposition, frm_type, frm_gif_delays) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING frm_id, frm_path, frm_order, frm_resolution, frm_reposition, frm_name, frm_gif_delays;';

            helper.query.runQuery(query, data, (err, result) => {
                if (err) {
                    helper.response.onError('error: addFrame' + err, callback);
                    return;
                }

                let row = result.rows[0];
                row.frm_reposition = row.frm_reposition != '' ? JSON.parse(row.frm_reposition) : '';
                row.frm_resolution = row.frm_resolution != '' ? JSON.parse(row.frm_resolution) : '';
                row.frm_gif_delays = row.frm_gif_delays != '' ? JSON.parse(row.frm_gif_delays) : '';
                helper.response.onSuccess(callback, row);
            });
        } catch (err) {
            helper.response.onError('error: addFrame' + err, callback);
        }
    },

    /**
     * 
     * @param {*} prj_id 
     * @param {*} frm_order 
     * @param {*} callback 
     */
    forwardOrder(prj_id, frm_order, callback) {
        try {
            helper.query.runQuery('SELECT frm_id, frm_order FROM public.frame WHERE prj_id = $1 AND frm_order > $2', [prj_id, frm_order], (err, result) => {
                if (err) {
                    helper.response.onError('error: forwardOrder', callback);
                    return;
                }

                var parallelTasks = [];

                _.each(result.rows, (row) => {
                    parallelTasks.push((parallel_callback) => {
                        helper.query.runQuery('UPDATE public.frame SET (frm_order) = ($1) WHERE frm_id = $2', [row.frm_order - 1, row.frm_id], (_err) => {
                            parallel_callback(_err);
                        });
                    });
                });

                async.parallel(parallelTasks, (_err) => {
                    if (_err) {
                        helper.response.onError('error: forwardOrder', callback);
                        return;
                    }

                    helper.response.onSuccess(callback);
                });
            });
        } catch (err) {
            helper.response.onError('error: forwardOrder', callback);
        }
    },

    /**
     * 
     * @param {*} prj_id 
     * @param {*} frm_order 
     * @param {*} callback 
     */
    backwardOrder(prj_id, frm_order, callback) {
        try {
            helper.query.runQuery('SELECT frm_id, frm_order FROM public.frame WHERE prj_id = $1 AND frm_order > $2', [prj_id, frm_order], (err, result) => {
                if (err) {
                    helper.response.onError('error: backwardOrder1', callback);
                    return;
                }

                var parallelTasks = [];

                _.each(result.rows, (row) => {
                    parallelTasks.push(function (parallel_callback) {
                        helper.query.runQuery('UPDATE public.frame SET frm_order = $1 WHERE frm_id = $2', [row.frm_order + 1, row.frm_id], (_err) => {
                            parallel_callback(_err);
                        });
                    });
                });

                async.parallel(parallelTasks, (_err) => {
                    if (_err) {
                        helper.response.onError('error: backwardOrder2', callback);
                        return;
                    }

                    helper.response.onSuccess(callback);
                });
            });
        } catch (err) {
            helper.response.onError('error: backwardOrder3', callback);
        }
    },

    addImageFrame: function(data, callback) {
        try {
            let query = 'INSERT INTO public.frame (prj_id, frm_path, frm_resolution, frm_order, frm_name, frm_crop, frm_duration, frm_path169, frm_path11, frm_path916) VALUES($1, $2, $3, (SELECT COALESCE(MAX(frm_order), 0) + 1 AS frm_order_max FROM public.frame WHERE prj_id = $4), $5, $6, $7, $8, $9, $10) RETURNING frm_id, frm_path, frm_order, frm_resolution, frm_name;';
            helper.query.runQuery(query, data, function (err, result) {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                var row = result.rows[0];
                helper.response.onSuccess(callback, row);
            });
        } catch (err) {
            helper.log.model('frame', err);
            helper.response.onError(err, callback);
        }
    },

    addVideoFrame: function(data, callback) {
        try {
            let query = 'INSERT INTO public.frame (prj_id, frm_path, frm_resolution, frm_order, frm_name, frm_crop, frm_duration) VALUES($1, $2, $3, (SELECT COALESCE(MAX(frm_order), 0) + 1 AS frm_order_max FROM public.frame WHERE prj_id = $4), $5, $6, $7) RETURNING frm_id, frm_path, frm_order, frm_resolution, frm_name;';
            helper.query.runQuery(query, data, function (err, result) {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                var row = result.rows[0];
                helper.response.onSuccess(callback, row);
            });
        } catch (err) {
            helper.log.model('frame', err);
            helper.response.onError(err, callback);
        }
    },

    /**
     * 
     * @param {*} frm_id 
     * @param {*} data 
     * @param {*} callback 
     */
    updateFrame(frm_id, data, callback) {
        try {
            helper.model.update('frame', data, [
                {
                    name: 'frm_id =',
                    value: frm_id
                }
            ], (err) => {
                if (err) {
                    helper.response.onError('error: updateFrame' + err, callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateFrame' + err, callback);
        }
    }
}