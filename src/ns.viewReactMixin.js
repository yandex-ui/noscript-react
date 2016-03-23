(function(React, ReactDOM) {
    ns.View.ERROR_CODES['view-react-1'] = 'NS object `%s` is trying to unmount child ns.ViewReact `%s`. But it\'s impossible.';

    /**
     * Расширяет возможности React компонента, созданного для ns.ViewReact, ns.ViewReactCollection, ns.BoxReact
     * @mixin ns.BaseReactMixin
     */
    ns.BaseReactMixin = {
        /**
         * Действия перед созданием компонента
         */
        componentWillMount: function() {
            this.props.view.on('ns-view-react-force-update', this.__update);
            this.props.view.on('ns-view-react-destroy', this.__handleDestroy);
        },

        /**
         * Действия после удаления компонента
         */
        componentWillUnmount: function() {
            this.props.view.off('ns-view-react-force-update', this.__update);
            this.props.view.off('ns-view-react-destroy', this.__handleDestroy);
        },

        /**
         * Проверка необходимости обновления компонента
         * @param {object} nextProps
         * @returns {boolean}
         */
        shouldComponentUpdate: function(nextProps) {
            // Обновляем только необходимые компоненты
            return nextProps.view._needBeUpdated;
        },

        /**
         * Принудительно обновляет компонент
         * @private
         */
        __update: function() {
            this.forceUpdate();
        },

        /**
         * Обрабатывает вызов уничтожения компонента
         * @private
         */
        __handleDestroy: function() {
            this.props._onDestroy();
        },

        /**
         * Расширяет переданные props событием _onDestroy
         * @param {Object} [props]
         * @returns {Object}
         * @private
         */
        __extendDestroyToProps: function(props) {
            props = props || {};
            return no.extend({
                _onDestroy: this.__handleDestroy
            }, props);
        },

        /**
         * Создает и возвращает соответствующие реакт-элементы
         * для детей текущей вьюшки
         *
         * @param {string|ns.Model|string[]|ns.Model[]} [id] идентификаторы дочерних вью, компоненты которых нужно создать. Модель в качестве идентификатора используется для коллекций
         * @param {Object} [props] свойства (props) создаваемых компонентов для дочерних view
         * @desc
         * Возможные варианты вызова
         * ```javascript
         * this.createChildren() // создаст компоненты для всех дочерних view
         * this.createChildren({length: 25}); // создаст компоненты для всех дочерних view и передаст им указанные props
         * this.createChildren('child-view') // создаст дочернее view с id `child-view`.
         * this.createChildren('child-view', {length: 25}) // создаст дочернее view с id `child-view` и передаст в неё указанные props
         * this.createChildren(['child-view1', 'child-view2']); // создаст дочерние view с id `child-view1`, `child-view2`
         * this.createChildren(['child-view1', 'child-view2'], {length: 25}); // создаст дочерние view с id `child-view1`, `child-view2`  и передаст в них указанные props
         * ```
         * @return {ReactElement[]}
         */
        createChildren: function(id, props) {
            // Приведение параметров к полному виду
            if (typeof id === 'object' && !Array.isArray(id) && !(id instanceof ns.Model)) {
                props = id;
                id = null;
            }
            props = props || {};

            if (!id) {
                return this.__createChildren(props);
            }

            if (!Array.isArray(id)) {
                id = [id];
            }

            var idCount = id.length;
            var children = [];
            var idIndex;
            for(idIndex = 0; idIndex < idCount; idIndex++) {
                children.push(this.__createChild(id[idIndex], props));
            }

            return children;

        },

        /**
         * Создает и возвращает реакт-элемент для указанной реактивной вьюшки,
         * при условии, что такая есть среди потомков текущей вьюшки.
         *
         * @param {string} id имя вьюшки
         * @param {Object} [props] свойства (props) создаваемого компонента для дочернего view
         * @return {ReactElement}
         * @private
         */
        __createChild: function(id, props) {
            var viewChild = this.props.view.getChildView(id);

            ns.View.assert(!!viewChild, 3, [id]);

            return viewChild.createElement(this.__extendDestroyToProps(props));
        },

        /**
         * Создает и возвращает соответствующие реакт-элементы
         * для всех детей текущей вьюшки
         *
         * @param {Object} [props] свойства (props) создаваемых компонентов для дочерних view
         * @return {ReactElement[]}
         * @private
         */
        __createChildren: function(props) {
            var children = [];
            var that = this;

            this.props.view.forEachItem(function(childView) {
                children.push(childView.createElement(that.__extendDestroyToProps(props)));
            });

            return children;
        },

        /**
         * Возвращает по указанному jpath данные указанной модели,
         * если такой экземпляр есть в зависимости у вьюшки.
         * Если не указан jpath, вернутся все данные.
         *
         * @param {String} id имя модели
         * @param {String} [jpath]
         * @return {Object|*} данные
         */
        getModelData: function(id, jpath) {
            var model = this.props.models[id];
            var data = model && model.getData();

            ns.View.assert(!!data, 9, [id]);

            if (!jpath) {
                return data;
            }
            return no.jpath(jpath, data);
        }
    };

    /**
     * Расширение статических методов для ns.ViewReact, ns.ViewReactCollection, ns.BoxReact
     * @mixin ns.ViewReactStaticMixin
     * @desc
     * Нуждается в методе `isLoading` у ns.ViewReact, ns.ViewReactCollection, ns.BoxReact
     */
    ns.ViewReactStaticMixin = {
        /**
         * Применяет базовый mixin для описанного во view React компонента
         * @param {string} id идентификатор view
         * @param {Object} [component] описание React компонента
         * @return {Object}
         * @static
         */
        mixComponent: function(id, component) {
            if (!component) {
                component = {};
            }

            if (!component.render) {
                /**
                 * Базовый метод отображения реактивного элемента
                 * @returns {ReactElement}
                 */
                component.render = ns.ViewReactStaticMixin.render
            }
            component.mixins = component.mixins || [];
            component.mixins.push(ns.BaseReactMixin);
            component.displayName = id;

            return component;
        },

        /**
         * Базовый метод отображения реактивного элемента
         * @returns {ReactElement}
         */
        render: function() {
            if (this.props.view.isLoading()) {
                return React.createElement(
                    'div',
                    this.props
                );
            } else {
                return React.createElement(
                    'div',
                    this.props,
                    this.createChildren()
                )
            }
        },

        /**
         * Создаёт React компонент, который потом будет использоваться для рендринга
         * @param {Object} componentDecl информация о компоненте
         */
        createClass: function(componentDecl) {
            return React.createClass(componentDecl);
        }
    };

    /**
     * Расширение прототипа для ns.View, ns.ViewCollection, ns.Box
     * @mixin ns.ViewReactMixin
     * @desc
     * Нуждается в следующих метода у ns.ViewReact, ns.ViewReactCollection, ns.BoxReact:
     *
     *   * _extractNode
     *   * _saveModelsVersions
     *   * _apply
     *   * __bindModelsEvents
     *   * trigger
     *   * isValidSelf
     *
     * и свойств:
     *
     *   * _visible
     *   * __modelsEventsBinded
     *   * asyncState
     *   * views
     *   * _baseClass - прототип базовый класс, от которого наследуются
     */
    ns.ViewReactMixin = {
        /**
         * Скрывает ns.ViewReact, отвязывая компонент от неё
         */
        hideAndUnbindEvents: function() {
            switch (this.reactComponentType) {
                case 'root':
                    // FIXME (rebulus) для совместимости с ns v0.7.x
                    this._hideNode && this._hideNode();
                    this.reactComponentType = 'none';
                    ReactDOM.unmountComponentAtNode(this.node);
                    break;
                case 'child':
                    this.reactComponentType = 'none';
                    break;
            }

            this._visible = false;
        },

        /**
         * Получает дочернее вью
         * @param {string} viewId
         * @return {?ns.View} view
         */
        getChildView: function(viewId) {
            var childView = this.views[viewId];

            if (childView) {
                return childView;
            }

            return null;
        },

        /**
         * Проходит по всем доступным для работы дочерним view
         * @param {Function} callback
         */
        forEachItem: function(callback) {
            this._apply(callback);
        },

        /**
         * Проверяет, имеет ли view отображение ввиде React компонента
         * @returns {boolean}
         */
        hasReactComponent: function() {
            return this.reactComponentType !== 'destroyed' && this.reactComponentType !== 'none';
        },

        /**
         * Создаёт React элемент
         * @param {Object} [props] пользовательские props для элемента
         * @returns {?ReactElement}
         */
        createElement: function(props) {
            if (!this.hasReactComponent()) {
                return null;
            }

            return React.createElement(this.info.componentClass, no.extend({}, props, {
                models: this.models,
                view: this,
                /*
                 * Если this.props.children являются массивом,
                 * нужно явно указывать key при создании элемента
                 * @see http://facebook.github.io/react/docs/multiple-components.html#dynamic-children
                 * В нашем случае так бывает при вызове createChildren
                 */
                key: this.__uniqueId
            }));
        },

        /**
         * Тип React компонента, который служит отображением view
         * `none` - компонент ещё не создан (компонент отсутствует)
         * `root` - корневой (родительский) компонент
         * `child` - дочерний компонент
         * `destroyed` - компонент уничтожен
         * @type {string}
         */
        reactComponentType: 'none',

        /**
         * Флаг необходимости обновления React компонента, связанного с ns.ViewReact
         * @desc
         * Не актуализируется до следующей отрисовки. Это значит, что если `ns.ViewReact` на момент отрисовки имел флаг в значении `true`, то он сохранится до следующей отрисовки.
         * @type {boolean}
         */
        _needBeUpdated: false,

        /**
         * React компонент должен быть обновлён
         * @returns {boolean}
         */
        hasStateOfUpdate: function() {
            return this._needBeUpdated;
        },

        /**
         * Сброс состояния обновления React компонента
         */
        resetStateOfUpdate: function() {
            this._needBeUpdated = false;
        },

        /**
         * Обновление HTML для view
         * @param {Element} [node] корневая нода обновления
         * @param {Object} [options] опции обновления
         * @private
         */
        _updateHTML: function(node, options) {
            node = node || null;
            options = options || {};

            switch (this.reactComponentType) {
                case 'none':
                    if (!this.isValid()) {
                        this._updateNode(node);
                    } else {
                        // FIXME (rebulus) для совместимости с ns v0.7.x
                        this._showNode && this._showNode();
                    }
                    this._prepareRenderElement('root');
                    this._renderElement();
                    break;
                case 'root':
                    // Если это вложенная вьюшка, а её родитель (ns.View) обновил свой DOM,
                    // то нужно привязать другую ноду к элементу
                    if (!options.toplevel && options.parent_added) {
                        this.hideAndUnbindEvents();
                        this._updateNode(node);
                    }
                    this._prepareRenderElement('root');
                    this._renderElement();
                    break;
                case 'child':
                    this._prepareRenderElement('child');
                    this._renderElement();
                    break;
            }
        },

        /**
         * Обновляет node связанную с `root` элементом
         * @param {Node} node
         * @private
         */
        _updateNode: function(node) {
            var viewNode = this._extractNode(node);
            ns.View.assert(!!viewNode, 6, [this.id]);

            this.node = viewNode;
            this.$node = $(viewNode);

            // FIXME (rebulus) для совместимости с ns v0.7.x
            this._showNode && this._showNode();
        },

        /**
         * Отрисовка итогового React компонента
         * @private
         */
        _renderElement: function() {
            switch (this.reactComponentType) {
                case 'root':
                    ReactDOM.render(this.createElement({
                        _onDestroy: this._onChildrenDestroyed.bind(this)
                    }), this.node);
                    break;
                case 'child':
                    /**
                     * Обновляем принудительно дочернюю ns.ViewReact.
                     * Эта необходимость должна появлятся только для async view или update,
                     * вызванных "руками" на конкретных ns.ViewReact
                     */
                    this.trigger('ns-view-react-force-update');
                    break;
            }
        },

        /**
         * Обработка уничтожения дочерних компонентов у `root` компонента
         * @private
         */
        _onChildrenDestroyed: function() {
            this._prepareRenderElement('root');
            this._renderElement();
        },

        /**
         * Обновление свойств ns.ViewReact:
         *
         * - типа React компонента
         * - состояния ns.ViewReact
         * - версий моделей
         *
         * @param {string} componentType тип React компонента, с которым связано view
         * @private
         */
        _applyProperties: function(componentType) {
            if (this.reactComponentType === 'destroyed') {
                return;
            }

            this.reactComponentType = componentType;

            if (this.asyncState) {
                this.status = ns.V.STATUS.LOADING;
            } else {
                this.status = ns.V.STATUS.OK;
            }

            this._visible = this.hasReactComponent();

            this._saveModelsVersions();
        },

        /**
         * Подготовка обновления дерева React компонентов
         * @param {string} componentType
         * @private
         */
        _prepareRenderElement: function(componentType) {
            if (this.reactComponentType === 'destroyed') {
                return;
            }

            this.beforePrepareRenderElement(componentType);

            var hasChildrenNeedBeUpdated = this.hasChildrenNeedBeUpdated();

            /**
             * Условия обновления React компонента
             * - view не валидно
             * - есть дочерние вью, которые не валидны
             * - view не имеет компонента
             */
            this._needBeUpdated =
                !this.isValidSelf() ||
                hasChildrenNeedBeUpdated ||
                !this.hasReactComponent();

            this._applyProperties(componentType);

            // Первая подписка view на события модели
            if (!this.__modelsEventsBinded) {
                this.__bindModelsEvents();
            }
        },

        /**
         * Проверяет, имеются ли у view потомки, которые должны быть обновлены (перерисованы)
         * @returns {boolean}
         */
        hasChildrenNeedBeUpdated: function() {
            var hasChildrenNeedBeUpdated = false;

            this._apply(function(childView) {
                childView._prepareRenderElement('child');

                if (childView._needBeUpdated) {
                    hasChildrenNeedBeUpdated = true;
                }
            });

            return hasChildrenNeedBeUpdated;
        },

        /**
         * Предобработка перед подготовкой обновления дерева React компонентов
         * @desc
         * Служит точкой расширения для элементов, которым не хватает стандартного поведения
         * подготовки обновления
         * @param {string} componentType
         */
        beforePrepareRenderElement: no.nop,

        patchTree: function(tree) {
            tree.isReactView = true;

            return tree;
        },

        /**
         * Применение типа React компонента - уничтожен (`destroyed`).
         * @private
         */
        _applyDestroyedComponentType: function() {
            this.reactComponentType = 'destroyed';
            this._apply(function(childView) {
                childView.reactComponentType = 'destroyed';
            });
        },

        /**
         * Уничтожает связанный с view React компонент и его дочерние React компоненты.
         * @private
         */
        _destroyComponent: function() {
            switch(this.reactComponentType) {
                case 'child':
                    this._applyDestroyedComponentType();
                    this.trigger('ns-view-react-destroy');
                    break;
                case 'root':
                    this._applyDestroyedComponentType();
                    ReactDOM.unmountComponentAtNode(this.node);
                    break;
                case 'none':
                    this._applyDestroyedComponentType();
                    break;
            }
        },

        /**
         * Тихое удаление ns.ViewReact без вызова отрисовки для удаления связанного компонента
         * @desc
         * Данный метод можно использовать, когда следующий шаг будет отрисовка, куда
         * данное ns.ViewReact наверняко не войдёт, что вызовет автоматическое удаление связанного с
         * view компонента
         */
        softDestroy: function() {
            // FIXME - проходов по дочерним ns.ViewReact сейчас 2. Для получения одного, необходимо рефакторить метод `destroy` в ns.View
            this._applyDestroyedComponentType();

            this._baseClass.destroy.apply(this);
        },

        /**
         * Уничтожает ns.ViewReact.
         * - в начале уничтожаются связанный с ns.ViewReact компонент и его дочерние компоненты
         * - потом уничтожаются ns.ViewReact и все её дочерние ns.ViewReact.
         * Чтобы не вызвать лишние обработки, дочерние вью после удаления их компонентов меняют
         * статус компонента на `destroyed`.
         */
        destroy: function() {
            if (this.reactComponentType !== 'destroyed') {
                // FIXME - проходов по дочерним ns.ViewReact сейчас 2. Для получения одного, необходимо рефакторить метод `destroy` в ns.View
                this._destroyComponent();
            }

            this._baseClass.destroy.apply(this);
        }
    }
}).apply(null ,
    (typeof require === 'function' ?
        [require('react'), require('react-dom')] :
        [window.React, window.ReactDOM])
);
