/**
 * Response Helper
 * konstantyn
 * 2018-03-10
 */

module.exports = {
    /**
     * 
     * @param {*} obj1 
     * @param {*} obj2 
     */
    mergeJson(obj1, obj2) {
        var result = {};
        for (var key in obj1) result[key] = obj1[key];
        for (var key in obj2) result[key] = obj2[key];
        return result;
    },
    
    /**
     * 
     * @param {*} err 
     */
    makeErrorResult(err) {
        var response = {
            success: false,
            'msg': '' + err
        };

        return response;
    }, 

    /**
     * 
     * @param {*} err 
     */
    _makeErrorResult(result = '') {
        var response = {
            success: false
        };

        if (result) {
            response = this.mergeJson(response, result);
        }

        return response;
    }, 

    /**
     * 
     * @param {*} result 
     */
    makeSuccessResult(result = '') {
        var response = {
            success: true
        };

        if (result) {
            response = this.mergeJson(response, result);
        }

        return response;
    },

    /**
     * 
     * @param {*} err 
     * @param {*} callback 
     */
    onError(err, callback) {
        if (callback != null) {
            callback(err, this.makeErrorResult(err));
        }
    }, 

    /**
     * 
     * @param {*} callback 
     * @param {*} result 
     */
    onSuccessPlus(callback, result = '') {
        if (callback != null) {
            callback(null, this.makeSuccessResult(result));
        }
    }, 

    /**
     * 
     * @param {*} callback 
     * @param {*} result 
     */
    onErrorPlus(callback, err, result = '') {
        if (callback != null) {
            callback(err, this._makeErrorResult(result));
        }
    }, 

    /**
     * 
     * @param {*} callback 
     * @param {*} result 
     */
    onSuccess(callback, result = '') {
        if (callback != null) {
            callback(null, result);
        }
    }
}