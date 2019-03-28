/**
 * Project Model
 * konstantyn
 * 2018-03-10
 */
var _ = require('underscore');
var helper = require('../helper/helper');

module.exports = {
    /**
     * 
     * @param {*} prj_id 
     * @param {*} callback 
     */
    getProjectByPrjId (prj_id, callback) {
        try {
            helper.query.runQuery('SELECT * FROM public.project WHERE prj_id = $1', [prj_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: getProjectByPrjId', callback);
                    return;
                }

                var project = result.rows[0];
                helper.response.onSuccess(callback, project);
            });
        } catch (err) {
            helper.response.onError('error: getProjectByPrjId', callback);
        }
    },

    /**
     * 
     * @param {*} usr_id 
     * @param {*} callback 
     */
    getProjectListByUsrId(usr_id, callback) {
        try {
            helper.query.runQuery('SELECT DISTINCT ON(t.prj_id) t.*, f.frm_path, f.frm_resolution FROM (SELECT project.prj_id, project.prj_name, COUNT(frame.frm_id) as prj_frame_count, prj_created_at FROM public.project AS project LEFT JOIN public.frame as frame ON project.prj_id = frame.prj_id WHERE project.usr_id = $1 GROUP BY project.prj_id) AS t LEFT JOIN public.frame AS f ON f.prj_id = t.prj_id AND f.frm_order = (SELECT MIN(frm_order) FROM frame WHERE frame.prj_id = t.prj_id) ORDER BY t.prj_id, f.frm_id ASC;', [usr_id], (err, result) => {
                if (err) {
                    helper.response.onError('error: getProjectListByUsrId', callback);
                    return;
                }

                var projects = [];
                _.each(result.rows, (row) => {
                    var project = {
                        prj_id: row.prj_id,
                        prj_name: row.prj_name,
                        prj_frame_count: row.prj_frame_count,
                        prj_created_at: row.prj_created_at,
                        prj_video_path: row.prj_video_path,
                        prj_representative: row.frm_path,
                        prj_type: row.prj_type != 2 ? 1 : 2
                    };
                    projects.push(project);
                });

                helper.response.onSuccess(callback, projects);
            });
        } catch (err) {
            helper.response.onError('error: getProjectListByUsrId', callback);
        }
    },

    /**
     * 
     * @param {*} usr_id 
     * @param {*} prj_name 
     * @param {*} callback 
     */
    createProject(usr_id, prj_name, prj_type, callback) {
        try {
            helper.model.insert('project', [
                {
                    name: 'usr_id',
                    value: usr_id
                }, {
                    name: 'prj_name',
                    value: prj_name
                }, {
                    name: 'prj_scene_ratio',
                    value: '169'
                }, {
                    name: 'prj_type',
                    value: prj_type
                }
            ], 'prj_id', (err, result) => {
                if (err) {
                    helper.response.onError('error: createProject', callback);
                    return;
                }

                helper.response.onSuccess(callback, result.rows[0].prj_id);
            });
        } catch (err) {
            helper.response.onError('error: createProject', callback);
        }
    },

    /**
     * 
     * @param {*} usr_id 
     * @param {*} prj_name 
     * @param {*} callback 
     */
    isProjectExist(usr_id, prj_name, callback) {
        try {
            helper.query.runQuery('SELECT COUNT(*) FROM public.project where project.usr_id = $1 AND project.prj_name = $2', [usr_id, prj_name], (err, result) => {
                if (err) {
                    helper.response.onError('error: isProjectExist', callback);
                    return;
                }

                let count = result.rows[0].count;
                helper.response.onSuccess(callback, count != 0);
            });
        } catch (err) {
            helper.response.onError('error: isProjectExist', callback);
        }
    },
    
    /**
     * 
     * @param {*} prj_id 
     * @param {*} callback 
     */
    deleteProject(prj_id, callback) {
        try {
            helper.model.delete('project', [
                {
                    name: 'prj_id =',
                    value: prj_id
                }
            ], (err) => {
                if (err) {
                    helper.response.onError('error: deleteProject', callback);
                    return;
                }

                helper.response.onSuccess(callback);
            })
        } catch (err) {
            helper.response.onError('error: deleteProject', callback);
        }
    },

    /**
     * 
     * @param {*} prj_id 
     * @param {*} data 
     * @param {*} callback 
     */
    updateProject(prj_id, data, callback) {
        try {
            helper.model.update('project', data, [
                {
                    name: 'prj_id =',
                    value: prj_id
                }
            ], (err) => {
                if (err) {
                    helper.response.onError('error: updateProject', callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateProject', callback);
        }
    }
}