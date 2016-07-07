describe('ns.ViewReactStaticMixin', function() {

    describe('#mixComponent', function() {

        it('должен добавить собственную реализацию метода render, если он не был указан', function() {
            var componentDecl = ns.ViewReactStaticMixin.mixComponent('view-id');

            expect(componentDecl.render).to.equal(ns.ViewReactStaticMixin.render);
        });

        it('должен оставить указанный метод render', function() {
            var render = this.sinon.stub();
            var componentDecl = ns.ViewReactStaticMixin.mixComponent('view-id', {
                render: render
            });

            expect(componentDecl.render).to.equal(render);
        });

        it('должен добавить в mixins компонента ns.BaseReactMixin', function() {
            var componentDecl = ns.ViewReactStaticMixin.mixComponent('view-id', {});

            expect(componentDecl.mixins[0]).to.equal(ns.BaseReactMixin);
        });

        it('должен записать в displayName компонента переданный id', function() {
            var componentDecl = ns.ViewReactStaticMixin.mixComponent('view-id', {});

            expect(componentDecl.displayName).to.equal('view-id');
        });

        it('должен записать в displayName переданный параметр', function() {
            var componentDecl = ns.ViewReactStaticMixin.mixComponent('viewId', {
                displayName: 'other-fancy-name'
            });

            expect(componentDecl.displayName).to.equal('other-fancy-name');
        });

        it('должен приводить displayName из camelCase к camel-case', function() {
            var componentDecl = ns.ViewReactStaticMixin.mixComponent('camelCase', {});

            expect(componentDecl.displayName).to.equal('camel-case');
        });

    });

    describe('#render', function() {

        beforeEach(function() {
            this.componentDecl = {
                render: ns.ViewReactStaticMixin.render,
                createChildren: this.sinon.stub()
            };
            this.view = {
                isLoading: this.sinon.stub()
            };
            this.component = React.createClass(this.componentDecl);
            this.element = React.createElement(this.component, {
                view: this.view
            });
            this.componentDOMContainer = document.createElement('div');
            this.renderedElement = ReactDOM.render(this.element, this.componentDOMContainer);
        });

        afterEach(function() {
            ReactDOM.unmountComponentAtNode(this.componentDOMContainer);
        });

        it('должен для загружаемого view не рисовать дочерние виды', function() {
            this.view.isLoading.returns(true);
            this.renderedElement = ReactDOM.render(this.element, this.componentDOMContainer);

            expect(this.componentDecl.createChildren).to.be.notCalled;
        });

        it('должен для загруженного view отобразить дочерние виды', function() {
            this.view.isLoading.returns(false);
            this.renderedElement = ReactDOM.render(this.element, this.componentDOMContainer);

            expect(this.componentDecl.createChildren).to.be.calledOnce;
        });

    });

    describe('#createClass', function() {

        beforeEach(function() {
            this.componentDecl = {
                render: function() {
                    return React.createElement('div');
                }
            };
            this.component = ns.ViewReactStaticMixin.createClass(this.componentDecl);
            this.element = React.createElement(this.component);
            this.componentDOMContainer = document.createElement('div');
            this.renderedElement = ReactDOM.render(this.element, this.componentDOMContainer);
        });

        it('должен создать React компонент', function() {
            expect(ReactTestUtils.isCompositeComponent(this.renderedElement)).to.be.true;
        });

        it('должен использовать переданную декларацию компонента', function() {
            expect(this.renderedElement.render).to.equal(this.componentDecl.render);
        });

    });

    describe('#getDisplayNameById', function() {
        it('должен возвращать my-super-view по указанному айдишнику вьюшки mySuperView', function() {
            expect(ns.ViewReactStaticMixin.getDisplayNameById('mySuperView')).to.be.eql('my-super-view');
        });
    });

});
