describe('ns.View глобальные "космические" события ->', function() {

    describe('проверка работа метода подписки/отписки ->', function() {

        beforeEach(function() {
            this.name = 'test-view-info-events-parse';

            ns.ViewReact.define(this.name, {
                events: {
                    'my-global-show-event-short': no.nop,

                    'my-global-init-event@init': no.nop,

                    'my-global-show-event@show': no.nop
                }
            });

            this.view = ns.ViewReact.create(this.name);
            this.view._setNode(document.createElement('div'));

            this.sinon.spy(ns.events, 'off');
            this.sinon.spy(ns.events, 'on');

        });

        describe('init events ->', function() {

            describe('bind ->', function() {

                beforeEach(function() {
                    this.view._bindEvents('init');
                });

                describe('custom ns.events', function() {

                    it('should bind one event handler', function() {
                        expect(ns.events.on).to.have.callCount(1);
                    });

                    it('should bind handler for "my-global-init-event@init"', function() {
                        expect(ns.events.on).have.been.calledWith('my-global-init-event');
                    });

                });

            });

            describe('unbind ->', function() {

                beforeEach(function() {
                    this.view._bindEvents('init');
                    this.view._unbindEvents('init');
                });

                describe('custom ns.events ->', function() {

                    it('should unbind one event handler', function() {
                        expect(ns.events.off).to.have.callCount(1);
                    });

                    it('should unbind handler for "my-global-init-event@init"', function() {
                        expect(ns.events.off).have.been.calledWith('my-global-init-event');
                    });

                });

            });

        });

        describe('show events ->', function() {

            describe('bind ->', function() {

                beforeEach(function() {
                    this.view._bindEvents('show');
                });

                describe('custom ns.events', function() {

                    it('should bind two event handlers', function() {
                        expect(ns.events.on).to.have.callCount(2);
                    });

                    it('should bind handler for "my-global-show-event-short"', function() {
                        expect(ns.events.on).have.been.calledWith('my-global-show-event-short');
                    });

                    it('should bind handler for "my-global-show-event@show"', function() {
                        expect(ns.events.on).have.been.calledWith('my-global-show-event');
                    });

                });

            });

            describe('unbind ->', function() {

                beforeEach(function() {
                    this.view._bindEvents('show');
                    this.view._unbindEvents('show');
                });

                describe('custom ns.events', function() {

                    it('should unbind two event handlers', function() {
                        expect(ns.events.off).to.have.callCount(2);
                    });

                    it('should unbind handler for "my-global-show-event-short"', function() {
                        expect(ns.events.off).have.been.calledWith('my-global-show-event-short');
                    });

                    it('should unbind handler for "my-global-show-event@show"', function() {
                        expect(ns.events.off).have.been.calledWith('my-global-show-event');
                    });

                });

            });

        });

    });

    describe('проверка на тестовой странице ->', function() {

        beforeEach(function() {
            ns.layout.define('index', {
                app: {
                    wrapper: {
                        'boxReact@': {
                            item: {}
                        },
                        'async&': {}
                    }
                }
            });

            ns.View.define('app');

            var wrapperInitStub = this.wrapperInitStub = this.sinon.stub();
            var wrapperShowStub = this.wrapperShowStub = this.sinon.stub();
            ns.ViewReact.define('wrapper', {
                events: {
                    'init-event@init': 'onInitEvent',
                    'show-event@show': 'onShowEvent'
                },
                methods: {
                    onInitEvent: function() {
                        wrapperInitStub();
                    },
                    onShowEvent: function() {
                        wrapperShowStub();
                    }
                }
            });

            var itemInitStub = this.itemInitStub = this.sinon.stub();
            var itemShowStub = this.itemShowStub = this.sinon.stub();
            ns.Model.define('item', {
                params: {
                    p: null
                },
                methods: {
                    request: function() {
                        return Vow.resolve(true)
                            .then(function() {
                                this.setData({
                                    p: this.params.p
                                });
                            }, this);
                    }
                }
            });
            ns.ViewReact.define('item', {
                models: ['item'],
                events: {
                    'init-event@init': 'onInitEvent',
                    'show-event@show': 'onShowEvent'
                },
                methods: {
                    onInitEvent: function() {
                        itemInitStub();
                    },
                    onShowEvent: function() {
                        itemShowStub();
                    }
                }
            });

            var asyncInitStub = this.asyncInitStub = this.sinon.stub();
            var asyncShowStub = this.asyncShowStub = this.sinon.stub();
            ns.Model.define('async', {
                methods: {
                    request: function() {
                        return Vow.resolve(true)
                            .then(function() {
                                this.setData({});
                            }, this);
                    }
                }
            });
            ns.ViewReact.define('async', {
                events: {
                    'init-event@init': 'onInitEvent',
                    'show-event@show': 'onShowEvent'
                },
                methods: {
                    onInitEvent: function() {
                        asyncInitStub();
                    },
                    onShowEvent: function() {
                        asyncShowStub();
                    }
                }
            });

            this.app = ns.View.create('app');

            return new ns.Update(this.app, ns.layout.page('index'), { p: 1 }).render();
        });

        describe('init events ->', function() {

            describe('coздание или изменение ns.ViewReact ->', function() {
                beforeEach(function() {
                    ns.events.trigger('init-event');
                });

                it('должен вызвать обработчик на wrapper', function() {
                    expect(this.wrapperInitStub).to.be.calledOnce;
                });

                it('должен вызвать обработчик на элементе в боксе', function() {
                    expect(this.itemInitStub).to.be.calledOnce;
                });

                it('должен вызвать обработчик на асинхронном view', function() {
                    expect(this.asyncInitStub).to.be.calledOnce;
                });

                it('должен при добавлении элемента в бокс вызвать обработчик 2 раза, т.к. элемент скрыт, но инициирован', function() {
                    return new ns.Update(this.app, ns.layout.page('index'), { p: 2 })
                        .render()
                        .then(function() {
                            this.itemInitStub.reset();
                            ns.events.trigger('init-event');
                            expect(this.itemInitStub).to.be.calledTwice;
                        }, this);
                });

                it('должен после инвалидации сохранить число подписок на событие', function() {
                    var wrapperView = this.sinon.getViewByKey(this.app, 'view=wrapper');
                    wrapperView.invalidate();

                    return new ns.Update(this.app, ns.layout.page('index'), { p: 2 })
                        .render()
                        .then(function() {
                            this.wrapperInitStub.reset();
                            ns.events.trigger('init-event');
                            expect(this.wrapperInitStub).to.be.calledOnce;
                        }, this);
                });
            });

            describe('уничтожение view ->', function() {

                beforeEach(function() {
                    var wrapperView = this.sinon.getViewByKey(this.app, 'view=wrapper');
                    wrapperView.destroy();
                    ns.events.trigger('init-event');
                });

                it('должен отписать wrapper', function() {
                    expect(this.wrapperInitStub).to.be.not.called;
                });

                it('должен отписать async', function() {
                    expect(this.asyncInitStub).to.be.not.called;
                });

                it('должен отписать item', function() {
                    expect(this.itemInitStub).to.be.not.called;
                });

            });

        });

        describe('show events ->', function() {

            describe('coздание или изменение ns.ViewReact ->', function() {

                beforeEach(function() {
                    ns.events.trigger('show-event');
                });

                it('должен вызвать обработчик на wrapper', function() {
                    expect(this.wrapperShowStub).to.be.calledOnce;
                });

                it('должен вызвать обработчик на элементе в боксе', function() {
                    expect(this.itemShowStub).to.be.calledOnce;
                });

                it('должен вызвать обработчик на асинхронном view', function() {
                    expect(this.asyncShowStub).to.be.calledOnce;
                });

                it('должен при добавлении элемента в бокс вызвать обработчик 1 раз, т.к. элемент скрыт', function() {
                    return new ns.Update(this.app, ns.layout.page('index'), { p: 2 })
                        .render()
                        .then(function() {
                            this.itemShowStub.reset();
                            ns.events.trigger('show-event');
                            expect(this.itemShowStub).to.be.calledOnce;
                        }, this);
                });

                it('должен после инвалидации сохранить число подписок на событие', function() {
                    var wrapperView = this.sinon.getViewByKey(this.app, 'view=wrapper');
                    wrapperView.invalidate();

                    return new ns.Update(this.app, ns.layout.page('index'), { p: 2 })
                        .render()
                        .then(function() {
                            this.wrapperShowStub.reset();
                            ns.events.trigger('show-event');
                            expect(this.wrapperShowStub).to.be.calledOnce;
                        }, this);
                });

            });

            describe('уничтожение view ->', function() {

                beforeEach(function() {
                    var wrapperView = this.sinon.getViewByKey(this.app, 'view=wrapper');
                    wrapperView.destroy();
                    ns.events.trigger('show-event');
                });

                it('должен отписать wrapper', function() {
                    expect(this.wrapperShowStub).to.be.not.called;
                });

                it('должен отписать async', function() {
                    expect(this.asyncShowStub).to.be.not.called;
                });

                it('должен отписать item', function() {
                    expect(this.itemShowStub).to.be.not.called;
                });

            });

        });

    });

});
