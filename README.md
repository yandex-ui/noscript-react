# React + Noscript

[![Build Status](https://travis-ci.org/yandex-ui/noscript-react.svg?branch=master)](https://travis-ci.org/yandex-ui/noscript-react)
[![npm version](https://badge.fury.io/js/noscript-react.svg)](https://badge.fury.io/js/noscript-react)
[![Dependency Status](https://david-dm.org/yandex-ui/noscript-react.svg)](https://david-dm.org/yandex-ui/noscript-react)

## Оглавление

 * [TodoMVC](https://github.com/yandex-ui/noscript-react-todomvc)
 * [CommonJS подключеие](#commonjs-require)
 * [Как это работает](#how-do-it-works)
 * [API ns.ViewReact](#ns-view-react)
   * [#mixComponent](#ns-view-react__mixComponent)
   * [#createClass](#ns-view-react__createClass)
   * [#getChildView](#ns-view-react__getChildView)
   * [#forEachItem](#ns-view-react__forEachItem)
   * [#createElement](#ns-view-react__createElement)
   * [#reactComponentType](#ns-view-react__reactComponentType)
   * [#softDestroy](#ns-view-react__softDestroy)
 * [API ns.ViewReactCollection](#ns-view-react-collection)
 * [API ns.BoxReact](#ns-box-react)
 * [API ReactComponent](#react-component)
   * [getModelData](#react-component__getModelData)
   * [createChildren](#react-component__createChildren)

## <a name="commonjs-require"></a>CommonJS подключеие

Подключение npm пакета `noscript-react` в CommonJS стиле производится следующим образом:

```js
require('noscript-react')
```

В этом случае `React` и `ReactDOM` будут подключены через `require`. Стоит помнить, что `noscript` пока не имеет хорошего модульного подключения. Поэтому, он, как и `jQuery`, должен располагаться в `global`

## <a name="how-do-it-works"></a>Как это работает

Есть специальные классы `ns.ViewReact`, `ns.ViewReactCollection` и внутренний класс `ns.BoxReact`. Кроме того, что они имеют все те же поля, что и обычные `ns.View`, `ns.ViewCollection` и `ns.Box`, есть еще поле `component` — декларация реакт-компонента.

Например,

```js
ns.ViewReact.define('aside', {
    component: {
        render: function() {
            return React.createElement(
                'div',
                { className: 'aside' },
                // YATE: apply /.views.menu ns-view
                this.createChildren('menu')
            );
        }
    }
});
```

По умолчанию, если это поле не указано или не указан метод `render` в нём, то отрисовывается `ReactElement`, реализующий тег `div` и внутренние вью размещаются в нём. Таким образом, сохраняется аналогичное с `YATE` поведение по формированию отображения `ns.View`.

Реакт-компоненты в `props` получают свою вьюшку `view` и объект с её моделями - `models`.

С помощью ссылки на `view` в пропсах есть знания о кусочке дерева, который лежит ниже этой вьюшки, соответственно есть возможность расставить детей в шаблоне.

Обновляются компоненты по привычной ns-схеме: если реактивная вьюшка стала не валидной (поменялись данные, например), то при следующем `ns.Update` она будет перерисована. Перерисовка происходит средствами React.

Чтобы это реализовать пока пришлось переопределить приватный `_updateHTML` и `_addView` у `ns.ViewReact` и `ns.ViewReactCollection`. Рассчитываем на то, что в ns эти методы станут публичным, чтобы можно было законно переопределять.

Есть набор ограничений, которым стоит следовать, когда используются реактивные вьюшки и боксы:

  * корневая вьюшка `app` должна быть обязательно ноускриптовой;
  * реактивный бокс создаётся только когда он был описан как дочерний элемент реактивной вьюшки. В этом случае обычный бокс создан не будет. Поэтому стоит озаботится о подключении `ns.BoxReact` к приложению.

Сама реализация `ns.ViewReact`, `ns.ViewReactCollection`, `ns.BoxReact` может находиться в отдельном репо и подключаться к ns в виде плагина, по аналогии с босфорусом.

## <a name="ns-view-react"></a>API ns.ViewReact
`ns.ViewReact` - это наследник `ns.View`, который вместо YATE использует `ReactComponent`.
Выделяется 3 типа связанных компонентов с `ns.ViewReact`:

 * `none` - компонент ещё не создавался (отсутствует).
 * `root` - корневой компонент. С него начинается создание вложенных в `ns.ViewReact` компонентов (других `ns.ViewReact`).
 * `child` - дочерний компонент. Это компонент, который размещён в какому-то `root` на любом уровне вложенности.
 * `destroyed` - компонент уничтожен в момент уничтожения `ns.ViewReact`.

Такое деление было введено для того, чтобы понимать, когда необходимо вызвать `ReactDOM.render`, а когда `forceUpdate` для `ReactComponent`.

Каждый раз, когда `_updateHTML` вызывается у `ns.ViewReact`, происходит актуализация состояния вложенных в неё вью. Это позволяет выяснить, какая часть дерева стала невалидной и перерисовать её. При первом вызове - невалидно всё дерево.

Перерисовка чаще всего вызывается на `root` компоненте. Но возможен вызов и на `child` компоненте. Например, если `ns.ViewReact`, содержащая `child` компонент, является асинхронной или обновление было вызвано через метод `ns.ViewReact~update`.

## <a name="ns-view-react__mixComponent"></a>#mixComponent
Статичный метод `ns.ViewReact`, позволяющий расширить описанный при декларации view компонент базовым миксином, обеспечивающим отрисовку компонента по описанным выше правилам.

## <a name="ns-view-react__createClass"></a>#createClass
Статичный метод `ns.ViewReact`. Создаёт React компонент по его декларации, который потом будет использоваться для рендринга.

## <a name="ns-view-react__getChildView"></a>#getChildView
Позволяет получить дочернее `ns.ViewReact` по указанному `id` (в случае `ns.ViewCollection` по указанной модели). Используется в методе `createChildren` связанного с view компонента, что позволяет при наследовании при необходимости переопределить поведение.

## <a name="ns-view-react__forEachItem"></a>#forEachItem
Проходит по всем доступным для работы дочерним view для `ns.ViewReact`. В случае бокса - это активные вью, в случае коллекции - это активные элементы коллекции. Данный метод служит точкой переопределения перебора дочерних элементов в `createChildren` методе компонента.

## <a name="ns-view-react__createElement"></a>#createElement
Создаёт React элемент c указанием `view` и `models` в `props`. В качестве ключа использует `ns.ViewReact~__uniequeId`. Также позволяет передать дополнительный `props` для создаваемого компонента.

## <a name="ns-view-react__reactComponentType"></a>#reactComponentType
Тип React компонента.

 * `none` (по умолчанию) - компонент ещё не создан
 * `root` - корневой (родительский) компонент
 * `child` - дочерний компонент
 * `destroyed` - компонент уничтожен

## <a name="ns-view-react__softDestroy"></a>#softDestroy
"Тихо" удлаяет React компонент, связанный с `ns.ViewReact`. Для этого, `ns.ViewReact` помечается типом, что компонент уничтожен, и уничтожается. Сам же компонент будет удалён при первом же `ns.Update`.
Используется в `ns.ViewReactCollection`.

## <a name="ns-view-react-collection"></a>API ns.ViewReactCollection
Коллекция наследуется от `ns.ViewReact`, поэтому имеет схожее с ним API. Определение коллекции производится аналогично `ns.ViewCollection`. Отличием является то, что элементы `ns.ViewReactCollection` - это реактивные вью `ns.ViewReact`. Поэтому они должны быть определены через `ns.ViewReact.define`.

Пример создания коллекции:

```js
ns.Model.define('list', {
    split: {
        items: '/',
        params: {
            'id': '.id'
        },
        model_id: 'item'
    },

    methods: {
        request: function() {
            return Vow.fulfill([
                {id: 1, value: 1},
                {id: 2, value: 2},
                {id: 3, value: 3}
            ]).then(function(data) {
                this.setData(data);
            }, this);
        }
    }
});

ns.Model.define('item', {
    params: {
        id: null
    }
});

ns.ViewReactCollection.define('list', {
    models: ['list'],
    split: {
        byModel: 'list',
        intoViews: 'item'
    },
    component: {
        render: function() {
            return React.createElement(
                'div',
                { className: 'list' },
                this.createChildren()
            )
        }
    }
});

ns.ViewReact.define('item', {
    models: ['item'],
    component: {
        render: function() {
            return React.createElement(
                'div',
                { className: 'item' },
                this.state.item.value
            )
        }
    }
});

```

## <a name="ns-box-react"></a>API ns.BoxReact
Поведение `ns.BoxRact`, его методы и описание в `layout` полностью соответствует `ns.Box`. Поэтому каких-то особых правил описания его в `lyaout` нет.

## <a name="react-component"></a>API ReactComponent

Каждый компонент, связанный с реактивной вьюшкой, расширяет поведение реакт-компонента с помощью специального миксина.

### <a name="react-component__getModelData"></a>getModelData

Возвращает данный указанной модели по определенному jpath. Если jpath не указан — вернутся все данные.

```js
ns.ViewReact.define('articleCaption', {
    models: ['article'],
    component: {
        render: function() {
            return React.createElement(
                'h1',
                { className: 'article-caption' },
                // YATE: model('article').caption
                this.getModelData('article', '.caption')
            )
        }
    }
});
```

### <a name="react-component__createChildren"></a>createChildren
Аналог `apply /.views.view ns-view` или `apply /.views.* ns-view` в `yate`.

Создаст реакт-элементы для указанных реактивных вьюшек, если они есть среди активных потомков текущей вьюшки. Если указанной вьюшки нет, вернет null. Позволяет передать `props` для создаваемых реакт-элементов.

Возможные варианты вызова:

```javascript
this.createChildren() // создаст компоненты для всех дочерних view

this.createChildren({length: 25}); // создаст компоненты для всех дочерних view и передаст им указанные props

this.createChildren('child-view') // создаст дочернее view с id `child-view`.

this.createChildren('child-view', {length: 25}) // создаст дочернее view с id `child-view` и передаст в неё указанные props

this.createChildren(['child-view1', 'child-view2']); // создаст дочерние view с id `child-view1`, `child-view2`

this.createChildren(['child-view1', 'child-view2'], {length: 25}); // создаст дочерние view с id `child-view1`, `child-view2`  и передаст в них указанные props
```

**Различия:**

1. Для `ns.ViewReact` метод принимает `id` вьюшек, которые нужно создать, и `props` для их компонентов.
2. Для `ns.ViewReactCollection` метод принимает модели коллекций, с которыми связаны создаваемые вьюшки, и `props` для компонентов элементов коллекции.
