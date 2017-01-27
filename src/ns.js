/**
 * noscript MVC framework
 * @namespace
 * @tutotial entities
 */
var ns = {};

// eslint-disable-next-line no-undef
ns.VERSION = VERSION;

/**
 * Удобная функция для расстановки TODO, кидает исключение при вызове.
 */
ns.todo = function() {
    throw new Error('Unimplemented');
};

/**
 * Parse query string to object.
 * @param {string} s Query string
 * @returns {object}
 */
ns.parseQuery = function(s) {
    var o = {};

    s.split('&').forEach(function(chunk) {
        var p = chunk.split('=');
        var name = p.shift();
        if (name) {
            // В значении параметра может быть знак равенства
            var value = p.join('=');

            // &c=
            if (typeof value === 'undefined') {
                value = '';

            } else {
                try {
                    value = decodeURIComponent(value);
                } catch (e) {
                    value = '';
                    ns.log.info('ns.parseQuery.invalid-param', {
                        query: s,
                        chunk: chunk
                    });
                }
            }

            if (name in o) {
                // если параметры имеют вид ?id=1&id=2&id=3,
                // то на выходе должен получиться массив

                // если массива еще нет, то создаем его
                if (!Array.isArray(o[name])) {
                    o[name] = [o[name]];
                }

                o[name].push(value);
            } else {
                o[name] = value;
            }
        }
    });

    return o;
};

/**
 * Производит первоначальную инициализацию noscript.
 */
ns.init = function() {
    ns.router.init();
    ns.history.init();
    ns.assert(ns.MAIN_VIEW, 'init', 'You have to define ns.MAIN_VIEW before init the app');
};

/**
 * Выполняет проверку, что первый аргумент истиннен.
 * Если это не так - кидает ошибку.
 * @param {?} truthy Любое значение, которое проверяется на истинность.
 * @param {string} contextName Контекст для быстрого поиска места возникновения ошибки.
 * @param {string} message Сообщение об ошибке.
 */
ns.assert = function(truthy, contextName, message) {
    /* jshint unused: false */
    if (!truthy) {
        ns.assert.fail.apply(this, Array.prototype.slice.call(arguments, 1));
    }
};

/**
 * Кидает ошибку с понятным сообщением.
 * @param {string} contextName Контекст для быстрого поиска места возникновения ошибки.
 * @param {string} message Сообщение об ошибке.
 */
ns.assert.fail = function(contextName, message) {
    var messageArgs = Array.prototype.slice.call(arguments, 2);
    for (var i = 0; i < messageArgs.length; i++) {
        message = message.replace('%s', messageArgs[i]);
    }
    throw new Error('[' + contextName + '] ' + message);
};

/**
 * Строит ключ по готовому объекту параметров.
 * @param {string} prefix Префикс ключа.
 * @param {object} params Объект с параметрами составляющими ключ.
 * @returns {string} Строка ключа.
 */
ns.key = function(prefix, params) {
    var key = prefix;
    params = params || {};
    for (var pName in params) {
        key += '&' + pName + '=' + encodeURIComponent(params[pName]);
    }
    return key;
};

/**
 * Конкатенирует параметры в GET-запрос
 * @param {object} params Параметры запроса
 * @returns {string}
 */
ns.params2query = function(params) {
    var query = [];

    var pName;
    var pValue;
    for (pName in params) {
        pValue = params[pName];
        if (Array.isArray(pValue)) {
            for (var i = 0; i < pValue.length; i++) {
                query.push(encodeURIComponent(pName) + '=' + encodeURIComponent(pValue[i]));
            }
        } else {
            query.push(encodeURIComponent(pName) + '=' + encodeURIComponent(pValue));
        }
    }

    return query.join('&');
};

/**
 * Clean internal data after tests
 */
ns.reset = function() {
    ns.action._reset();
    ns.router._reset();
    ns.Model._reset();
    ns.request._reset();
    ns.page._reset();
    ns.page.history.reset();
    ns.MAIN_VIEW = null;
};

/**
 * Задача пользователя понять
 * в каком окружении используется ns
 * и передать ссылки на React и ReactDOM
 */
ns.React = null;
ns.ReactDOM = null;

/**
 * Массив объектов вида { id: 'model', params: {} },
 * которые необходимо передать в ns.request для запроса
 * пачки моделей.
 * Массив заполняет в ходе апдейта дата-провайдерами
 * и очищается каждый раз по окочанию апдейта.
 * @private
 */
ns._requestsInUpdate = [];

module.exports = ns;
