/**
 * Music Model
 * konstantyn
 * 2019-03-21
 */

var async = require('async');
var _ = require('underscore');
var helper = require('../helper/helper');

module.exports = {
    getMusics(callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.music;', [], (err, result) => {
                if (err) {
                    helper.response.onError('error: getMusics', callback);console
                }

                var musics = [];
                _.each(result.rows, (row) => {
                    musics.push(row);
                });

                helper.response.onSuccess(callback, musics);
            });
        } catch (err) {
            helper.response.onError('error: getMusics', callback);
        }
    },

    getMusicByMusId(mus_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.music where mus_id = $1;', [mus_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: getMusicFromMusId', callback);
                    return;
                }

                if (!result.rows.length) {
                    helper.response.onError('error: getMusicFromMusId', callback);
                    return;
                }

                helper.response.onSuccess(callback, result.rows[0]);
            });
        } catch (err) {
            helper.response.onError('error: getMusicFromMusId', callback);
        }
    },

    getMusicsByPrjId(prj_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.music where prj_id = $1;', [prj_id], function (err, result) {
                if (err) {
                    helper.response.onError('error: getMusicsByPrjId' + err, callback);
                    return;
                }

                let musics = [];
                _.each(result.rows, (row) => {
                    musics.push(row);
                });

                helper.response.onSuccess(callback, musics);
            });
        } catch (err) {
            helper.response.onError('error: getMusicsByPrjId' + err, callback);
        }
    },

    /**
     * 
     * @param {*} data 
     * @param {*} callback 
     */
    addMusic(data, callback) {
        try {
            let query = '';
            query = 'INSERT INTO public.music (prj_id, mus_path, mus_name, mus_duration, mus_type) VALUES($1, $2, $3, $4, $5) RETURNING mus_id;';

            helper.query.runQuery(query, data, (err, result) => {
                if (err) {
                    helper.response.onError('error: addMusic' + err, callback);
                    return;
                }

                let row = result.rows[0];
                helper.response.onSuccess(callback, row);
            });
        } catch (err) {
            helper.response.onError('error: addMusic' + err, callback);
        }
    },

    deleteMusicByMusId(mus_id, callback) {
        try {
            helper.query.runQuery('DELETE FROM public.music WHERE mus_id = $1 RETURNING mus_id', [mus_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: deleteMusicByMusId' + err, callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteMusicByMusId' + err, callback);
        }
    },
}