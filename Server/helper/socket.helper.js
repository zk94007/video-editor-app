/**
 * Socket Helper
 * konstantyn
 * 2018-03-10
 */


var logHelper = require('./log.helper');
var responseHelper = require('./response.helper');
var tokenHelper = require('./token.helper');

module.exports = {
    /**
     * 
     * @param {*} socket 
     * @param {*} method 
     * @param {*} message 
     * @param {*} callback 
     */
    validateMessage(socket, method, message, callback) {
        if (message == null) {
            responseHelper.onError('error: validateMessage', (err, result) => {
                socket.emit(method + '_RESPONSE', result);
            });
            return;
        }

        responseHelper.onSuccess(callback);
    },

    /**
     * 
     * @param {*} socket 
     * @param {*} method 
     * @param {*} message 
     * @param {*} callback 
     */
    authenticateMessage(socket, method, message, callback) {
        this.validateMessage(socket, method, message, () => {
            var token = message.token;
            
            tokenHelper.checkToken(token, (err, result) => {
                if (err) {
                    responseHelper.onError('error: authenticateMessage', (_err, _result) => {
                        socket.emit(method + '_RESPONSE', _result);
                    });
                    return;
                }

                responseHelper.onSuccess(callback, result);
            });
        });
    },
}