describe('ns.BaseReactMixin', function() {

    beforeEach(function() {
        // Тестовая модель для компонента
        ns.Model.define('test', {});
        this.model = ns.Model.get('test');
        this.model.setData({
            someJpath: 1
        });

        // Тестовая ns.View для компонента
        ns.View.define('test', {
            models: ['test']
        });
        this.view = ns.View.create('test');

        // Создание тестового компонента
        this.component = React.createClass({
            displayName: 'testComponent',
            mixins: [ns.BaseReactMixin],
            render: function() {
                return React.createElement(
                    'div',
                    {
                        className: 'testComponentDiv'
                    },
                    this.props.content
                );
            }
        });
        this.props = {
            _onDestroy: this.sinon.stub(),
            content: 'content1',
            models: this.view.models,
            view: this.view,
            key: this.view.__uniqueId
        };
        this.element = React.createElement(this.component, this.props);
        this.componentDOMContainer = document.createElement('div');
        this.renderedElement = ReactDOM.render(this.element, this.componentDOMContainer);
    });

    afterEach(function() {
        this.view.destroy();
        this.model.destroy();
        ReactDOM.unmountComponentAtNode(this.componentDOMContainer);
    });

    describe('обработка события `ns-view-react-force-update` ->', function() {
        beforeEach(function() {
            this.sinon.stub(this.renderedElement, 'forceUpdate');
        });

        it('компонент должен принудильено обновится при его вызове', function() {
            this.view.trigger('ns-view-react-force-update');

            expect(this.renderedElement.forceUpdate).to.be.calledOnce;
        });

        it('компонент должено отписаться от него при удалении', function() {
            ReactDOM.unmountComponentAtNode(this.componentDOMContainer);
            this.view.trigger('ns-view-react-force-update');

            expect(this.renderedElement.forceUpdate).to.be.notCalled;
        });

    });

    describe('обработка событий `ns-view-react-destroy` ->', function() {

        it('компонент должен вызывать обработчик удаления при его вызове', function() {
            this.view.trigger('ns-view-react-destroy');

            expect(this.props._onDestroy).to.be.calledOnce;
        });

        it('компонент должен отписаться от него при удалении', function() {
            ReactDOM.unmountComponentAtNode(this.componentDOMContainer);
            this.view.trigger('ns-view-react-destroy');

            expect(this.props._onDestroy).to.be.notCalled;
        });

    });

    describe('обновление компонента ->', function() {

        it('должен не обновляться "планово", если view имеет флаг _needBeUpdated=false', function() {
            this.view._needBeUpdated = false;
            this.props.content = 'content2';
            var element = React.createElement(this.component, this.props);
            ReactDOM.render(element, this.componentDOMContainer);

            var div = ReactTestUtils.findRenderedDOMComponentWithTag(
                this.renderedElement, 'div'
            );

            expect(ReactDOM.findDOMNode(div).textContent).to.equal('content1');
        });

        it('должен обновится "планово", если view имеет флаг _needBeUpdated=true', function() {
            this.view._needBeUpdated = true;
            this.props.content = 'content2';
            var element = React.createElement(this.component, this.props);
            ReactDOM.render(element, this.componentDOMContainer);

            var div = ReactTestUtils.findRenderedDOMComponentWithTag(
                this.renderedElement, 'div'
            );

            expect(ReactDOM.findDOMNode(div).textContent).to.equal('content2');
        });
    });

    describe('#createChildren', function() {

        describe('строки в качестве id (в случае с обычными view) ->', function() {
            beforeEach(function() {
                this.childView1Element = {};
                var childView1 = this.childView1 = {
                    id: 'child-view1',
                    createElement: this.sinon.stub().returns(this.childView1Element)
                };

                this.childView2Element = {};
                var childView2 = this.childView2 = {
                    id: 'child-view2',
                    createElement: this.sinon.stub().returns(this.childView2Element)
                };

                this.childView3Element = {};
                var childView3 = this.childView3 = {
                    id: 'child-view3',
                    createElement: this.sinon.stub().returns(this.childView3Element)
                };

                this.view.getChildView = function(id) {
                    switch (id) {
                        case 'child-view1':
                            return childView1;
                        case 'child-view2':
                            return childView2;
                        case 'child-view3':
                            return childView3;
                        default:
                            return null;
                    }
                };

                this.view.forEachItem = function(callback) {
                    callback(childView1);
                    callback(childView2);
                    callback(childView3);
                };
            });

            it('должен создать все дочерние view', function() {
                var elements = this.renderedElement.createChildren();

                expect(elements).to.deep.equal([
                    this.childView1Element,
                    this.childView2Element,
                    this.childView3Element
                ]);
            });

            it('должен передать props для всех дочерних view', function() {
                this.renderedElement.createChildren({ length: 25 });

                this.view.forEachItem(function(childView) {
                    var childViewProps = childView.createElement.getCall(0).args[0];
                    expect(childViewProps).to.have.property('length', 25);
                });
            });

            it('должен создать дочернее view с id=`child-view1`', function() {
                var elements = this.renderedElement.createChildren('child-view1');

                expect(elements).to.deep.equal([
                    this.childView1Element
                ]);
            });

            it('должен создать дочернее view с id=`child-view2` и передать в него props', function() {
                var elements = this.renderedElement.createChildren('child-view2', { length: 34 });
                var childView2Props = this.childView2.createElement.getCall(0).args[0];

                expect(elements).to.deep.equal([
                    this.childView2Element
                ]);
                expect(childView2Props).to.have.property('length', 34);
            });

            it('должен создать переданный массив id view [`child-view1`, `child-view3`]', function() {
                var elements = this.renderedElement.createChildren(['child-view1', 'child-view3']);

                expect(elements).to.deep.equal([
                    this.childView1Element,
                    this.childView3Element
                ]);
            });

            it('должен создать переданный массив id view [`child-view2`, `child-view3`] и передать в них props', function() {
                var elements = this.renderedElement.createChildren(['child-view2', 'child-view3'], { length: 41 });
                var childView2Props = this.childView2.createElement.getCall(0).args[0];
                var childView3Props = this.childView3.createElement.getCall(0).args[0];

                expect(elements).to.deep.equal([
                    this.childView2Element,
                    this.childView3Element
                ]);
                expect(childView2Props).to.have.property('length', 41);
                expect(childView3Props).to.have.property('length', 41);
            });


            it('должен создать дочерние элементы, передав в опции _onDestroy обработчик', function() {
                this.renderedElement.createChildren();

                this.view.forEachItem(function(childView) {
                    var childViewProps = childView.createElement.getCall(0).args[0];
                    expect(childViewProps).to.have.property('_onDestroy', this.renderedElement.__handleDestroy);
                }.bind(this));
            });

            it('должен вернуть [null], если запрашивают создание компонента для несуществующего вида', function() {
                expect(this.renderedElement.createChildren('child-view4')).to.deep.equal([null]);
            });
        });

        describe('модели в качестве id (в случае с коллекциями) ->', function() {
            beforeEach(function() {
                this.childView1Element = {};
                ns.Model.define('child-view1');
                var childView1Model = this.childView1Model = ns.Model.get('child-view1');
                var childView1 = this.childView1 = {
                    id: 'child-view1',
                    createElement: this.sinon.stub().returns(this.childView1Element)
                };

                this.childView2Element = {};
                ns.Model.define('child-view2');
                var childView2Model = this.childView2Model = ns.Model.get('child-view2');
                var childView2 = this.childView2 = {
                    id: 'child-view2',
                    createElement: this.sinon.stub().returns(this.childView2Element)
                };

                this.childView3Element = {};
                ns.Model.define('child-view3');
                var childView3Model = this.childView3Model = ns.Model.get('child-view3');
                var childView3 = this.childView3 = {
                    id: 'child-view3',
                    createElement: this.sinon.stub().returns(this.childView3Element)
                };

                this.view.getChildView = function(model) {
                    switch (model) {
                        case childView1Model:
                            return childView1;
                        case childView2Model:
                            return childView2;
                        case childView3Model:
                            return childView3;
                        default:
                            return null;
                    }
                };

                this.view.forEachItem = function(callback) {
                    callback(childView1);
                    callback(childView2);
                    callback(childView3);
                };
            });

            it('должен создать все дочерние view', function() {
                var elements = this.renderedElement.createChildren();

                expect(elements).to.deep.equal([
                    this.childView1Element,
                    this.childView2Element,
                    this.childView3Element
                ]);
            });

            it('должен передать props для всех дочерних view', function() {
                this.renderedElement.createChildren({ length: 25 });

                this.view.forEachItem(function(childView) {
                    var childViewProps = childView.createElement.getCall(0).args[0];
                    expect(childViewProps).to.have.property('length', 25);
                });
            });

            it('должен создать дочернее view `child-view1`, если указана его модели в качестве id', function() {
                var elements = this.renderedElement.createChildren(this.childView1Model);

                expect(elements).to.deep.equal([
                    this.childView1Element
                ]);
            });

            it('должен создать дочернее view `child-view2`, если указана его модели в качестве id, и передать в него props', function() {
                var elements = this.renderedElement.createChildren(this.childView2Model, { length: 34 });
                var childView2Props = this.childView2.createElement.getCall(0).args[0];

                expect(elements).to.deep.equal([
                    this.childView2Element
                ]);
                expect(childView2Props).to.have.property('length', 34);
            });

            it('должен создать дочернее view `child-view1` и `child-view3`, если указан массив их моделей в качестве id', function() {
                var elements = this.renderedElement.createChildren([this.childView1Model, this.childView3Model]);

                expect(elements).to.deep.equal([
                    this.childView1Element,
                    this.childView3Element
                ]);
            });

            it('должен создать дочернее view `child-view2` и `child-view3`, если указан массив их моделей в качестве id, и передать в них props', function() {
                var elements = this.renderedElement.createChildren([this.childView2Model, this.childView3Model], { length: 41 });
                var childView2Props = this.childView2.createElement.getCall(0).args[0];
                var childView3Props = this.childView3.createElement.getCall(0).args[0];

                expect(elements).to.deep.equal([
                    this.childView2Element,
                    this.childView3Element
                ]);
                expect(childView2Props).to.have.property('length', 41);
                expect(childView3Props).to.have.property('length', 41);
            });


            it('должен создать дочерние элементы, передав в опции _onDestroy обработчик', function() {
                this.renderedElement.createChildren();

                this.view.forEachItem(function(childView) {
                    var childViewProps = childView.createElement.getCall(0).args[0];
                    expect(childViewProps).to.have.property('_onDestroy', this.renderedElement.__handleDestroy);
                }.bind(this));
            });

            it('должен вернуть [null], если запрашивают создание компонента для несуществующего вида', function() {
                ns.Model.define('child-view4');
                expect(this.renderedElement.createChildren(ns.Model.get('child-view4'))).to.deep.equal([null]);
            });
        });

    });

    describe('#getModelData', function() {

        it('должен вызвать ошибку, если указанная модель не привязана к компоненту', function() {
            expect(function() {
                this.renderedElement.getModelData('not-test');
            }).to.throw(TypeError);
        });

        it('должен вызвать ошибку, если в указанной модели нет данных', function() {
            this.model._reset();
            expect(function() {
                this.renderedElement.getModelData('test');
            }).to.throw(TypeError);
        });

        it('должен вернуть все данные модели, если не указан jpath', function() {
            expect(this.renderedElement.getModelData('test')).to.deep.equal({
                someJpath: 1
            });
        });

        it('должен вернуть указанные в jpath данные модели', function() {
            expect(this.renderedElement.getModelData('test', '.someJpath')).to.equal(1);
        });

    });
});
