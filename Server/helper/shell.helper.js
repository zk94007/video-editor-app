var shell = require('shelljs');
var fs = require('fs');
var _ = require('underscore');

var responseHelper = require('./response.helper');
var logHelper = require('./log.helper');

module.exports = {
    /**
     * 
     * @param {*} commandLine 
     * @param {*} callback 
     */
    shell(commandLine, callback) {
        if (commandLine === undefined || commandLine === null || commandLine === '') {
            responseHelper.onError('error: shell', callback);
            return;
        }

        shell.exec(commandLine, (code, stdout) => {
            if (code !== 0) {
                responseHelper.onError('error: shell' + code, callback);
                return;
            }
			responseHelper.onSuccess(callback, stdout);
        });
    }    
}