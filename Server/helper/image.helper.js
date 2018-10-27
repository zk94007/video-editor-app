/**
 * Image Helper
 */

var uuidGen = require('node-uuid');
var fs = require('fs');
var _ = require('underscore');
var path = require('path');

var fileHelper = require('./file.helper');
var responseHelper = require('./response.helper');
var config = require('../config/config');
var shellHelper = require('./shell.helper');

module.exports = {
    /**
     * 
     * @param {*} position 
     * @param {*} orientation 
     * @param {*} angle 
     */
    rotatePosition(position, orientation, angle) {
        angle = angle * Math.PI / 180;

        let rot = {
            x: (position.x - orientation.x) * Math.cos(angle) - (position.y - orientation.y) * Math.sin(angle) + orientation.x,
            y: (position.x - orientation.x) * Math.sin(angle) + (position.y - orientation.y) * Math.cos(angle) + orientation.y,
        };

        return rot;
    },

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} width 
     * @param {*} height 
     * @param {*} angle 
     */
    rotateRectagle(x, y, width, height, angle) {
        let rotatePosition = this.rotatePosition;

        let rot = {
            x: x,
            y: y
        };

        if (angle != 0) {
            let corners = [
                {
                    x: x,
                    y: y
                },
                {
                    x: x + width,
                    y: y
                },
                {
                    x: x + width,
                    y: y + height
                },
                {
                    x: x,
                    y: y + height
                }
            ];

            let rot_corners = [];

            _.each(corners, (corner) => {
                rot_corners.push(rotatePosition(corner, {
                    x: x + width / 2,
                    y: y + height / 2
                }, angle));
            });

            _.each(corners, (corner) => {
                rot.x = _.min([rot.x, corner.x]);
                rot.y = _.min([rot.y, corner.y]);
            });
        }

        return rot;
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} width 
     * @param {*} height 
     * @param {*} callback 
     */
    resize(filepath, width, height, callback) {
        try {
            let extname = path.extname(filepath);
            let newPath = config.server.downloadPath + uuidGen.v1() + extname;
            let commandLine = 'gifsicle.exe --resize ' + width + 'x' + height + ' ' + filepath + ' -o ' + newPath;

            shellHelper.shell(commandLine, (err) => {
                if (err) {
                    responseHelper.onError('error: resize' + err, callback);
                    return;
                }

                responseHelper.onSuccess(callback, newPath);
            });
        } catch (err) {
            responseHelper.onError('error: resize' + err, callback);
        }
    },

    fixGif(filepath, callback) {
        try {
            let commandLine = 'gifsicle.exe -bl ' + filepath;

            shellHelper.shell(commandLine, (err) => {
                if (err) {
                    responseHelper.onError('error: bl' + err, callback);
                    return;
                }

                responseHelper.onSuccess(callback);
            });
        } catch(err) {
            responseHelper.onError('error: bl' + err, callback);
        }
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    explode(filepath, callback) {
        try {
            let resultName = path.basename(filepath, path.extname(filepath));
            commandLine = 'gifsicle.exe --explode -i --unoptimize ' + filepath + ' -o ' + config.server.downloadPath + resultName;

            shellHelper.shell(commandLine, (err) => {
                if (err) {
                    responseHelper.onError('error: explode' + err, callback);
                    return;
                }

                fs.readdir(config.server.downloadPath, (_err, files) => {
                    if (_err) {
                        responseHelper.onError('error: convertGif2Sprite' + _err, callback);
                        return;
                    }

                    let explodeFiles = [], index = 0;
                    _.each(files, (file) => {
                        if (file.includes(resultName) && file !== path.basename(filepath)) {
                            explodeFiles.push(config.server.downloadPath + file);
                        }
                    });

                    explodeFiles.sort();

                    responseHelper.onSuccess(callback, explodeFiles);
                });
            });
        } catch (err) {
            responseHelper.onError('error: explode' + err, callback);
        }
    },

    /**
     * 
     * @param {*} explodeFiles 
     * @param {*} filepath 
     * @param {*} callback 
     */
    implode(explodeFiles, filepath, callback) {
        try {
            let commandLine = 'magick convert +append ';
            _.each(explodeFiles, (file) => {
                commandLine += file + ' ';
            });

            commandLine += filepath;

            shellHelper.shell(commandLine, (err) => {
                if (err) {
                    responseHelper.onError('error: implode' + err, callback);
                    return;
                }

                responseHelper.onSuccess(callback);
            });
        } catch (err) {
            responseHelper.onError('error: implode' + err, callback);
        }
    },

    getNumber(str) {
        var number = '';
        for (let i = 0; i< str.length; i++) {
            if (str[i] == ' ' && number == '') continue;
            else if (str[i] >= '0' && str[i] <= '9') number = number + str[i];
            else if (str[i] == '.') number = number + str[i];
            else break;
        }
        var delay = parseFloat(number) ? parseFloat(number) : 0;
        delay *= 1000;
        return delay;
    },

    gifInfo(filepath, callback) {
        try {
            let commandLine = 'gifsicle.exe ' + filepath + ' --info';

            shellHelper.shell(commandLine, (err, result) => {
                if (err) {
                    responseHelper.onError('error: gifInfo' + err, callback);
                    return;
                }

                let delays = [];
                let index = result.indexOf('delay');
                while (index != -1) {
                    result = result.slice(index + 5);
                    delays.push(this.getNumber(result));
                    index = result.indexOf('delay');
                }

                responseHelper.onSuccess(callback, {delays: delays});
            });
        } catch (err) {
            responseHelper.onError('error: gifInfo' + err, callback);
        }
    },

    /**
     * 
     * @param {*} filepath 
     * @param {*} callback 
     */
    convertGif2Sprite(filepath, callback) {
        try {
            let resultName = path.basename(filepath, path.extname(filepath));
            let resultPath = config.server.downloadPath + resultName + '.png';

            this.resize(filepath, 160, 160, (err, newPath) => {
                if (err) {
                    responseHelper.onError('error: converGif2Sprite' + err, callback);
                    return;
                }

                this.explode(newPath, (_err, explodeFiles) => {
                    if (_err) {
                        responseHelper.onError('error: converGif2Sprite' + _err, callback);
                        return;
                    }

                    this.implode(explodeFiles, resultPath, (__err) => {
                        if (__err) {
                            responseHelper.onError('error: converGif2Sprite' + __err, callback);
                            return;
                        }

                        explodeFiles.push(newPath);
                        explodeFiles.push(resultPath);

                        this.gifInfo(filepath, (___err, delays) => {
                            if (___err) {
                                responseHelper.onError('error: converGif2Sprite' + ___err, callback);
                                return;
                            }

                            responseHelper.onSuccess(callback, { spritepath: resultPath, deleteFiles: explodeFiles, delays: delays});
                        });
                    });
                });
            });
        } catch (err) {
            responseHelper.onError('error: convertGif2Sprite' + err, callback);
        }
    },
}