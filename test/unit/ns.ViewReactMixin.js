describe('ns.ViewReactMixin', function() {

    beforeEach(function() {
        ns.View.define('test', {
            methods: [ns.ViewReactMixin, {
                _baseClass: ns.View.prototype
            }]
        });
        ns.View.define('childView1', {
            methods: [ns.ViewReactMixin, {
                _baseClass: ns.View.prototype
            }]
        });
        ns.View.define('childView2', {
            methods: [ns.ViewReactMixin, {
                _baseClass: ns.View.prototype
            }]
        });

        this.view = ns.View.create('test');
        this.childView1 = ns.View.create('childView1');
        this.childView2 = ns.View.create('childView2');

        this.view.views = {
            childView1: this.childView1,
            childView2: this.childView2
        };
    });

    describe('#hideAndUnbindEvents', function() {

        beforeEach(function() {
            this.sinon.stub(ReactDOM, 'unmountComponentAtNode');
        });

        it('должен вызвать удаление компонента для `root` React компонента, если флаг UNMOUNT_MODE равен true', function() {
            this.sinon.stub(ns, 'REACT_UNMOUNT_MODE', true);

            this.view.reactComponentType = 'root';
            this.view.hideAndUnbindEvents();

            expect(ReactDOM.unmountComponentAtNode).to.be.called;
        });

        it('не должен вызвать удаление компонента для `root` React компонента, если флаг UNMOUNT_MODE равен false', function() {
            this.sinon.stub(ns, 'REACT_UNMOUNT_MODE', false);

            this.view.reactComponentType = 'root';
            this.view.hideAndUnbindEvents();

            expect(ReactDOM.unmountComponentAtNode).to.be.notCalled;
        });

        ['root', 'child', 'none'].forEach(function(componentType) {
            it('должен указать, что view не связано с компонентом для `' + componentType + '` React компонента', function() {
                this.view.reactComponentType = componentType;
                this.view.hideAndUnbindEvents();

                expect(this.view.reactComponentType).to.be.equal('none');
            });
        });

        it('не должен указывать, что view не связано с компонентом для `destroyed` React компонента', function() {
            this.view.reactComponentType = 'destroyed';
            this.view.hideAndUnbindEvents();

            expect(this.view.reactComponentType).to.be.equal('destroyed');
        });

        ['child', 'none', 'destroyed'].forEach(function(componentType) {
            it('не должен вызвать удаление `' + componentType + '` React компонента', function() {
                this.view.reactComponentType = componentType;
                this.view.hideAndUnbindEvents();

                expect(ReactDOM.unmountComponentAtNode).to.be.notCalled;
            });
        });

        it('должен указать, что view скрыто', function() {
            this.view._visible = true;
            this.view.hideAndUnbindEvents();

            expect(this.view.isVisible()).to.be.false;
        });

    });

    describe('#getChildView', function() {

        it('должен вернуть дочернее view по переданному id', function() {
            var childView1 = this.view.getChildView('childView1');

            expect(childView1).to.equal(this.childView1);
        });

        it('должен вернуть null, если дочернего вью с указанным id не существует', function() {
            var childView3 = this.view.getChildView('childView3');

            expect(childView3).to.equal(null);
        });

    });

    describe('#forEachItem', function() {

        it('должен пройти по дочерним view и передать их первым аргументом указанной функции', function() {
            var views = [];
            this.view.forEachItem(function(childView) {
                views.push(childView);
            });

            expect(views).to.deep.equal([
                this.childView1,
                this.childView2
            ]);
        });

    });

    describe('#hasReactComponent', function() {

        it('должно вернуть true, если для view имеет отображение ввиде React компонента', function() {
            this.view.reactComponentType = 'root';

            expect(this.view.hasReactComponent()).to.be.true;
        });

        it('должно вернуть false, если отображение ввиде React компонента уничтожено (т.е. создаваться больше не будет)', function() {
            this.view.reactComponentType = 'destroyed';

            expect(this.view.hasReactComponent()).to.be.false;
        });

        it('должно вернуть false, если view не имеет отображения ввиде React компонента (может использоваться для удаления `child` React компонента)', function() {
            this.view.reactComponentType = 'none';

            expect(this.view.hasReactComponent()).to.be.false;
        });

    });

    describe('#createElement', function() {

        beforeEach(function() {
            this.viewModels = {};
            this.view.models = this.viewModels;
            this.sinon.stub(this.view, 'hasReactComponent');
            this.view.info.componentClass = React.createClass({
                render: function() {
                    return React.createElement('div', this.props);
                }
            });
        });

        it('должен созать React элемент, если view имеет отображение ввиде React компонента', function() {
            this.view.hasReactComponent.returns(true);

            expect(ReactTestUtils.isElement(this.view.createElement())).to.be.true;
        });

        it('не должен создавать React элемент, если view не имеет отображения ввиде React компонента', function() {
            this.view.hasReactComponent.returns(false);

            expect(ReactTestUtils.isElement()).to.be.false;
        });

        it('должен расширить props создаваемого элемента переданным объектом', function() {
            this.view.hasReactComponent.returns(true);
            var element = this.view.createElement({
                someProps: true
            });

            expect(element.props).to.have.property('someProps', true);
        });

    });

    describe('#renderToString', function() {

        beforeEach(function() {
            this.sinon.stub(this.view, '_prepareRenderElement');
            this.sinon.stub(this.view, 'createElement');
            this.sinon.stub(window.ReactDOMServer, 'renderToString');
        });

        ['none', 'root'].forEach(function(type) {

            describe('для компонента типа `' + type + '`', function() {
                beforeEach(function() {
                    this.view.reactComponentType = type;
                    this.view.renderToString();
                });

                it('должен вызвать подготовку данных для отрисовки элемента', function() {
                    expect(this.view._prepareRenderElement).to.be.calledWith('root');
                });

                it('должен создать React компонент представления', function() {
                    expect(this.view.createElement).to.be.called;
                });

                it('должен вызвать отрисовку текстового HTML компонента', function() {
                    expect(ReactDOMServer.renderToString).to.be.called;
                });
            });

        });

        ['child'].forEach(function(type) {
            describe('для компонента типа `' + type + '`', function() {

                beforeEach(function() {
                    this.view.reactComponentType = type;
                });

                it('должен вызвать ошибку запроса отрисовки', function() {
                    expect(this.view.renderToString.bind(this.view)).to.be.throw(Error);
                });

            });
        });

    });

    describe('#_updateHTML', function() {

        beforeEach(function() {
            this.sinon.stub(this.view, '_prepareRenderElement');
            this.sinon.stub(this.view, '_renderElement');
            this.sinon.stub(this.view, '_extractNode');
            this.viewNode = document.createElement('div');
        });

        describe('view не имеет отображения ввиде React компонента (`none`) ->', function() {

            beforeEach(function() {
                this.view.reactComponentType = 'none';
                this.sinon.stub(this.view, 'isValid');
            });

            it('должен получить node, если view не валидно', function() {
                this.view.isValid.returns(false);
                this.view._extractNode.returns(this.viewNode);
                this.view._updateHTML(this.viewNode);

                expect(this.view.node).to.equal(this.viewNode);
            });

            it('должен сообщить об ошибке, если node для невалидной view не найдено', function() {
                this.view.isValid.returns(false);
                this.view._extractNode.returns(null);

                expect(function() {
                    this.view._updateHTML(this.viewNode);
                }).to.throw(TypeError);
            });

            it('должен подготовить отрисовку view как `root` компонент', function() {
                this.view.isValid.returns(true);
                this.view._updateHTML(this.viewNode);

                expect(this.view._prepareRenderElement).to.be.calledWith('root');
            });

            it('должен запустить отрисовку компонента', function() {
                this.view.isValid.returns(true);
                this.view._updateHTML(this.viewNode);

                expect(this.view._renderElement).to.be.called;
            });

        });

        describe('view имеет отображение ввиде React компонента `root`', function() {

            beforeEach(function() {
                this.view.reactComponentType = 'root';
                this.oldNode = document.createElement('div');
                this.view.node = this.oldNode;

                this.sinon.stub(this.view, 'hideAndUnbindEvents');
                this.sinon.stub(this.view, '_updateNode', function(node) {
                    this.view.node = node;
                }.bind(this));
            });

            afterEach(function() {
                delete this.view.node;
            });

            it('должен обновить node и отвязать компонент от старой, если у родительской ns.View изменился HTML', function() {
                this.view._updateHTML(this.viewNode, { toplevel: false, parent_added: true });

                expect(this.view.node).to.be.equal(this.viewNode);
                expect(this.view.hideAndUnbindEvents).to.be.calledOnce;
            });

            it('не должен обновлять node и не отвязывать компонент от старой, если он является родительским элементом обновления', function() {
                this.view._updateHTML(this.viewNode, { toplevel: true, parent_added: false });

                expect(this.view.node).to.be.equal(this.oldNode);
                expect(this.view.hideAndUnbindEvents).to.be.notCalled;
            });

            it('не должен обновлять node и не отвязывать компонент от старой, если у родитеского ns.View изменился HTML, но не приминился', function() {
                this.view._updateHTML(this.viewNode, { toplevel: false, parent_added: false });

                expect(this.view.node).to.be.equal(this.oldNode);
                expect(this.view.hideAndUnbindEvents).to.be.notCalled;
            });

            it('должен подготовить отрисовку view как `root` компонент', function() {
                this.view._updateHTML(this.viewNode);

                expect(this.view._prepareRenderElement).to.be.calledWith('root');
            });

            it('должен запустить отрисовку `root` компонента', function() {
                this.view.reactComponentType = 'root';
                this.view._updateHTML(this.viewNode);

                expect(this.view._renderElement).to.be.called;
            });

        });

        describe('view имеет отображение ввиде React компонента `child` ->', function() {

            it('должен подготовить отрисовку view как `child` компонент', function() {
                this.view.reactComponentType = 'child';
                this.view._updateHTML(this.viewNode);

                expect(this.view._prepareRenderElement).to.be.calledWith('child');
            });

            it('должен запустить отрисовку `child` компонента', function() {
                this.view.reactComponentType = 'child';
                this.view._updateHTML(this.viewNode);

                expect(this.view._renderElement).to.be.called;
            });

        });

        describe('у view уничтожен React компонент (`destroyed`)', function() {

            beforeEach(function() {
                this.view.reactComponentType = 'destroyed';
            });

            it('не должен подготавливать отрисовку view', function() {
                expect(this.view._prepareRenderElement).to.be.notCalled;
            });

            it('не должен запускать отрисовку компонента', function() {
                this.view._updateHTML(this.viewNode);

                expect(this.view._renderElement).to.be.notCalled;
            });

        });

    });

    describe('#_renderElement', function() {

        beforeEach(function() {
            this.element = {};
            this.node = {};

            this.view.node = this.node;
            this.sinon.stub(this.view, 'createElement').returns(this.element);
            this.sinon.stub(this.view, '_onChildrenDestroyed');
            this.sinon.stub(this.view, 'trigger');

            this.sinon.stub(ReactDOM, 'render');
        });

        describe('`root` компонент ->', function() {

            beforeEach(function() {
                this.view.reactComponentType = 'root';
            });

            it('должен отрисовать элемент', function() {
                this.view._renderElement();

                expect(ReactDOM.render).to.be.calledWithExactly(this.element, this.node);
            });

            it('должен связать обработчик _onDestroy с функцией обработки', function() {
                this.view._renderElement();
                this.view.createElement.getCall(0).args[0]._onDestroy();

                expect(this.view._onChildrenDestroyed).to.be.called;
            });

        });

        it('должен для `child` компонента вызвать событие `ns-view-react-force-update` которое подхватить сам компонент', function() {
            this.view.reactComponentType = 'child';
            this.view._renderElement();

            expect(this.view.trigger).to.be.calledWithExactly('ns-view-react-force-update');
        });

        ['none', 'destroyed'].forEach(function(componentType) {
            it('ничего не делат для `' + componentType + '` компонента', function() {
                this.view.reactComponentType = 'none';

                expect(ReactDOM.render).to.be.notCalled;
                expect(this.view.trigger).to.be.notCalled;
            });
        });

    });

    describe('#_onChildrenDestroyed', function() {

        beforeEach(function() {
            this.sinon.stub(this.view, '_prepareRenderElement');
            this.sinon.stub(this.view, '_renderElement');
        });

        it('должен вызывать подготовку отрисовки `root` элемента', function() {
            this.view._onChildrenDestroyed();

            expect(this.view._prepareRenderElement).to.be.calledWith('root');
        });

        it('должен вызывать отрисовку компонента', function() {
            this.view._onChildrenDestroyed();

            expect(this.view._renderElement).to.be.called;
        });

    });

    describe('#_applyProperties', function() {

        beforeEach(function() {
            this.sinon.stub(this.view, '_saveModelsVersions');
            this.view.reactComponentType = 'none';
            this.view._visible = false;
            this.view.status = ns.V.STATUS.NONE;
        });

        describe('компонент уничтожен (`destroyed`) ->', function() {

            beforeEach(function() {
                this.view.reactComponentType = 'destroyed';
                this.view._applyProperties('root');
            });

            it('не должен изменять тип компонента', function() {
                expect(this.view.reactComponentType).to.be.equal('destroyed');
            });

            it('не должен менять status view', function() {
                expect(this.view.status).to.be.equal(ns.V.STATUS.NONE);
            });

            it('не должен изменять видимость view', function() {
                expect(this.view.isVisible()).to.be.false;
            });

            it('не должен обновлять версии моделей', function() {
                expect(this.view._saveModelsVersions).to.be.notCalled;
            });

        });

        it('должен проставить указанный тип отрисовываемого компонента', function() {
            this.view._applyProperties('root');

            expect(this.view.reactComponentType).to.be.equal('root');
        });

        it('дожен установить статус view на `LOADING`, если она загружается', function() {
            this.view.asyncState = true;
            this.view._applyProperties('child');

            expect(this.view.isLoading()).to.be.true;
        });

        it('дожен установить статус view на `OK`, если она загружена', function() {
            this.view.asyncState = false;
            this.view._applyProperties('root');

            expect(this.view.isOk()).to.be.true;
        });

        ['child', 'root'].forEach(function(componentType) {
            it('должен сделать видимой view с `' + componentType + '` компонентом', function() {
                this.view._applyProperties(componentType);

                expect(this.view.isVisible()).to.be.true;
            });
        });

        it('должен сделать невидимым view с `none` компонентом', function() {
            this.view._applyProperties('none');

            expect(this.view.isVisible()).to.be.false;
        });

    });

    describe('#_prepareRenderElement', function() {

        beforeEach(function() {
            this.sinon.stub(this.view, 'beforePrepareRenderElement');
            this.sinon.stub(this.view, 'isValidSelf');
            this.sinon.stub(this.view, 'hasChildrenNeedBeUpdated');
            this.sinon.stub(this.view, 'hasReactComponent');
            this.sinon.stub(this.view, '_applyProperties');
            this.sinon.spy(this.view, '__bindModelsEvents');
        });

        it('не должен проводить подготовку отрисовку компонента для `destroyed` компонента', function() {
            this.view.reactComponentType = 'destroyed';
            this.view._prepareRenderElement('root');

            expect(this.view.beforePrepareRenderElement).to.be.notCalled;
        });

        describe('должен обновиться ->', function() {

            beforeEach(function() {
                this.view.resetStateOfUpdate();
            });

            it('является невалидным', function() {
                this.view.hasChildrenNeedBeUpdated.returns(false);
                this.view.hasReactComponent.returns(true);
                this.view.isValidSelf.returns(false);

                this.view._prepareRenderElement('root');

                expect(this.view.hasStateOfUpdate()).to.be.true;
            });

            it('имеет хотя бы одного потомка, который должен быть обновиться', function() {
                this.view.hasChildrenNeedBeUpdated.returns(true);
                this.view.hasReactComponent.returns(true);
                this.view.isValidSelf.returns(true);

                this.view._prepareRenderElement('root');

                expect(this.view.hasStateOfUpdate()).to.be.true;
            });

            it('ещё не имеет связанного React компонента', function() {
                this.view.hasChildrenNeedBeUpdated.returns(false);
                this.view.hasReactComponent.returns(false);
                this.view.isValidSelf.returns(true);

                this.view._prepareRenderElement('root');

                expect(this.view.hasStateOfUpdate()).to.be.true;
            });

        });

        it('должен обновить свойства компонента согласно переданного типа', function() {
            this.view._prepareRenderElement('child');

            expect(this.view._applyProperties).to.be.calledWithExactly('child');
        });

        it('должен при первой подготовке к отрисовке подсписаться на события моделей', function() {
            this.view._prepareRenderElement('root');
            this.view._prepareRenderElement('root');

            expect(this.view.__bindModelsEvents).to.be.calledOnce;
        });

    });

    describe('#hasChildrenNeedBeUpdated', function() {

        beforeEach(function() {
            this.childView1._prepareRenderElement = this.sinon.stub();
            this.childView2._prepareRenderElement = this.sinon.stub();
        });

        it('должен подготовить дочерние view к отрисовке', function() {
            this.view.hasChildrenNeedBeUpdated();

            expect(this.childView1._prepareRenderElement).to.be.calledWith('child');
            expect(this.childView2._prepareRenderElement).to.be.calledWith('child');
        });

        it('должен вернуть true, если хотя бы один потомок нуждается в обновление (отрисовке/перерисовке)', function() {
            this.childView1._needBeUpdated = true;

            expect(this.view.hasChildrenNeedBeUpdated()).to.be.true;
        });

        it('должен вернуть false, если все потомки не нуждаются в обновлении (отрисовке/перерисовке)', function() {
            this.childView1._needBeUpdated = false;
            this.childView2._needBeUpdated = false;

            expect(this.view.hasChildrenNeedBeUpdated()).to.be.false;
        });

    });

    describe('#_applyDestroyedComponentType', function() {

        it('должен проставить тип React компонента - `destroyed` ', function() {
            this.view.reactComponentType = 'root';
            this.view._applyDestroyedComponentType();

            expect(this.view.reactComponentType).to.equal('destroyed');
        });

        it('должен проставить всем потомкам тип React компонента - `destroyed`', function() {
            this.childView1.reactComponentType = 'child';
            this.childView2.reactComponentType = 'child';
            this.view._applyDestroyedComponentType();

            expect(this.childView1.reactComponentType).to.equal('destroyed');
            expect(this.childView2.reactComponentType).to.equal('destroyed');
        });

    });

    describe('#_destroyComponent', function() {

        beforeEach(function() {
            this.sinon.stub(this.view, '_applyDestroyedComponentType');
            this.sinon.stub(ReactDOM, 'unmountComponentAtNode');
        });

        ['root', 'child', 'none'].forEach(function(componentType) {
            it('должен отметить `' + componentType + '` React компонент как уничтоженный', function() {
                this.view.reactComponentType = componentType;
                this.view._destroyComponent();

                expect(this.view._applyDestroyedComponentType).to.be.called;
            });
        });

        it('должен вызывать событие уничтожения компонента для `child` React компонента', function() {
            this.sinon.stub(this.view, 'trigger');
            this.view.reactComponentType = 'child';
            this.view._destroyComponent();

            expect(this.view.trigger).to.be.calledWithExactly('ns-view-react-destroy');
        });

        it('должен вызвать удаление компонента для `root` React компонента', function() {
            this.view.reactComponentType = 'root';
            this.view._destroyComponent();

            expect(ReactDOM.unmountComponentAtNode).to.be.called;
        });

    });

    describe('#softDestroy', function() {

        beforeEach(function() {
            this.sinon.stub(this.view, '_applyDestroyedComponentType');
            this.sinon.spy(this.view._baseClass, 'destroy');
        });

        ['root', 'child', 'none'].forEach(function(componentType) {
            it('должен отметить `' + componentType + '` React компонент как уничтоженный', function() {
                this.view.reactComponentType = componentType;
                this.view.softDestroy();

                expect(this.view._applyDestroyedComponentType).to.be.called;
            });
        });

        it('должен вызвать destroy базового класса', function() {
            this.view.softDestroy();

            expect(this.view._baseClass.destroy).to.be.called;
        });

    });

    describe('#destroy', function() {

        beforeEach(function() {
            this.sinon.spy(this.view, '_destroyComponent');
            this.sinon.stub(ReactDOM, 'unmountComponentAtNode');
            this.sinon.stub(this.view, 'trigger');
        });

        ['root', 'child', 'none', 'destroyed'].forEach(function() {
            it('должен вызвать уничтожение компонента', function() {
                this.view.destroy();

                expect(this.view._destroyComponent).to.be.called;
            });
        });

        it('не должен вызывать для дочерних view _destroyComponent', function() {
            this.view.destroy();

            expect(this.childView1._destroyComponent).to.be.notCalled;
            expect(this.childView2._destroyComponent).to.be.notCalled;
        });

    });

});
