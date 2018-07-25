/**
 * Log Helper
 */

/**
 * 
 */
const SYSTEM_LOG                        =   '[system log] >>> ';

/**
 * 
 */
const SYSTEM_LOG_LEVEL                  =   1;
const SERVICE_LOG_LEVEL                 =   2;
const MODEL_LOG_LEVEL                   =   3;
const HELPER_LOG_LEVEL                  =   4;

/**
 * 
 */
var serverConfig = require('../config/server.config');

module.exports = {
    /**
     * 
     * @param {*} message 
     */
    system(message) {
        if (serverConfig.logLevel >= SYSTEM_LOG_LEVEL)
            console.log(SYSTEM_LOG + message);
    },

    /**
     * 
     * @param {*} serviceName 
     * @param {*} message 
     */
    service(serviceName, message) {
        if (serverConfig.logLevel >= SERVICE_LOG_LEVEL)
            console.log('[' + serviceName + ' service logger] > ' + message);
    },

    /**
     * 
     * @param {*} modelName 
     * @param {*} message 
     */
    model(modelName, message) {
        if (serverConfig.logLevel >= MODEL_LOG_LEVEL)
            console.log('[' + modelName + ' model logger] > ' + message);
    },

    /**
     * 
     * @param {*} helperName 
     * @param {*} message 
     */
    helper(helperName, message) {
        if (serverConfig.logLevel >= HELPER_LOG_LEVEL)
            console.log('[' + helperName + ' helper logger] > ' + message);
    },
}