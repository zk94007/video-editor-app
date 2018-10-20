/**
 * User back-end service
 * konstantyn
 * 2018-03-10
 */

var async = require('async');
var uuidGen = require('node-uuid');

var helper = require('../helper/helper');

var userModel = require('../model/user.model');
var userAuthEmail = require('../model/user-auth-email.model');

module.exports = {
    /**
     * 
     * @param {*} message 
     * @param {*} callback 
     */
    signin(message, callback) {
        try {
            let usr_email = message.usr_email;
            let usr_password = message.usr_password;

            let notFilledFields = [];
            !usr_email ? notFilledFields.push('usr_email') : '';
            !usr_password ? notFilledFields.push('usr_password') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fields are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.isEmailExist(usr_email, (err, isExist) => {
                if (err || !isExist) {
                    helper.response.onError('Not a valid email address', callback);
                    return;
                }

                userModel.getUserByEmail(usr_email, (_err, user) => {
                    if (_err) {
                        helper.response.onError('Not a valid email address', callback);
                        return;
                    }
                    
                    if (!user.usr_is_allowed) {
                        helper.response.onError('You are not allowed, please contact administrator', callback);
                        return;
                    }

                    if (user.usr_password != usr_password) {
                        helper.response.onError('Incorrect password, please re-type the password', callback);
                        return;
                    }

                    userModel.updateLastLoginDateByUsrId(user.usr_id, (__err, __result) => {
                        if (__err) {
                            helper.response.onError('Can not update your login date', callback);
                            return;
                        }

                        if (user.usr_is_verified) {
                            helper.response.onSuccessPlus(callback, {
                                'user': user,
                                'usr_is_verified': user.usr_is_verified,
                                'usr_is_get_started': user.usr_is_get_started,
                                'token': helper.token.getToken(user),
                            });
                        } else {
                            helper.response.onSuccessPlus(callback, {
                                'usr_is_verified': user.usr_is_verified,
                            });
                        }
                    });
                });
            });
        } catch(err) {
            helper.response.onError('error: signin' + err, callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    updateUser(userInfo, message, callback) {
        try {
            let data = message.data;

            let notFilledFields = [];
            !data ? notFilledFields.push('data') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.updateUserByUsrId(userInfo.usr_id, data, (err) => {
                if (err) {
                    helper.response.onError('error: updateUser', callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateUser', callback);
        }
    },

    getUserInformation(userInfo, message, callback) {
        try {
            userModel.getUserByEmail(userInfo.usr_email, (err, user) => {
                if (err) {
                    helper.response.onError('error: getUserInformation', callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {token: helper.token.getToken(user), user: user});
            });
        } catch (err) {
            helper.response.onError('error: getUserInformation', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    inviteAdmin(userInfo, message, callback) {
        try {
            let usr_id = message.usr_id;
            let front_path = message.front_path;

            let notFilledFields = [];
            !usr_id ? notFilledFields.push('usr_id') : '';
            !front_path ? notFilledFields.push('front_path') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.getUserById(usr_id, (err, user) => {
                if (err) {
                    helper.response.onError('error: inviteUser', callback);
                    return;
                }

                if (!user) {
                    helper.response.onError('User does not exist.', callback);
                    return;
                }

                if (user.usr_role == 1 && user.usr_admin_status == 1) {
                    helper.response.onError('This user has already admin role.', callback);
                    return;
                }

                userModel.updateUserByUsrId(usr_id, [{name: 'usr_role', value: 1},{name: 'usr_admin_status', value: 0}], (_err) => {
                    if (_err) {
                        helper.response.onError('error: inviteUser', callback);
                        return;
                    }
    
                    let uae_code = uuidGen.v4();
                    userAuthEmail.createAdminInvitation(usr_id, uae_code, (__err) => {
                        if (__err) {
                            helper.response.onError('Can not send an admin invitation email', callback);
                            return;
                        }

                        let adminInvitationLink = front_path  + uae_code;
                        helper.email.sendAdminInvitationEmail(user.usr_email, adminInvitationLink, (___err) => {
                            if (___err) {
                                helper.response.onError('Can not send an admin invitation email', callback);
                                return;
                            }

                            helper.response.onSuccessPlus(callback, {});
                        });
                    });
                    
                    helper.response.onSuccessPlus(callback);
                });
            });           
        } catch (err) {
            helper.response.onError('error: inviteUser', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    updateUserById(userInfo, message, callback) {
        try {
            let usr_id = message.usr_id;
            let data = message.data;

            let notFilledFields = [];
            !usr_id ? notFilledFields.push('usr_id') : '';
            !data ? notFilledFields.push('data') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.updateUserByUsrId(usr_id, data, (err) => {
                if (err) {
                    helper.response.onError('error: updateUserById', callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: updateUserById', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    deleteUser(userInfo, message, callback) {
        try {
            userModel.deleteUserById(userInfo.usr_id, (err) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteUser', callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    deleteUserById(userInfo, message, callback) {
        try {
            let usr_id = message.usr_id;
            
            let notFilledFields = [];
            !usr_id ? notFilledFields.push('usr_id') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.deleteUserById(usr_id, (err) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                helper.response.onSuccessPlus(callback);
            });
        } catch (err) {
            helper.response.onError('error: deleteUserById' + err, callback);
        }
    },

    /**
     * 
     * @param {*} userInfo 
     * @param {*} message 
     * @param {*} callback 
     */
    getUsers(userInfo, message, callback) {
        try {
            let seriesTasks = [];
            var users_count;
            var today_signedup_users_count;
            var users;

            seriesTasks.push((series_callback) => {
                userModel.getUsersCount((err, _users_count) => {
                    users_count = _users_count;
                    series_callback(err);
                })
            });
            
            seriesTasks.push((series_callback) => {
                userModel.getTodaySignedupUsersCount((err, _today_signedup_users_count) => {
                    today_signedup_users_count = _today_signedup_users_count;
                    series_callback(err);
                });
            });

            seriesTasks.push((series_callback) => {
                userModel.getUsers((err, _users) => {
                    users = _users;
                    series_callback(err);
                });
            });

            async.series(seriesTasks, (err) => {
                if (err) {
                    helper.response.onError('error: getUsers', callback);
                    return;
                }

                helper.response.onSuccessPlus(callback, {
                    users_count: users_count,
                    today_signedup_users_count: today_signedup_users_count,
                    users: users
                });
            });
        } catch (err) {
            helper.response.onError('error: getUsers', callback);
        }
    },

    /**
     * 
     * @param {*} message 
     * @param {*} profilePath 
     * @param {*} callback 
     */
    updateUserProfile(message, profilePath, callback) {
        try {
            let usr_email = message.usr_email;
            
            let notFilledFields = [];
            !usr_email ? notFilledFields.push('usr_email') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fileds are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.getUserByEmail(usr_email, (err, user) => {
                if (err) {
                    helper.response.onError(err, callback);
                    return;
                }

                let data = [
                    {
                        name: 'usr_profile_path',
                        value: profilePath
                    }
                ];
                userModel.updateUserByUsrId(user.usr_id, data, (_err) => {
                    if (_err) {
                        helper.response.onError(_err, callback);
                        return;
                    }

                    helper.response.onSuccessPlus(callback, {usr_profile_path: profilePath});
                });
            });
        } catch (err) {
            helper.response.onError('error: updateUserProfile', callback);
        }
    },

    /**
     * 
     * @param {*} message 
     * @param {*} callback 
     */
    signup(message, callback) {
        try {
            let usr_email = message.usr_email;
            let usr_name = message.usr_name;
            let usr_password = message.usr_password;
            let usr_company = message.usr_company;
            let front_path = message.front_path;

            let notFilledFields = [];
            !usr_email ? notFilledFields.push('usr_email') : '';
            !usr_name ? notFilledFields.push('usr_name') : '';
            !usr_password ? notFilledFields.push('usr_password') : '';
            !front_path ? notFilledFields.push('frontPath') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fields are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            let data = {
                usr_email: usr_email,
                usr_password: usr_password,
                usr_name: usr_name,
                usr_company: usr_company
            };

            userModel.addUser(data, (err, result) => {
                if (err) {
                    helper.response.onError('Your email address already exists', callback);
                    return;
                }

                let uae_code = uuidGen.v4();
                userAuthEmail.createConfirmEmail(result.usr_id, uae_code, (_err, _result) => {
                    if (_err) {
                        helper.response.onError('Can not send a verification email', callback);
                        return;
                    }

                    let confirmLink = front_path  + uae_code;
                    helper.email.sendConfirmationEmail(usr_email, confirmLink, (__err, __result) => {
                        if (__err) {
                            helper.response.onError('Can not send a verification email', callback);
                            return;
                        }

                        helper.response.onSuccessPlus(callback, {msg: 'Please confirm email'});
                    });
                });
            });
        } catch(err) {
            helper.response.onError('error: signup' + err, callback);
        }
    },

    /**
     * 
     * @param {*} message 
     * @param {*} callback 
     */
    forgetPassword(message, callback) {
        try {
            let usr_email = message.usr_email;
            let front_path = message.front_path;

            let notFilledFields = [];
            !usr_email ? notFilledFields.push('usr_email') : '';
            !front_path ? notFilledFields.push('front_path') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fields are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.getUserByEmail(usr_email, (err, user) => {
                if (err || !user) {
                    helper.response.onError('Not a valid email: error->' + err + ' usr_email -> ' + usr_email, callback);
                    return;
                }

                let uae_code = uuidGen.v4();
                userAuthEmail.createResetPassword(user.usr_id, uae_code, (_err, _result) => {
                    if (_err) {
                        helper.response.onError('Can not send a verification email', callback);
                        return;
                    }

                    let resetLink = front_path + uae_code;
                    helper.email.sendResetPasswordEmail(usr_email, resetLink, (__err, __result) => {
                        if (__err) {
                            helper.response.onError('Can not send a verification email', callback);
                            return;
                        }
                        helper.response.onSuccessPlus(callback);
                    });
                });
            });
        } catch (err) {
            helper.response.onError('error: forgetPassword' + err, callback);
        }
    },
    
    /**
     * 
     * @param {*} message 
     * @param {*} callback 
     */
    confirmEmail(message, callback) {
        try {
            let uae_code = message.uae_code;

            var notFilledFields = [];
            !uae_code ? notFilledFields.push('uae_code') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fields are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userAuthEmail.getUserIdByConfirmCode(uae_code, (err, usr_id) => {
                if (err || !usr_id) {
                    helper.response.onError('Not a valid verification code', callback);
                    return;
                }

                userModel.getUserById(usr_id, (_err, user) => {
                    if (_err) {
                        helper.response.onError('Not a valid verification code', callback);
                        return;
                    }

                    userModel.verifyByUsrId(usr_id, (__err) => {
                        if (__err) {
                            helper.response.onError('Verification Error');
                            return;
                        }

                        helper.response.onSuccessPlus(callback, {
                            token: helper.token.getToken(user),
                            user: user
                        });
                    });
                });
            });
        } catch (err) {
            helper.log.service('user', err);
            helper.response.onError(err, callback);
        }
    },

    /**
     * 
     * @param {*} message 
     * @param {*} callback 
     */
    confirmAdmin(message, callback) {
        try {
            let uae_code = message.uae_code;

            var notFilledFields = [];
            !uae_code ? notFilledFields.push('uae_code') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fields are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userAuthEmail.getUserIdByConfirmAdminCode(uae_code, (err, usr_id) => {
                if (err || !usr_id) {
                    helper.response.onError('Not a valid verification code', callback);
                    return;
                }

                userModel.getUserById(usr_id, (_err, user) => {
                    if (_err) {
                        helper.response.onError('Not a valid verification code', callback);
                        return;
                    }

                    userModel.updateUserByUsrId(usr_id, [{name: 'usr_admin_status', value: 1}], (__err) => {
                        if (__err) {
                            helper.response.onError('Confirmation Error');
                            return;
                        }

                        helper.response.onSuccessPlus(callback, {});
                    });
                });
            });
        } catch (err) {
            helper.log.service('user', err);
            helper.response.onError(err, callback);
        }
    },

    /**
     * 
     * @param {*} message 
     * @param {*} callback 
     */
    resetPassword(message, callback) {
        try {
            let usr_password = message.usr_password;
            let uae_code  = message.uae_code;
            
            var notFilledFields = [];
            !usr_password ? notFilledFields.push('usr_password') : '';
            !uae_code ? notFilledFields.push('uae_code') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fields are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userAuthEmail.getUserIdByResetCode(uae_code, (err, usr_id) => {
                if (err || !usr_id) {
                    helper.response.onError(err, callback);
                    return;
                }

                userModel.updatePasswordByUsrId(usr_id, usr_password, (_err) => {
                    if (_err) {
                        helper.response.onError('Not a valid password', callback);
                        return;
                    }

                    userAuthEmail.deleteByUsrIdAndUaeType(usr_id, 2, (__err) => {
                        if (__err) {
                            helper.response.onError('Error appeared in server', callback);
                            return;
                        }

                        helper.response.onSuccessPlus(callback);
                    })
                });
            });
        } catch(err) {
            helper.response.onError('error: resetPassword', callback);
        }
    },

    /**
     * 
     * @param {*} message 
     * @param {*} callback 
     */
    resendConfirmEmail(message, callback) {
        try {
            let usr_email = message.usr_email;
            let front_path = message.front_path;

            let notFilledFields = [];
            !usr_email ? notFilledFields.push('usr_email') : '';
            !front_path ? notFilledFields.push('front_path') : '';

            if (notFilledFields.length > 0) {
                helper.response.onError('Required fields are not filled: ' + notFilledFields.toString(), callback);
                return;
            }

            userModel.getUserByEmail(usr_email, (err, user) => {
                if (err || !user) {
                    helper.response.onError('Not a valid email', callback);
                    return;
                }

                let uae_code = uuidGen.v4();
                userAuthEmail.createConfirmEmail(user.usr_id, uae_code, (_err, _result) => {
                    if (_err) {
                        helper.response.onError('Can not send a verification email', callback);
                        return;
                    }

                    let confirmLink = front_path  + uae_code;
                    helper.email.sendConfirmationEmail(usr_email, confirmLink, (__err, __result) => {
                        if (__err) {
                            helper.response.onError('Can not send a verification email', callback);
                            return;
                        }

                        helper.response.onSuccessPlus(callback, {msg: 'Please confirm email'});
                    });
                });
            });
        } catch (err) {
            helper.response.onError('error: resendConfirmEmail' + err, callback);
        }
    },
}
