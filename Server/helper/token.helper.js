/**
 * Token Helper
 * konstantyn
 * 2018-03-10
 */

var tokenConfig = require('../config/token.config');
var jwt = require('jsonwebtoken');
var logHelper = require('./log.helper');

module.exports = {
    /**
     * 
     * @param {*} user 
     */
    getToken(user) {
        try {
            return jwt.sign(JSON.parse(JSON.stringify(user)), tokenConfig.tokenKey);
        } catch(err) {
        }
    },

    /**
     * 
     * @param {*} token 
     * @param {*} callback 
     */
    checkToken(token, callback) {
        try {
            jwt.verify(token, tokenConfig.tokenKey, callback);
        } catch(err) {
            callback('error: checkToken');
        }
    }
}