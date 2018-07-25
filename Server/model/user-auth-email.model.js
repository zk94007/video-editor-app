/**
 * user_auth_email Model
 * konstantyn
 * 2018-03-10
 */

var _ = require('underscore');

var helper = require('../helper/helper');

module.exports = {
    /**
     * 
     * @param {*} usr_id 
     * @param {*} uae_code 
     * @param {*} callback 
     */
    createConfirmEmail(usr_id, uae_code, callback) {
        try {
            helper.query.runQuery('DELETE FROM public.user_auth_email WHERE usr_id = $1 AND uae_type = 1', [usr_id], (err) => {
                if (err) {
                    helper.response.onError('error: createConfirmEmail', callback);
                    return;
                }
                helper.query.runQuery('INSERT INTO public.user_auth_email (usr_id, uae_code, uae_type) ' + 'VALUES ($1, $2, 1)', [usr_id, uae_code], (_err) => {
                    if (_err) {
                        helper.response.onError('error: createConfirmEmail', callback);
                        return;
                    }
                    
                    helper.response.onSuccess(callback);
                });
            });
        } catch(err) {
            helper.response.onError('error: createConfirmEmail', callback);
        }
    },

    /**
     * 
     * @param {*} usr_id 
     * @param {*} uae_code 
     * @param {*} callback 
     */
    createResetPassword(usr_id, uae_code, callback) {
        try {
            helper.model.delete('user_auth_email', [{
                name: 'usr_id =',
                value: usr_id
            }, {
                name: 'uae_type =',
                value: 2
            }], (err) => {
                helper.model.insert('user_auth_email', [{
                    name: 'usr_id',
                    value: usr_id,
                }, {
                    name: 'uae_code',
                    value: uae_code,
                }, {
                    name: 'uae_type',
                    value: 2
                }], '', (_err) => {
                    if (_err) {
                        helper.response.onError('error: createResetPassword', callback);
                        return;
                    }

                    helper.response.onSuccess(callback);
                }); 
            });
        } catch (err) {
            helper.response.onError('error: createResetPassword', callback);
        }
    },
    
    /**
     * 
     * @param {*} usr_id 
     * @param {*} uae_code 
     * @param {*} callback 
     */
    getConfirmEmailByUsrIdAndUaeCode(usr_id, uae_code, callback) {
        try {
            helper.query.runQuery('SELECT COUNT(*) FROM public.user_auth_email WHERE usr_id = $1 AND uae_code = $2 AND uae_type = 1;', [usr_id, uae_code], (err, result) => {
                if (err) {
                    helper.response.onError('error: getConfirmEmailByUsrIdAndUaeCode', callback);
                    return;
                }
                
                helper.response.onSuccess(callback, result.rows[0]);
            });
        } catch (err) {
            helper.response.onError('error: getConfirmEmailByUsrIdAndUaeCode', callback);
        }
    },

    /**
     * 
     * @param {*} uae_code 
     * @param {*} callback 
     */
    getUserIdByConfirmCode(uae_code, callback) {
        try {
            helper.query.runQuery('SELECT usr_id from public.user_auth_email where uae_code = $1 AND uae_type = 1', [uae_code], (err, result) => {
                if (err) {
                    helper.response.onError('error: getUserIdByConfirmCode', callback);
                    return;
                }

                let row = result.rows[0];
                if (!row) {
                    helper.response.onError('error: getUserIdByConfirmCode', callback);
                    return;
                }

                helper.response.onSuccess(callback, result.rows[0].usr_id);
            });
        } catch (err) {
            helper.response.onError('error: getUserIdByConfirmCode', callback);
        }
    },

    /**
     * 
     * @param {*} uae_code 
     * @param {*} callback 
     */
    getUserIdByResetCode(uae_code, callback) {
        try {
            helper.query.runQuery('SELECT usr_id from public.user_auth_email where uae_code = $1 AND uae_type = 2', [uae_code], (err, result) => {
                if (err) {
                    helper.response.onError('error: getUserIdByResetCode', callback);
                    return;
                }

                let row = result.rows[0];
                if (!row) {
                    helper.response.onError('error: getUserIdByResetCode', callback);
                    return;
                }

                helper.response.onSuccess(callback, result.rows[0].usr_id);
            });
        } catch(err) {
            helper.response.onError('error: getUserIdByResetCode', callback);
        }
    },

    /**
     * 
     * @param {*} usr_id 
     * @param {*} uae_type 
     * @param {*} callback 
     */
    deleteByUsrIdAndUaeType(usr_id, uae_type, callback) {
        try {
            helper.model.delete('user_auth_email', [
                {
                    name: 'usr_id =',
                    value: usr_id,
                }, {
                    name: 'uae_type =',
                    value: uae_type
                }
            ], (err) => {
                if (err) {
                    helper.response.onError('error: deleteByUsrIdAndUaeType', callback);
                    return;
                }

                helper.response.onSuccess(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteByUsrIdAndUaeType', callback);
        }
    },
}