var ns = require('./ns');

/**
 * Константы для ns.Model.
 * @namespace
 */
ns.M = {};

/**
 * Статусы Model.
 * @enum {string}
 */
ns.M.STATUS = {
    /**
     * "Ошибка": данные загрузились с ошибкой.
     */
    ERROR: 'error',

    /**
     * "Инициализированна", данных нет.
     */
    INITED: 'inited',

    /**
     * "Создана", данных нет.
     */
    NONE: 'none',

    /**
     * "Все хорошо": данные загрузились успешно.
     */
    OK: 'ok',

    /**
     * "Невалидна": данные есть, но кто-то пометил их невалидными.
     */
    INVALID: 'invalid'
};

/**
 * Константы для ns.router.
 * @enum {string}
 */
ns.R = {

    /**
     * ID страницы, не относящейся к noscript приложению.
     */
    NOT_APP_URL: 'ns-router-not-app',

    /**
     * ID необъявленной/ненайденной страницы
     */
    NOT_FOUND: 'not-found',

    /**
     * ID страницы-редиректа.
     * Тут специально выбрано длинное название,
     * чтобы не пересечься с нормальными страницами.
     */
    REDIRECT: 'ns-router-redirect'
};

ns.DEBUG = false;

/**
 * Параметры по умолчанию для http-запросов.
 * @type {object}
 */
ns.H = {
    DEFAULTS: {
        dataType: 'json',
        type: 'POST'
    }
};

/**
 * @enum {string}
 */
ns.V = {
    OK: 'ok',
    ERROR: 'error',
    LOADING: 'loading'
};
