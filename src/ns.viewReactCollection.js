    /**
     * @class ns.ViewReactCollection
     * @augments ns.ViewCollection
     * @mixes ns.ViewReactMixin
     * @constructor
     */
    ns.ViewReactCollection = function() {};

    // унаследуем прототип ns.ViewCollection с расширением его для работы с реакт компонентом
    no.inherit(ns.ViewReactCollection, ns.ViewCollection, ns.ViewReactMixin);
    // унаследуем статические методы c расширением их для работы с реакт компонентом
    no.extend(ns.ViewReactCollection, ns.ViewCollection, ns.ViewReactStaticMixin);
    // Определяем базовый прототип, от которого наследуемся.
    // Он используется в миксине
    ns.ViewReactCollection.prototype._baseClass = ns.ViewCollection.prototype;

    /**
     * Объявление конструктура реактивной view коллекции
     * @param {string} id идентификатор view коллекции
     * @param {Object} [info] объект информации о структуре view коллекции
     * @param {String} [base] айдишник базовой реактивной вьюшка
     * @returns {Function}
     * @static
     */
    ns.ViewReactCollection.define = function(id, info, base) {
        info = info || {};
        info.componentDecl = this.mixComponent(id, info.component, base);
        info.componentClass = this.createClass(info.componentDecl);

        var ctor = ns.ViewCollection.define.call(this, id, info, base);

        // Если наследуемся не от ns.ViewReactCollection, то нужно переопределить prototype
        // и добавить методы от наследуемого view
        if (!(ctor.prototype instanceof ns.ViewReactCollection)) {
            var proto = ctor.prototype;
            no.inherit(ctor, ns.ViewReactCollection);
            ctor.prototype = no.extend({}, proto, ctor.prototype);
        }

        return ctor;
    };

    /**
     * События моделей, обрабатываемые видом по умолчанию
     */
    ns.ViewReactCollection.eventsModelCollectionDefault = {
        'ns-model-insert': 'invalidate',
        'ns-model-remove': 'invalidate',
        'ns-model-changed': 'invalidate',
        'ns-model-destroyed': 'invalidate'
    };

    /**
     * Получает дочернее вью
     * @param {ns.Model} viewModel
     */
    ns.ViewReactCollection.prototype.getChildView = function(viewModel) {
        return this.getItemByModel(viewModel);
    };

    /**
     * Проходит по всем доступным для работы дочерним view
     * @param {Function} callback
     */
    ns.ViewReactCollection.prototype.forEachItem = ns.ViewCollection.prototype.forEachItem;

    /**
     * Предобработка перед подготовкой обновления дерева React компонентов
     * @param {string} componentType
     */
    ns.ViewReactCollection.prototype.beforePrepareRenderElement = function(componentType) {
        /**
         * "Тихо" уничтожаем неактуальные дочерние ns.ViewReact. Связанные с ними
         * React компоненты будут удалены в процессе отрисовки
         */
        var views = this.__itemsToRemove;
        var viewsLength = views.length;
        for (var i = 0; i < viewsLength; i++) {
            views[i].softDestroy();
        }
        this.__itemsToRemove = [];
    };
