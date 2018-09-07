/** 
 * Server (back-end)
 * Konstantyn Valentinov (http://github.com/legendary614)
 * 2018-03-05
*/

var ss = require('socket.io-stream');
var uuidGen = require('node-uuid');

/** 
 * Load Constant, Config, Helper, Service
*/
var constant = require('./constant/constant');
var config = require('./config/config');
var helper = require('./helper/helper');
var service = require('./service/service.js');

/**
 * Create Socket Server
 */

var io = require('socket.io')(config.server.port);
helper.log.system('socket server started at Port:' + config.server.port);

io.on('connection', function(socket) {
    helper.log.system('client connected');
    
    socket.on(constant.method.signin, function (message) {
        helper.log.system('received signin message: ' + JSON.stringify(message));
        helper.socket.validateMessage(socket, constant.method.signin, message, function() {
            service.user.signin(message, function(err, result) {
                socket.emit(constant.method.signin + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.signup, function (message) {
        helper.log.system('received signup message: ' + JSON.stringify(message));
        helper.socket.validateMessage(socket, constant.method.singup, message, function() {
            service.user.signup(message, function(err, result) {
                socket.emit(constant.method.signup + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.confirmEmail, function (message) {
        helper.log.system('received confirm email message: ' + JSON.stringify(message));
        helper.socket.validateMessage(socket, constant.method.confirmEmail, message, function() {
            service.user.confirmEmail(message, function (err, result) {
                socket.emit(constant.method.confirmEmail + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.forgetPassword, function (message) {
        helper.log.system('received forget password email message: ' + JSON.stringify(message));
        helper.socket.validateMessage(socket, constant.method.forgetPassword, message, function () {
            service.user.forgetPassword(message, function(err, result) {
                socket.emit(constant.method.forgetPassword + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.resetPassword, function (message) {
        helper.log.system('received reset password message: ' + JSON.stringify(message));
        helper.socket.validateMessage(socket, constant.method.resetPassword, message, function () {
            service.user.resetPassword(message, function (err, result) {
                socket.emit(constant.method.resetPassword + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.resendConfirmEmail, function (message) {
        helper.log.system('received resend confirm email message: ' + JSON.stringify(message));
        helper.socket.validateMessage(socket, constant.method.resendConfirmEmail, message, function () {
            service.user.resendConfirmEmail(message, function (err, result) {
                socket.emit(constant.method.resendConfirmEmail + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.updateUser, function (message) {
        helper.log.system('received update user message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.updateUser, message, function (err, userInfo) {
            service.user.updateUser(userInfo, message, function (err, result) {
                socket.emit(constant.method.updateUser + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    ss(socket).on(constant.method.updateUserProfile, function (stream, message) {
        helper.log.system('received update user profile: ' + JSON.stringify(message));
        helper.file.writeStream(stream, config.server.uploadPath, message.filename, function (err, filepath) {
            if (err) {
                const result = {};
                result.success = false;
                result.msg = err;
                result.guid = message.guid;
                socket.emit(constant.method.updateUserProfile + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            } else {
                helper.file.putMediaToCloud(filepath, (percent) => { }, (_err, metadata) => {
                    if (_err) {
                        const result = {};
                        result.success = false;
                        result.msg = _err;
                        result.guid = message.guid;
                        socket.emit(constant.method.updateUserProfile + '_RESPONSE', result);
                        helper.log.system(JSON.stringify(result));
                    } else {
                        service.user.updateUserProfile(message, metadata.cloudPath, function (__err, result) {
                            result.guid = message.guid;
                            socket.emit(constant.method.updateUserProfile + '_RESPONSE', result);
                            helper.log.system(JSON.stringify(result));
                        });
                    }
                });
            }
        });
    });

    socket.on(constant.method.getProjectList, function(message) {
        helper.log.system('received project list message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.getProjectList, message, function(err, userInfo) {
            service.project.getProjectList(userInfo, message, function(err, result) {
                socket.emit(constant.method.getProjectList + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.createProject, function (message) {
        helper.log.system('received create project message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.createProject, message, function (err, userInfo) {
            service.project.createProject(userInfo, message, function (err, result) {
                socket.emit(constant.method.createProject + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.deleteProject, function (message) {
        helper.log.system('received delete project message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.deleteProject, message, function (err, userInfo) {
            service.project.deleteProject(userInfo, message, function (err, result) {
                socket.emit(constant.method.deleteProject + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.updateProject, function (message) {
        helper.log.system('received update project message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.updateProject, message, function (err, userInfo) {
            service.project.updateProject(userInfo, message, function (err, result) {
                socket.emit(constant.method.updateProject + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.generateSasToken, function (message) {
        helper.log.system('received generate sas token message: ');
        helper.socket.authenticateMessage(socket, constant.method.generateSasToken, message, function (err, userInfo) {
            service.project.generateSasToken(userInfo, message, function(err, result) {
                socket.emit(constant.method.generateSasToken + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    ss(socket).on(constant.method.addUploadImage, function (stream, message) {
        helper.log.system('received add upload image: ' + JSON.stringify(message));
        helper.file.writeStream(stream, config.server.uploadPath, message.filename, function (err, filepath) {
            if (err) {
                const result = {};
                result.success = false;
                result.msg = err;
                result.guid = message.guid;
                socket.emit(constant.method.addUploadImage + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            } else {
                helper.file.putMediaToCloud(filepath, (percent) => { socket.emit(constant.method.uploadImageProgress, { guid: message.guid, percent: percent }); }, (_err, metadata) => {
                    if (_err) {
                        const result = {};
                        result.success = false;
                        result.msg = _err;
                        result.guid = message.guid;
                        socket.emit(constant.method.addUploadImage + '_RESPONSE', result);
                        helper.log.system(JSON.stringify(result));
                    } else {
                        service.upload_image.addUploadImage(message, metadata, function (__err, result) {
                            result.guid = message.guid;
                            socket.emit(constant.method.addUploadImage + '_RESPONSE', result);
                            helper.log.system(JSON.stringify(result));
                        });
                    }
                });
            }
        });
    });

    socket.on(constant.method.deleteUploadImage, function (message) {
        helper.log.system('received delete upload image message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.deleteUploadImage, message, function (err, userInfo) {
            service.upload_image.deleteUploadImage(userInfo, message, function (err, result) {
                socket.emit(constant.method.deleteUploadImage + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    ss(socket).on(constant.method.addFrame, function(stream, message) {
        helper.log.system('received add frame: ' + JSON.stringify(message));
        helper.file.writeStream(stream, config.server.uploadPath, message.filename, function(err, result) {
            if (err) {
                const result = {};
                result.success = false;
                result.msg = err;
                result.guid = message.guid;
                socket.emit(constant.method.addFrame + '_RESPONSE', result);
                helper.log.system('error: ' + JSON.stringify(result));
            } else {
                helper.file.putMediaToCloud(result, (percent) => {socket.emit('ADD_FRAME_PROGRESS', { guid: message.guid, percent: percent }); }, (_err, metadata) => {
                    if (_err) {
                        const result = {};
                        result.success = false;
                        result.msg = err;
                        result.guid = message.guid;
                        socket.emit(constant.method.addFrame + '_RESPONSE', result);
                        helper.log.system(_err + ' ' + JSON.stringify(result));
                    } else {
                        service.frame.addFrame(message, metadata, function (__err, result) {
                            result.guid = message.guid;
                            socket.emit(constant.method.addFrame + '_RESPONSE', result);
                            helper.log.system(JSON.stringify(result));
                        });
                    }
                });
            }
        });
    });

    socket.on(constant.method.updateFrame, function (message) {
        helper.log.system('received update frame message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.updateFrame, message, function (err, userInfo) {
            service.frame.updateFrame(userInfo, message, function (err, result) {
                socket.emit(constant.method.updateFrame + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.updateFrameOrder, function(message) {
        helper.log.system('received update frame order message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.updateFrameOrder, message, function (err, userInfo) {
            service.frame.updateFrameOrder(userInfo, message, function (err, result) {
                socket.emit(constant.method.updateFrameOrder + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.updateOverlayOrder, function (message) {
        helper.log.system('received update overlay order message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.updateOverlayOrder, message, function (err, userInfo) {
            service.overlay.updateOverlayOrder(userInfo, message, function (err, result) {
                socket.emit(constant.method.updateOverlayOrder + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.updateOverlay, function (message) {
        helper.log.system('received update overlay message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.updateOverlay, message, function (err, userInfo) {
            service.overlay.updateOverlay(userInfo, message, function (err, result) {
                socket.emit(constant.method.updateOverlay + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.deleteFrame, function (message) {
        helper.log.system('received delete frame message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.deleteFrame, message, function (err, userInfo) {
            service.frame.deleteFrame(userInfo, message, function (err, result) {
                socket.emit(constant.method.deleteFrame + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.duplicateFrame, function (message) {
        helper.log.system('received duplicate message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.duplicateFrame, message, function (err, userInfo) {
            service.frame.duplicateFrame(userInfo, message, function (err, result) {
                socket.emit(constant.method.duplicateFrame + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.getFrameList, function (message) {
        helper.log.system('received get frame list message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.getFrameList, message, function (err, userInfo) {
            service.frame.getFrameList(userInfo, message, function (err, result) {
                socket.emit(constant.method.getFrameList + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.getFramesWithOverlay, function (message) {
        helper.log.system('received get frames with overlay message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.getFramesWithOverlay, message, function (err, userInfo) {
            service.frame.getFramesWithOverlay(userInfo, message, function (err, result) {
                socket.emit(constant.method.getFramesWithOverlay + '_RESPONSE', result);
                // helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.concatenate, function (message) {
        helper.log.system('received concatenate message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.concatenate, message, function (err, userInfo) {
            service.project.concatenate(userInfo, message, (percent, loading) => { socket.emit('CONCATENATE_PROGRESS', { loading: loading, percent: percent }); }, function (err, result) {
                socket.emit(constant.method.concatenate + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.addOverlay, function (message) {
        helper.log.system('received add overlay message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.addOverlay, message, function (err, userInfo) {
            service.overlay.addOverlay(userInfo, message, function (err, result) {
                socket.emit(constant.method.addOverlay + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.addTextOverlay, function (message) {
        helper.log.system('received add text overlay message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.addTextOverlay, message, function (err, userInfo) {
            service.overlay.addTextOverlay(userInfo, message, function (err, result) {
                socket.emit(constant.method.addTextOverlay + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.addImageOverlay, function (message) {
        helper.log.system('received add text overlay message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.addImageOverlay, message, function (err, userInfo) {
            service.overlay.addImageOverlay(userInfo, message, function (err, result) {
                socket.emit(constant.method.addImageOverlay + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.duplicateOverlay, function (message) {
        helper.log.system('received duplicate overlay message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.duplicateOverlay, message, function (err, userInfo) {
            service.overlay.duplicateOverlay(userInfo, message, function (err, result) {
                socket.emit(constant.method.duplicateOverlay + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });

    socket.on(constant.method.deleteOverlay, function (message) {
        helper.log.system('received delete overlay message: ' + JSON.stringify(message));
        helper.socket.authenticateMessage(socket, constant.method.deleteOverlay, message, function (err, userInfo) {
            service.overlay.deleteOverlay(userInfo, message, function (err, result) {
                socket.emit(constant.method.deleteOverlay + '_RESPONSE', result);
                helper.log.system(JSON.stringify(result));
            });
        });
    });
});