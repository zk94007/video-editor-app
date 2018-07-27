/**
 * Model Helper
 * konstantyn
 * 2018-03-10
 */
var _ = require('underscore');

var logHelper = require('./log.helper');
var responseHelper = require('./response.helper');
var queryHelper = require('./query.helper');

module.exports = {
    /**
     * 
     * @param {*} tableName 
     * @param {*} data 
     * @param {*} where 
     * @param {*} callback 
     */
    update(tableName, data, where, callback) {
        try {
            if (!tableName || !data || !where) {
                responseHelper.onError('error: update table', callback);
                return;
            }
	    

	    var setp ='';
            var loop = 0;
            var names = '';
            var values = ''
            _.each(data, (element) => {
                names=(element.name);
                values=("'" + element.value + "'");
                loop++;
		if(data.length == loop) {
                setp = setp + ' ' + names + '=' + values; 
                } else {
		setp = setp + ' ' + names + '=' + values + ',';
		}
            });

            let whereclause = [];
            _.each(where, (element) => {
                whereclause.push(element.name + " '" + element.value + "'");
            });

            let query = 'UPDATE public.' + tableName + ' SET ' + setp + ' WHERE ' + whereclause.join(' AND ') + ';';

            console.log(query);
        
            queryHelper.runQuery(query, [], (err) => {
                if (err) {
                    responseHelper.onError('error: update table' + err, callback);
                    return;
                }
                responseHelper.onSuccess(callback);
            });            
        } catch(err) {
            responseHelper.onError('error: update table' + err, callback);
            return;
        }
    },
    
    /**
     * 
     * @param {*} tableName 
     * @param {*} data 
     * @param {*} get 
     * @param {*} callback 
     */
    insert(tableName, data, get, callback) {
        try {
            if (!tableName || !data) {
                responseHelper.onError('error: insert table', callback);
                return;
            }

            let names = [];
            let values = [];
            _.each(data, (element) => {
                names.push(element.name);
                
                if ((element.value + '').includes('SELECT')) {
                    values.push(element.value);
                } else if ((element.value + '').startsWith("'")) {
                    values.push(element.value);
                } else {
                    values.push("'" + element.value + "'");
                }
            });
            
            let query = 'INSERT INTO public.' + tableName + '(' + names.join(', ') + ') VALUES (' + values.join(', ') + ') ' + (get != '' ? 'RETURNING ' + get : get) + ';';
            queryHelper.runQuery(query, [], (err, row) => {
                if (err) {
                    responseHelper.onError('error: insert table', callback);
                    return;
                }
                responseHelper.onSuccess(callback, row);
            });
        } catch(err) {
            responseHelper.onError('error: insert table', callback);
            return;
        }
    },

    /**
     * 
     * @param {*} tableName 
     * @param {*} where 
     * @param {*} callback 
     */
    delete(tableName, where, callback) {
        try {
            if (!tableName || !where) {
                responseHelper.onError('error: delete table', callback);
                return;
            }

            let whereclause = [];
            _.each(where, (element) => {
                whereclause.push(element.name + " '" + element.value + "'");
            });

            let query = 'DELETE FROM public.' + tableName + ' WHERE ' + whereclause.join(' AND ') + ';';
            queryHelper.runQuery(query, [], (err) => {
                if (err) {
                    responseHelper.onError('error: delete table', callback);
                    return;
                }
                responseHelper.onSuccess(callback);
            });
        } catch(err) {
            responseHelper.onError('error: delete table', callback);
            return;
        }
    },
}
