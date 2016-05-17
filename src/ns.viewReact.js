    /**
     * @class ns.ViewReact
     * @augments ns.View
     * @mixes ns.ViewReactMixin
     * @constructor
     */
    ns.ViewReact = function() {};

    // унаследуем прототип ns.View с расширением его для работы с реакт компонентом
    no.inherit(ns.ViewReact, ns.View, ns.ViewReactMixin);
    // унаследуем статические методы c расширением их для работы с реакт компонентом
    no.extend(ns.ViewReact, ns.View, ns.ViewReactStaticMixin);
    // Определяем базовый прототип, от которого наследуемся.
    // Он используется в миксине
    ns.ViewReact.prototype._baseClass = ns.View.prototype;

    /**
     * Объявление конструктура реактивной view
     * @param {string} id идентификатор view
     * @param {Object} [info] объект информации о структуре view
     * @returns {Function}
     * @static
     */
    ns.ViewReact.define = function(id, info) {
        info = info || {};
        info.componentDecl = this.mixComponent(id, info.component);
        info.componentClass = this.createClass(info.componentDecl);
        return ns.View.define(id, info, ns.ViewReact);
    };

    // FIXME: метод должен иметь возможность быть переопределёным (расширеным) в ns.View
    /**
     * Добавляет ns.View или ns.Box в список дочерних видов, если они не были созданы.
     * @param {string} id
     * @param {object} params
     * @param {ns.L} type
     * @returns {ns.View}
     * @private
     */
    ns.ViewReact.prototype._addView = function(id, params, type) {
        var view = this._getView(id);
        if (!view) {
            if (type === ns.L.BOX) {
                view = new ns.BoxReact(id, params);
            } else {
                view = ns.View.create(id, params, type === ns.L.ASYNC);
            }
            this.views[view.id] = view;
        }
        return view;
    };
