    /**
     * @class ns.BoxReact
     * @augments ns.Box
     * @mixes ns.ViewReactMixin
     * @constructor
     */
    ns.BoxReact = function() {
        ns.Box.apply(this, arguments);
        this.previousActive = {};
        this.info.compmonentDecl = ns.BoxReact.mixComponent(this.id);
        this.info.componentClass = ns.BoxReact.createClass(this.info.compmonentDecl);
    };

    // унаследуем прототип ns.Box с расширением его для работы с реакт компонентом
    no.inherit(ns.BoxReact, ns.Box, [ns.ViewReactMixin, ns.Events]);
    // унаследуем статические методы c расширением их для работы с реакт компонентом
    no.extend(ns.BoxReact, ns.Box, ns.ViewReactStaticMixin);
    // Определяем базовый прототип, от которого наследуемся.
    // Он используется в миксине
    ns.BoxReact.prototype._baseClass = ns.Box.prototype;

    ns.BoxReact.prototype.hasInheritingProps = true;

    /**
     * Добавляет ns.View или ns.Box в список дочерних видов, если они не были созданы.
     * @param {string} id
     * @param {object} params
     * @param {ns.L} type
     * @returns {ns.ViewReact|ns.BoxReact}
     * @private
     */
    ns.BoxReact.prototype._addView = function(id, params, type) {
        var view = this._getView(id, params, type);
        if (!view) {
            if (type === ns.L.BOX) {
                view = new ns.BoxReact(id, params);
            } else {
                view = ns.View.create(id, params, type === ns.L.ASYNC);
            }
            this.views[view.key] = view;
        }
        return view;
    };

    /**
     * Ищем все новые блоки и блоки, требующие перерисовки.
     * @param {object} updated
     * @param {object} layout
     * @param {object} params
     * @private
     */
    ns.BoxReact.prototype._getRequestViews = function(updated, layout, params) {
        this.previousActive = this.active;
        return ns.Box.prototype._getRequestViews.apply(this, arguments);
    };

    /**
     * Скрывает все неактивные виды в боксе
     * @private
     */
    ns.BoxReact.prototype._hideInactiveViews = function() {
        // Пройдёмся по всем вложенным видам, чтобы кинуть hide, которым не попали в newLayout
        for (var key in this.views) {
            var view = this.views[key];
            // Если вид не входит в новый active
            if (this.active[view.id] !== view.key) {
                // Скроем виды, не попавшие в layout
                var descs = view._getDescendantsAndSelf([]);
                for (var i = 0, l = descs.length; i < l; i++) {
                    descs[i].hideAndUnbindEvents();
                }
            }
        }
    };

    /**
     * Проверяет порядок активных view на изменение
     * @desc
     * Если порядок отображаемых в боксе view изменился, то его компонент становится
     * не актуальным. Соответственно нужно указать, что у бокса уже нет актуального компонента
     * @private
     */
    ns.BoxReact.prototype._checkActiveSequence = function() {
        var activeViews = Object.keys(this.active);
        var previousActiveView = Object.keys(this.previousActive);
        var previousViewCount = previousActiveView.length;
        var index;

        for (index = 0; index < previousViewCount; index++) {
            if (previousActiveView[index] !== activeViews[index]) {
                // Сбрасываем компонент, т.к. бокс должен перерисоваться
                this.reactComponentType = 'none';
                break;
            }
        }
    };

    /**
     * Предобработка перед подготовкой обновления дерева React компонентов
     * @param {string} componentType
     */
    ns.BoxReact.prototype.beforePrepareRenderElement = function(componentType) {
        this._hideInactiveViews();
        this._checkActiveSequence();
    };

    /**
     * Обходит все активные виды, входящие в бокс
     * @param {Function} callback
     * @private
     */
    ns.BoxReact.prototype._apply = function(callback) {
        for (var key in this.active) {
            if (this.active.hasOwnProperty(key)) {
                callback(this.getActiveView(key), this.id + '__' + key);
            }
        }
    };

    /**
     * Получает ноду для бокса из отрисованного по YATE дерева
     * @param {Node} node
     * @returns {Node}
     * @private
     */
    ns.BoxReact.prototype._extractNode = function(node) {
        var newNode = ns.byClass('ns-view-' + this.id, node)[0];
        if (!newNode) {
            throw new Error('[ns.Box] Can\'t find node for "' + this.id + '"');
        }
        return newNode;
    };

    ns.BoxReact.prototype._saveModelsVersions = no.nop;
    ns.BoxReact.prototype.__modelsEventsBinded = true;
    ns.BoxReact.prototype.__bindModelsEvents = no.nop;
    ns.BoxReact.prototype.__fillEventsQueue = no.nop;
    ns.BoxReact.prototype._bindEvents = no.nop;
    ns.BoxReact.prototype._unbindEvents = no.nop;

    /**
     * Получает дочернее вью
     * @param {string} viewId
     */
    ns.BoxReact.prototype.getChildView = function(viewId) {
        return this.getActiveView(viewId);
    };

    /**
     * Проходит по всем доступным для работы дочерним view
     * @param {Function} callback
     */
    ns.BoxReact.prototype.forEachItem = function(callback) {
        this._apply(callback);
    };

    /**
     * Получает ns.ViewReact, которое сейчас активно в ns.Box
     * @param {string} id
     * @returns {?ns.ViewReact}
     */
    ns.BoxReact.prototype.getActiveView = function(id) {
        var activeViewKey = this.active[id];
        if (activeViewKey) {
            return this.views[activeViewKey];
        }
        return null;
    };

    /**
     * Возвращает true, если для бокса не создан React компонент (элемент)
     * @returns {boolean}
     */
    ns.BoxReact.prototype.isNone = function() {
        return this.reactComponentType === 'none' || this.reactComponentType === 'destroyed';
    };

    /**
     * Проверяет валидность бокса. Бокс валиден, когда для него существует компонент
     * @returns {boolean}
     */
    ns.BoxReact.prototype.isValid = ns.BoxReact.prototype.isValidSelf = function() {
        return !this.isNone();
    };

    /**
     * Уничтожает ns.BoxReact
     */
    ns.BoxReact.prototype.destroy = function() {
        this.previousActive = null;
        return ns.ViewReactMixin.destroy.apply(this, arguments);
    };

    var _baseAddView = ns.Box.prototype._addView;

    /**
     * @param {string} id
     * @param {object} params
     * @param {ns.L} type
     * @returns {ns.View}
     * @private
     */
    ns.Box.prototype._addView = function() {
        var view = _baseAddView.apply(this, arguments);
        var hasReactViewCreated = (
            view instanceof ns.ViewReact ||
            view instanceof ns.ViewReactCollection
        );

        ns.View.assert(
            !hasReactViewCreated,
            'view-react-2',
            [view.id, this.id]
        );
        return view;
    };
