(function() {
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
     * @param {String} [base] айдишник базовой реактивной вьюшка
     * @returns {Function}
     * @static
     */
    ns.ViewReact.define = function(id, info, base) {
        info = info || {};

        info.componentDecl = this.mixComponent(id, info.component, base);
        info.componentClass = this.createClass(info.componentDecl);

        var ctor = ns.View.define.call(this, id, info, base);

        // Если наследуемся не от ns.ViewReact, то нужно переопределить prototype
        // и добавить методы от наследуемого view
        if (!(ctor.prototype instanceof ns.ViewReact)) {
            var proto = ctor.prototype;
            no.inherit(ctor, ns.ViewReact);
            ctor.prototype = no.extend({}, proto, ctor.prototype);
        }

        return ctor;
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
}());
