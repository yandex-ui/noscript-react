describe('ns.ViewReact интеграционные тесты ->', function() {
    describe('сочетание обычных ns.ViewReact ->', function() {

        beforeEach(function() {
            ns.layout.define('app', {
                app: {
                    'view-1': {
                        'view-1-1': true,
                        'view-1-2': {
                            'view-1-2-1': true
                        }
                    },
                    'view-2': {
                        'view-2-1': true
                    }
                }
            });

            ns.layout.define('app2', {
                app: {
                    'view-1': {
                        'view-1-1': true,
                        'view-1-2': {
                            'view-1-2-1': true
                        }
                    },
                    'view-3': {
                        'view-3-1': true
                    }
                }
            });

            ns.View.define('app');
            ns.ViewReact.define('view-1');
            ns.ViewReact.define('view-1-1');
            ns.ViewReact.define('view-1-2');
            ns.ViewReact.define('view-1-2-1');
            ns.ViewReact.define('view-2');
            ns.ViewReact.define('view-2-1');
            ns.ViewReact.define('view-3', {
                params: {
                    p: null
                }
            });
            ns.ViewReact.define('view-3-1');

            this.APP = ns.View.create('app');
        });

        it('должен собщить об ошибке, что view-3 не хватает данных для отрисовки', function() {
            ns.log.exception.restore();
            this.sinon.stub(ns.log, 'exception');
            return new ns.Update(this.APP, ns.layout.page('app2'), {})
                .render()
                .then(function() {
                    expect('fail way').to.be.false;
                }, function(e) {
                    expect(e).to.be.an.instanceof(Error);
                });
        });

        describe('данных хватает для отрисовки ->', function() {

            beforeEach(function() {
                return new ns.Update(this.APP, ns.layout.page('app2'), { p: 1 }).render();
            });

            [
                '.view-1',
                '.view-1 > .view-1-1',
                '.view-1 > .view-1-2',
                '.view-1 > .view-1-2 > .view-1-2-1',
                '.view-3',
                '.view-3 > .view-3-1'
            ].forEach(function(trunk) {

                it('должен отрисовать ветку дерева `' + trunk + '`', function() {
                    expect(this.APP.node.querySelectorAll(trunk)).to.be.have.length(1);
                });

            });

        });

        describe('обновление данных во вложенных view ->', function() {

            var views = [
                'view-1', 'view-1-1', 'view-1-2', 'view-1-2-1',
                'view-2', 'view-2-1'
            ];

            beforeEach(function() {
                return new ns.Update(this.APP, ns.layout.page('app'), {})
                    .render()
                    .then(function() {
                        views.forEach(function(viewId) {
                            var view = this.sinon.getViewByKey(this.APP, 'view=' + viewId);
                            view.resetStateOfUpdate();
                        }.bind(this));

                        this.view_1 = this.sinon.getViewByKey(this.APP, 'view=view-1');
                        this.view_1_2 = this.sinon.getViewByKey(this.APP, 'view=view-1-2');
                        this.view_1_2_1 = this.sinon.getViewByKey(this.APP, 'view=view-1-2-1');
                        this.view_1_2.invalidate();

                        return new ns.Update(this.APP, ns.layout.page('app'), {}).render();
                    }, this);
            });

            views.forEach(function(viewId) {

                it('должно пересчитать view `' + viewId + '`, если оно не валидно ', function() {
                    var view = this.sinon.getViewByKey(this.APP, 'view=' + viewId);

                    expect(view.hasStateOfUpdate()).to.be.equal(
                        view === this.view_1 ||
                        view === this.view_1_2 ||
                        view === this.view_1_2_1
                    );
                });

            });

        });

        it('должен удалить `root` `view-2`', function() {
            return new ns.Update(this.APP, ns.layout.page('app'), {})
                .render()
                .then(function() {

                    this.view_2 = this.sinon.getViewByKey(this.APP, 'view=view-2');
                    expect(this.APP.node.querySelectorAll('.view-2')).to.be.have.length(1);
                    this.view_2.destroy();
                    expect(this.APP.node.querySelectorAll('.view-2')).to.be.have.length(0);
                }, this);
        });

        it('должен удалить `child` `view-1-2-1`', function() {
            return new ns.Update(this.APP, ns.layout.page('app'), {})
                .render()
                .then(function() {

                    this.view_1_2_1 = this.sinon.getViewByKey(this.APP, 'view=view-1-2-1');
                    expect(this.APP.node.querySelectorAll('.view-1-2-1')).to.be.have.length(1);
                    this.view_1_2_1.destroy();
                    expect(this.APP.node.querySelectorAll('.view-1-2-1')).to.be.have.length(0);
                }, this);
        });

    });

    describe('использование асинхронных ns.ViewReact ->', function() {

        describe('перерисовка асинхронных ns.ViewReact ->', function() {

            beforeEach(function() {
                ns.layout.define('app', {
                    app: {
                        'async-view&': {
                            'async-view-child': true
                        }
                    }
                });

                ns.View.define('app');
                ns.ViewReact.define('async-view', {
                    models: ['async-view-model'],
                    component: {
                        render: function() {
                            if (this.props.view.isLoading()) {
                                return React.createElement(
                                    'span',
                                    { className: this.props.className }
                                );
                            } else {
                                return React.createElement(
                                    'div',
                                    { className: this.props.className },
                                    this.createChildren()
                                );
                            }
                        }
                    }
                });
                ns.ViewReact.define('async-view-child', { models: ['async-view-model'] });

                ns.Model.define('async-view-model');

                // set first data to model
                this.APP = ns.View.create('app');

                ns.test.modelsValidAutorespondByMock(this.sinon, {
                    '/models/?_m=async-view-model': {
                        models: [
                            {
                                data: {
                                    items: [
                                        { data: true }
                                    ]
                                }
                            }
                        ]

                    }
                });

                var layout = ns.layout.page('app', {});
                return new ns.Update(this.APP, layout, {})
                    .render()
                    .then(function(asyncPromises) {
                        this.asyncViewNode1 = this.APP.node.querySelector('.async-view');
                        return Vow.all(asyncPromises.async)
                            .then(function() {
                                this.asyncViewNode2 = this.APP.node.querySelector('.async-view');
                            }, this);
                    }, this);
            });

            it('"async-view" должно изменить ноду после загрузки её данных', function() {
                expect(this.asyncViewNode2).not.to.be.equal(this.asyncViewNode1);
            });

            it('"async-view" не должно иметь потомка при первой отрисовке', function() {
                expect(this.asyncViewNode1.childNodes).to.be.have.length(0);
            });

            it('"async-view" должно иметь потомка после загрузки данных', function() {
                expect(this.asyncViewNode2.querySelector('.async-view-child')).to.be.an.instanceof(Node);
            });

        });

    });

    describe('обновление HTML ns.View с вложенной ns.ViewReact', function() {
        beforeEach(function() {
            ns.layout.define('index', {
                app: {
                    yateView: {
                        reactView: true
                    }
                }
            });

            ns.View.define('app');
            ns.View.define('yateView');

            var _this = this;
            this.componentWillUnmount = this.sinon.stub();
            ns.ViewReact.define('reactView', {
                component: {
                    componentWillUnmount: function() {
                        _this.componentWillUnmount(this, ReactDOM.findDOMNode(this).parentNode);
                    }
                }
            });

            this.app = ns.View.create('app');
            var indexPageLayout = ns.layout.page('index');

            return new ns.Update(this.app, indexPageLayout, {})
                .render()
                .then(function() {
                    this.app.views.yateView.invalidate();
                    this.oldYateViewNode = this.app.node.querySelector('.ns-view-yateView');
                    this.oldReactViewNode = this.app.node.querySelector('.ns-view-reactView');

                    return new ns.Update(this.app, indexPageLayout, {})
                        .render();
                }, this);
        });

        it('должен изменить ноду у yateView', function() {
            var yateView = this.sinon.getViewByKey(this.app, 'view=yateView');
            var newYateNode = this.app.node.querySelector('.ns-view-yateView');

            expect(this.oldYateViewNode).to.be.not.equal(newYateNode);
            expect(yateView.node).to.be.equal(newYateNode);
        });

        it('должен отвязать компонент reactView от старой ноды', function() {
            var reactView = this.sinon.getViewByKey(this.app, 'view=reactView');
            var unmountedView = this.componentWillUnmount.getCall(0).args[0].props.view;
            var unmountedNode = this.componentWillUnmount.getCall(0).args[1];

            expect(unmountedView).to.be.equal(reactView);
            expect(unmountedNode).to.be.equal(this.oldReactViewNode);
            expect(this.componentWillUnmount).to.be.calledOnce;
        });

        it('должен привязать компонент reactView к новой ноде', function() {
            var reactView = this.sinon.getViewByKey(this.app, 'view=reactView');
            var newReactNode = this.app.node.querySelector('.ns-view-reactView');

            expect(this.oldReactViewNode).to.be.not.equal(this.app.node.querySelector('.ns-view-reactView'));
            expect(this.oldReactViewNode).to.be.not.equal(reactView.node);
            expect(reactView.node).to.be.equal(newReactNode);
        });
    });

    describe('вывод ns.ViewReact с ошибкой получения данных зависимой модели ->', function() {

        beforeEach(function(done) {

            ns.layout.define('app', {
                app: {
                    reactView: true
                }
            });

            ns.View.define('app');
            ns.Model.define('importantModel', {
                methods: {
                    request: function() {
                        var promise = Vow.resolve({
                            error: {
                                message: 'some error'
                            }
                        });
                        /**
                         * @type {ns.Model}
                         * @private
                         */
                        var _this = this;
                        return promise.then(function(data) {
                            ns.request.extractModel(_this, data);
                        });
                    }
                }
            });
            ns.ViewReact.define('reactView', {
                models: {
                    importantModel: true
                },
                component: {
                    render: function() {
                        if (this.props.view.isError()) {
                            return React.createElement('div', {
                                className: 'error'
                            });
                        } else {
                            return React.createElement('div', {
                                className: 'success'
                            });
                        }
                    }
                }
            });
            // Разрешим рендерить ошибки получения данных
            ns.Update.handleError = function() {
                return true;
            };

            this.APP = ns.View.create('app');
            var layout = ns.layout.page('app', {});
            new ns.Update(this.APP, layout, {})
                .render()
                .always(function() {
                    done();
                });
        });

        it('должен отобразить reactView', function() {
            expect(this.APP.node.querySelectorAll('.ns-view-reactView')).to.have.length(1);
        });

        it('должен отобразить reactView с контентом об ошибке', function() {
            expect(this.APP.node.querySelectorAll('.error')).to.have.length(1);
        });

    });

    describe('получение HTML ns.ViewReact и восстановление приложения по нему ->', function() {

        beforeEach(function() {
            ns.SERVER = true;

            ns.layout.define('index', {
                app: {
                    yateView: {
                        reactView: true,
                        'reactViewAsync&': true
                    }
                }
            });

            var asyncPromise = this.asyncPromise = new Vow.Promise();

            ns.Model.define('async', {
                methods: {
                    request: function() {
                        asyncPromise.then(function(data) {
                            this.setData(data);
                        }, this);
                        return asyncPromise;
                    }
                }
            });

            ns.View.define('app');
            ns.View.define('yateView');
            ns.ViewReact.define('reactView', {
                component: {
                    render: function() {
                        return React.createElement('div', {
                            className: 'success-render-sync'
                        });
                    }
                }
            });

            ns.ViewReact.define('reactViewAsync', {
                models: ['async'],
                component: {
                    render: function() {
                        if (this.props.view.isLoading()) {
                            return React.createElement('div', {
                                className: 'success-render-async'
                            });
                        } else {
                            return React.createElement('div',
                                {
                                    className: 'success-render-async'
                                },
                                React.createElement('div', {
                                    className: 'async-content'
                                })
                            );
                        }

                    }
                }
            });

            this.app = ns.View.create('app');
            this.indexPageLayout = ns.layout.page('index');

            this.update = new ns.Update(this.app, this.indexPageLayout, {});
        });

        afterEach(function() {
            ns.SERVER = false;
        });

        describe('получение HTML ->', function() {
            beforeEach(function(done) {
                this.update.generateHTML()
                    .then(function(html) {
                        this.node = ns.html2node(html);
                        done();
                    }, this);
            });

            it('должен отрендерить в ввиде HTML reactView', function() {
                expect(this.node.querySelectorAll('.success-render-sync')).to.have.length(1);
            });

            it('должен отрендерить в ввиде HTML reactViewAsync', function() {
                expect(this.node.querySelectorAll('.success-render-async')).to.have.length(1);
            });

            it('не должен рендерить в ввиде HTML неасинхронный контент для reactViewAsync', function() {
                expect(this.node.querySelectorAll('.async-content')).to.have.length(0);
            });
        });

        describe('восстановление приложения по HTML-> ', function() {
            beforeEach(function() {
                return this.update.generateHTML()
                    .then(function(html) {
                        ns.SERVER = false;
                        this.node = ns.html2node(html);
                        this.app = ns.View.create('app');
                        return new ns.Update(this.app, this.indexPageLayout, {})
                            .reconstruct(this.node);
                    }, this);
            });

            it('должен установить node у reactView', function() {
                var reactView = this.sinon.getViewByKey(this.app, 'view=reactView');

                expect(reactView.node).to.be.equal(this.app.node.querySelector('.ns-view-reactView'));
            });

            it('должен установить reactView root тип компонента', function() {
                var reactView = this.sinon.getViewByKey(this.app, 'view=reactView');

                expect(reactView.reactComponentType).to.be.equal('root');
            });

            it('должен установить node у reactViewAsync', function() {
                var reactViewAsync = this.sinon.getViewByKey(this.app, 'view=reactViewAsync');

                expect(reactViewAsync.node).to.be.equal(this.app.node.querySelector('.ns-view-reactViewAsync'));
            });

            it('должен установить reactView root тип компонента', function() {
                var reactViewAsync = this.sinon.getViewByKey(this.app, 'view=reactViewAsync');

                expect(reactViewAsync.reactComponentType).to.be.equal('root');
            });

            it('не должен отобразить контент reactViewAsync', function() {
                var reactViewAsync = this.sinon.getViewByKey(this.app, 'view=reactViewAsync');

                expect(reactViewAsync.node.querySelectorAll('.async-content')).to.have.length(0);
            });

            it('должен дорисовать async при следующем update', function(done) {
                new ns.Update(this.app, this.indexPageLayout, {})
                    .render()
                    .then(function(result) {
                        result.async[0]
                            .then(function() {
                                var reactViewAsync = this.sinon.getViewByKey(this.app, 'view=reactViewAsync');
                                expect(reactViewAsync.node.querySelectorAll('.async-content')).to.have.length(1);
                                done();
                            }, done, this);
                        this.asyncPromise.fulfill({
                            item: 1
                        });
                    }, done, this);
            });
        });

    });

    describe('стейт React компонента ns.ViewReact ->', function() {
        beforeEach(function() {
            ns.layout.define('app', {
                app: {
                    v1: true
                }
            });
            ns.View.define('app');
            ns.Model.define('m1');
            ns.Model.get('m1').setData({
                yo: ''
            });
            ns.ViewReact.define('v1', {
                models: ['m1'],
                component: {
                    componentWillMount: function() {
                        this.props.models.m1.on('ns-model-changed.yo', this.changeState);
                        ns.events.on('invalidate-v1', this.invalidateView);
                    },
                    componentWillUnmount: function() {
                        this.props.models.m1.off('ns-model-changed.yo', this.changeState);
                        ns.events.off('invalidate-v1', this.invalidateView);
                    },
                    changeState: function() {
                        this.setState({
                            hello: 'me'
                        });
                    },
                    invalidateView: function() {
                        this.props.view.invalidate();
                    },
                    getInitialState: function() {
                        return {
                            hello: 'you'
                        };
                    },
                    render: function() {
                        return React.createElement('div', {
                            className: 'v1-inner'
                        }, this.state.hello);
                    }
                }
            });
            this.app = ns.View.create('app');
            this.layout = ns.layout.page('app', {});

            return new ns.Update(this.app, this.layout, {}).render();
        });

        it('должен устанавливаться при создании вьюшки в getInitialState', function() {
            expect(this.app.node.querySelector('.ns-view-v1').innerText).to.be.eql('you');
        });

        describe('должен сохраняться ->', function() {
            beforeEach(function() {
                ns.Model.get('m1').set('.yo', 'yo');

                return new ns.Update(this.app, this.layout, {}).render();
            });

            it('при перерисовках вьюшки [#13]', function() {
                expect(this.app.node.querySelector('.ns-view-v1').innerText).to.be.eql('me');
            });

            it('при инвалидации вьюшки', function() {
                ns.events.trigger('invalidate-v1');

                return new ns.Update(this.app, this.layout, {})
                    .render()
                    .then(function() {
                        expect(this.app.node.querySelector('.ns-view-v1').innerText).to.be.eql('me');
                    }, this);
            });
        });
    });

    describe('наследование вьюшек ->', function() {
        beforeEach(function() {
            ns.layout.define('app', {
                app: {
                    'v-child': true
                }
            });
            ns.View.define('app');
            this.APP = ns.View.create('app');
        });

        it('должен наследовать методы родительского ns.ViewReact', function() {
            this.helloFromParent = this.sinon.stub();

            ns.ViewReact.define('v-parent', {
                methods: {
                    hello: this.helloFromParent
                }
            });
            ns.ViewReact.define('v-child', {
                component: {
                    componentDidMount: function() {
                        this.props.view.hello();
                    }
                }
            }, 'v-parent');

            return new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                .then(function() {
                    expect(this.helloFromParent.calledOnce).to.be.true;
                }, this);
        });

        it('должен наследовать методы родительского ns.View', function() {
            this.helloFromParent = this.sinon.stub();

            ns.View.define('v-parent', {
                methods: {
                    hello: this.helloFromParent
                }
            });
            ns.ViewReact.define('v-child', {
                component: {
                    componentDidMount: function() {
                        this.props.view.hello();
                    }
                }
            }, 'v-parent');

            return new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                .then(function() {
                    expect(this.helloFromParent.calledOnce).to.be.true;
                }, this);
        });

        it('должен при наследовании от ns.View в качестве super_ ссылаться на ns.ViewReact', function() {
            ns.View.define('v-parent', {
                methods: {
                    hello: function() {}
                }
            });
            ns.ViewReact.define('v-child', {}, 'v-parent');
            var vChild = ns.View.create('v-child');

            expect(vChild.super_).to.be.equal(ns.ViewReact.prototype);
        });

        it('должен вызвать метод базового компонента', function(done) {
            this.helloFromParent = this.sinon.stub();

            ns.ViewReact.define('v-parent', {
                component: {
                    hello: this.helloFromParent
                }
            });
            ns.ViewReact.define('v-child', {
                component: {
                    componentDidMount: function() {
                        this.hello();
                    }
                }
            }, 'v-parent');

            new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                .then(function() {
                    expect(this.helloFromParent.calledOnce).to.be.true;
                    done();
                }, this);
        });

        it('должен переопределить метод базового компонента', function(done) {
            this.helloFromChild = this.sinon.stub();
            this.helloFromParent = this.sinon.stub();

            ns.ViewReact.define('v-parent', {
                component: {
                    hello: this.helloFromParent
                }
            });
            ns.ViewReact.define('v-child', {
                component: {
                    componentDidMount: function() {
                        this.hello();
                    },
                    hello: this.helloFromChild
                }
            }, 'v-parent');

            new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                .then(function() {
                    expect(this.helloFromChild.calledOnce).to.be.true;
                    expect(this.helloFromParent.notCalled).to.be.true;
                    done();
                }, this);
        });

        it('должен вызвать метод родителя базового компонента при множественном наследовании', function(done) {
            this.helloFromParentParent = this.sinon.stub();

            ns.ViewReact.define('v-parent-parent', {
                component: {
                    hello: this.helloFromParentParent
                }
            });
            ns.ViewReact.define('v-parent', {}, 'v-parent-parent');
            ns.ViewReact.define('v-child', {
                component: {
                    componentDidMount: function() {
                        this.hello();
                    }
                }
            }, 'v-parent');

            new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                .then(function() {
                    expect(this.helloFromParentParent.calledOnce).to.be.true;
                    done();
                }, this);
        });

        it('не должен менять декларацию базового компонента', function() {
            ns.ViewReact.define('v-parent', {
                component: {
                    iAmParent: true
                }
            });
            ns.ViewReact.define('v-child', {
                component: {
                    iAmChild: true
                }
            }, 'v-parent');

            expect(ns.View.infoLite('v-parent').component).to.not.have.property('iAmChild');
            expect(ns.View.infoLite('v-parent').componentDecl).to.not.have.property('iAmChild');
        });

        describe('миксины ->', function() {
            it('должен вызвать метод, который был в миксине базового компонента', function(done) {
                this.helloFromParent = this.sinon.stub();

                ns.ViewReact.define('v-parent', {
                    component: {
                        mixins: [{ hello: this.helloFromParent }]
                    }
                });
                ns.ViewReact.define('v-child', {
                    component: {
                        componentDidMount: function() {
                            this.hello();
                        }
                    }
                }, 'v-parent');

                new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                    .then(function() {
                        expect(this.helloFromParent.calledOnce).to.be.true;
                        done();
                    }, this);
            });

            it('должен вызвать метод, который был в миксине родителя базового компонента, при множественном наследовании', function() {
                this.helloFromParentParent = this.sinon.stub();

                ns.ViewReact.define('v-parent-parent', {
                    component: {
                        mixins: [{ hello: this.helloFromParentParent }]
                    }
                });
                ns.ViewReact.define('v-parent', {}, 'v-parent-parent');
                ns.ViewReact.define('v-child', {
                    component: {
                        componentDidMount: function() {
                            this.hello();
                        }
                    }
                }, 'v-parent');

                return new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                    .then(function() {
                        expect(this.helloFromParentParent.calledOnce).to.be.true;
                    }, this);
            });
        });
    });

    describe('[#41] componentDidMount вложенных реактовых компонент', function() {
        beforeEach(function() {
            ns.layout.define('app', {
                app: 'v-1'
            });
            ns.layout.define('app2', {
                app: {
                    'v-2': 'v-1'
                }
            });
            ns.layout.define('app3', {
                app: {
                    'boxYate@': 'v-1'
                }
            });
            ns.layout.define('app4', {
                app: {
                    'v-2': {
                        'boxReact@': 'v-1'
                    }
                }
            });
            var _this = this;

            ns.View.define('app');
            ns.ViewReact.define('v-1', {
                'params+': {
                    foo: null
                },
                component: {
                    render: function() {
                        return React.createElement(React.createClass({
                            componentDidMount: function() {
                                _this.isViewInDOMOnComponentDidMount = document.querySelectorAll('.v-1-inner').length > 0;
                            },
                            render: function() {
                                return React.createElement('div', { className: 'v-1-inner' }, 'Hello, world!');
                            }
                        }));
                    }
                }
            });
            ns.ViewReact.define('v-2');

            this.appendAppNode();
            ns.initMainView();
        });
        afterEach(function() {
            ns.MAIN_VIEW.destroy();
        });

        describe('должен вызываться когда нода находится в DOM', function() {
            it('для обычной вьюшки', function() {
                return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app', {}), {})
                    .render()
                    .then(function() {
                        expect(this.isViewInDOMOnComponentDidMount).to.be.true;
                    }, this);
            });
            it('для вложенной вьюшки', function() {
                return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app2', {}), {})
                    .render()
                    .then(function() {
                        expect(this.isViewInDOMOnComponentDidMount).to.be.true;
                    }, this);
            });
            it('для вьюшки в реакт-боксе', function() {
                return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app4', {}), {})
                    .render()
                    .then(function() {
                        expect(this.isViewInDOMOnComponentDidMount).to.be.true;
                    }, this);
            });
            it('для второго экземпляра вьюшки в реакт-боксе', function() {
                return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app4', {}), {})
                    .render()
                    .then(function() {
                        return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app4', {}), { foo: true }).render()
                    })
                    .then(function() {
                        expect(this.isViewInDOMOnComponentDidMount).to.be.true;
                    }, this);
            });
        });
        it('должна быть ошибка при попытке создания реакт-вьюшки непосредственно в ns-боксе', function() {
            return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app3', {}), {})
                .render()
                .then(null, function(err) {
                    expect(function() { throw err; }).to.throw(
                        '[ns.View] Tried to render react-view `v-1` inside yate-box `boxYate`, please, wrap react-view into regular one'
                    );
                });
        });
    });

    describe('[#40]', function() {
        beforeEach(function() {
            ns.layout.define('app', {
                app: {
                    'yateBox@': function(p) {
                        if (p.show) {
                            return {
                                yateView: 'reactView'
                            };
                        }
                    }
                }
            });

            ns.View.define('app');
            ns.View.define('yateView');
            ns.ViewReact.define('reactView', {
                events: {
                    'ns-view-hide': 'invalidate'
                },
                component: {
                    render: function() {
                        return React.createElement('div', { className: 'reactView-inner' });
                    }
                }
            });

            this.appendAppNode();
            ns.initMainView();
        });

        describe('если реактивная вьюшка, которая находится внутри яте-вьюшки в боксе, была инвалидирована после скрытия, то после повторного показа', function() {
            beforeEach(function() {
                return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app', { show: true }), {}).render()
                    .then(function() {
                        return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app', { show: false }), {}).render();
                    })
                    .then(function() {
                        return new ns.Update(ns.MAIN_VIEW, ns.layout.page('app', { show: true }), {}).render();
                    });
            });
            it('нода должна содержать контент реакт-компонента', function() {
                expect(document.body.querySelectorAll('.reactView-inner')).to.have.length(1);
            });
        });
    });
});
