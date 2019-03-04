/**
 * Overlay Model
 * konstantyn
 * 2018-03-10
 */

var async = require('async');
var _ = require('underscore');
var helper = require('../helper/helper');

module.exports = {
    getOverlays(callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.overlay;', [], (err, result) => {
                if (err) {
                    helper.response.onError('error: getOverlays', callback);console
                }

                var overlays = [];
                _.each(result.rows, (row) => {
                    overlays.push({
                        ovl_id: row.ovl_id,
                        ovl_type: row.ovl_type,
                        ovl_content: row.ovl_content,
                        frm_id: row.frm_id,
                        ovl_order: row.ovl_order,
                        ovl_json: row.ovl_json,
                        ovl_reposition: JSON.parse(row.ovl_reposition)
                    });
                });

                helper.response.onSuccess(callback, overlays);
            });
        } catch (err) {
            helper.response.onError('error: getOverlays', callback);
        }
    },

    /**
     * 
     * @param {*} frm_id 
     * @param {*} callback 
     */
    getOverlaysByFrmId(frm_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.overlay where frm_id = $1 ORDER BY ovl_order ASC;', [frm_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: getOverlaysByFrmId', callback);
                    return;
                }

                var overlays = [];
                _.each(result.rows, (row) => {
                    overlays.push({
                        ovl_id: row.ovl_id,
                        ovl_type: row.ovl_type,
                        ovl_content: row.ovl_content,
                        frm_id: row.frm_id,
                        ovl_order: row.ovl_order,
                        ovl_json: helper.query.base64(row.ovl_json, 0),
                        ovl_reposition: JSON.parse(row.ovl_reposition)
                    });
                });
                
                helper.response.onSuccess(callback, overlays);
            });
        } catch (err) {
            helper.response.onError('error: getOverlaysByFrmId', callback);
        }
    },

    /**
     * 
     * @param {*} ovl_id 
     * @param {*} callback 
     */
    getOverlaysByOvlId(ovl_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.overlay where ovl_id = $1;', [ovl_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: getOverlaysByOvlId', callback);
                    return;
                }

                if (!result.rows.length) {
                    helper.response.onError('error: getOverlaysByOvlId', callback);
                    return;
                }

                helper.response.onSuccess(callback, result.rows[0]);
            });
        } catch (err) {
            helper.response.onError('error: getOverlaysByFrmId', callback);
        }
    },

    /**
     * 
     * @param {*} data 
     * @param {*} callback 
     */
    addOverlay(data, callback) {
        try {
            let query = '';
            query = 'INSERT INTO public.overlay (frm_id, ovl_reposition, ovl_order, ovl_type, ovl_content, ovl_json) VALUES($1, $2, $3, $4, $5, $6) RETURNING ovl_id, ovl_order;';

            helper.query.runQuery(query, data, (err, result) => {
                if (err) {
                    helper.response.onError('error: addOverlay' + err, callback);
                    return;
                }

                let row = result.rows[0];
                helper.response.onSuccess(callback, row);
            });
        } catch (err) {
            helper.response.onError('error: addOverlay' + err, callback);
        }
    },

    /**
     * 
     * @param {*} ovl_id 
     * @param {*} ovl_content 
     * @param {*} callback 
     */
    updateOvlContentByOvlId(ovl_id, ovl_content, callback) {
        try {
            helper.query.runQuery('UPDATE public.overlay SET ovl_content = $2 WHERE ovl_id=$1', [ovl_id, ovl_content], (err) => {
                if (err) {
                    helper.response.onError('error: updateOvlContentByOvlId', callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateOvlContentByOvlId', callback);
        }
    },

    updateOverlay(ovl_id, data, callback) {
        try {
            helper.model.update('overlay', data, [
                {
                    name: 'ovl_id =',
                    value: ovl_id
                }
            ], (err) => {
                if (err) {
                    helper.response.onError('error: updateOverlay' + err, callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateOverlay' + err, callback);
        }
    },

    /**
     * 
     * @param {*} ovl_id 
     * @param {*} ovl_content 
     * @param {*} ovl_json 
     * @param {*} callback 
     */
    updateOverlayByOvlId(ovl_id, ovl_content, ovl_json, callback) {
        try {
            helper.query.runQuery('UPDATE public.overlay SET ovl_content = $2, ovl_json = $3 WHERE ovl_id = $1;', [ovl_id, ovl_content, ovl_json], (err) => {
                if (err) {
                    helper.response.onError('error: updateOverlayByOvlId', callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateOverlayByOvlId', callback);
        }
    },

    /**
     * 
     * @param {*} frm_id 
     * @param {*} ovl_order 
     * @param {*} callback 
     */
    forwardOrder(frm_id, ovl_order, callback) {
        try {
            helper.query.runQuery('SELECT ovl_id, ovl_order FROM public.overlay WHERE frm_id = $1 AND ovl_order > $2', [frm_id, ovl_order], (err, result) => {
                if (err) {
                    helper.response.onError('error: forwardOrder', callback);
                    return;
                }

                var parallelTasks = [];

                _.each(result.rows, (row) => {
                    parallelTasks.push((parallel_callback) => {
                        helper.query.runQuery('UPDATE public.overlay SET ovl_order = $1 WHERE ovl_id = $2', [row.ovl_order - 1, row.ovl_id], (_err) => {
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
     * @param {*} ovl_id 
     * @param {*} callback 
     */
    deleteOverlayByOvlId(ovl_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.overlay WHERE ovl_id = $1', [ovl_id], (err) => {
                if (err) {
                    helper.response.onError('error: deleteOverlayByOvlId', callback);
                    return;
                }

                helper.query.runQuery('DELETE FROM public.overlay WHERE ovl_id = $1 RETURNING frm_id, ovl_order', [ovl_id], (_err, _result) => {
                    if (_err || _result.rows.length == 0) {
                        helper.response.onError('error: deleteOverlayByOvlId', callback);
                        return;
                    }

                    helper.response.onSuccess(callback, { frm_id: _result.rows[0].frm_id, ovl_order: _result.rows[0].ovl_order });
                });
            });
        } catch (err) {
            helper.response.onError('error: deleteOverlayByOvlId', callback);
        }
    },

    /**
     * 
     * @param {*} frm_id 
     * @param {*} callback 
     */
    deleteOverlayByFrmId(frm_id, callback) {
        try {
            helper.query.runQuery('DELETE FROM public.overlay WHERE frm_id = $1', [frm_id], (_err) => {
                if (_err) {
                    helper.response.onError('error: deleteOverlayByFrmId', callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteOverlayByFrmId', callback);
        }
    },

    /**
     * 
     * @param {*} frm_id 
     * @param {*} ovl_order 
     * @param {*} callback 
     */
    forwardOrder(frm_id, ovl_order, callback) {
        try {
            helper.query.runQuery('SELECT ovl_id, ovl_order FROM public.overlay WHERE frm_id = $1 AND ovl_order > $2', [frm_id, ovl_order], (err, result) => {
                if (err) {
                    helper.response.onError('error: forwardOrder', callback);
                    return;
                }

                var parallelTasks = [];

                _.each(result.rows, (row) => {
                    parallelTasks.push((parallel_callback) => {
                        helper.query.runQuery('UPDATE public.overlay SET ovl_order = $1 WHERE ovl_id = $2', [row.ovl_order - 1, row.ovl_id], (_err) => {
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
     * @param {*} frm_id 
     * @param {*} ovl_order 
     * @param {*} callback 
     */
    backwardOrder(frm_id, ovl_order, callback) {
        try {
            helper.query.runQuery('SELECT ovl_id, ovl_order FROM public.overlay WHERE frm_id = $1 AND ovl_order > $2', [frm_id, ovl_order], (err, result) => {
                if (err) {
                    helper.response.onError('error: backwardOrder', callback);
                    return;
                }

                var parallelTasks = [];

                _.each(result.rows, (row) => {
                    parallelTasks.push(function (parallel_callback) {
                        helper.query.runQuery('UPDATE public.overlay SET ovl_order = $1 WHERE ovl_id = $2', [row.ovl_order + 1, row.ovl_id], (_err) => {
                            parallel_callback(_err);
                        });
                    });
                });

                async.parallel(parallelTasks, (_err) => {
                    if (_err) {
                        helper.response.onError('error: backwardOrder', callback);
                        return;
                    }

                    helper.response.onSuccess(callback);
                });
            });
        } catch (err) {
            helper.response.onError('error: backwardOrder', callback);
        }
    },
}