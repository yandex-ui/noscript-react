var ns = require('./ns');
var utils = require('./ns.utils');

/**
 * Creates and executes ajax request (a POST request with json return data type by default).
 * @param {string} url
 * @param {object} params Request parameters.
 * @param {object=} options Standart jQuery.ajax settings object.
 * @returns {Vow.Promise}
 */
ns.http = function(url, params, options) {
    // в пустой объект записывать дефолты, затем передданные опции
    options = utils.extend({}, ns.H.DEFAULTS, options);
    options.url = url;
    options.data = params;

    return utils.ajax(options);
};
