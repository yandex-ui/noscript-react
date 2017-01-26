var ns = require('./ns');

/**
 * Объект, реализующий экшены.
 * @namespace
 */
ns.action = {};

var _actions = {};

/**
 * Register action.
 * @param {string} id Action id.
 * @param {function} action Action to be performed.
 */
ns.action.define = function(id, action) {
    if (id in _actions) {
        throw new Error('[ns.action] Can\'t redefine \'' + id + '\'');
    }
    _actions[id] = action;
};

/**
 * Copy action with different name.
 * @param {string} existentAction Action id.
 * @param {string} newAction Action id.
 */
ns.action.copy = function(existentAction, newAction) {
    if (newAction in _actions) {
        throw new Error('[ns.action] Can\'t redefine \'' + newAction + '\'');
    }
    if (!(existentAction in _actions)) {
        throw new Error('[ns.action] \'' + existentAction + '\' is not defined');
    }
    _actions[newAction] = _actions[existentAction];
};

/**
 * Run action by name
 * @param {string} id Action name
 * @param {object} [params] Params
 * @param {Element} [node]
 * @param {Event} [event]
 * @returns {*}
 * @throws Бросает исключение, если action не определен
 */
ns.action.run = function(id, params, node, event) {
    var action = _actions[id];
    ns.assert(action, 'ns.action', '%s is not defined', id);

    try {
        return action(id, params, node, event);
    } catch (e) {
        ns.log.exception('ns.action', e);
    }
};

/**
 * Получает параметры экшена из ноды
 * @param {HTMLElement} node
 * @returns {object}
 */
ns.action.getParams = function(node) {
    var paramString = node.getAttribute('data-params');
    if (paramString && paramString.charAt(0) === '{') {
        try {
            return JSON.parse(paramString);
        } catch (e) {}
    }

    //TODO: parseURL?
    return {};
};

ns.action._reset = function() {
    _actions = {};
};
