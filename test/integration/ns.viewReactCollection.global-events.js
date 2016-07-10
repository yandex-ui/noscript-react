describe('ns.ViewCollection глобальные "космические" события ->', function() {

    beforeEach(function() {
        ns.layout.define('index', {
            app: {
                collection: {}
            }
        });

        // models
        ns.Model.define('item', {
            params: {
                id: null
            }
        });

        ns.Model.define('collection', {
            split: {
                items: '.items',
                params: {
                    id: '.id'
                },
                model_id: 'item'
            }
        });

        ns.Model.get('collection').setData({
            items: [
                { id: 1, data: 'item1' },
                { id: 2, data: 'item2' },
                { id: 3, data: 'item3' }
            ]
        });

        ns.View.define('app');

        var itemInitStub = this.itemInitStub = this.sinon.stub();
        var itemShowStub = this.itemShowStub = this.sinon.stub();
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

        var collectionInitStub = this.collectionInitStub = this.sinon.stub();
        var collectionShowStub = this.collectionShowStub = this.sinon.stub();
        ns.ViewReactCollection.define('collection', {
            models: ['collection'],
            split: {
                byModel: 'collection',
                intoViews: 'item'
            },
            events: {
                'init-event@init': 'onInitEvent',
                'show-event@show': 'onShowEvent'
            },
            methods: {
                onInitEvent: function() {
                    collectionInitStub();
                },
                onShowEvent: function() {
                    collectionShowStub();
                }
            }
        });

        this.app = ns.View.create('app');

        return new ns.Update(this.app, ns.layout.page('index'), {}).render();
    });

    describe('init events ->', function() {

        describe('coздание или изменение ns.ViewReactCollection ->', function() {

            beforeEach(function() {
                ns.events.trigger('init-event');
            });

            it('должен вызвать обработчик на collection', function() {
                expect(this.collectionInitStub).to.be.calledOnce;
            });

            it('должен вызвать обработчики на элементе коллекции', function() {
                expect(this.itemInitStub).to.be.calledThrice;
            });

            it('должен вызвать событие только на существующих элементах коллекции', function() {
                var item = ns.Model.get('item', { id: 2 });
                ns.Model.get('collection').remove(item);
                var collectionView = this.sinon.getViewByKey(this.app, 'view=collection');
                collectionView.invalidate();

                return new ns.Update(this.app, ns.layout.page('index'), {})
                    .render()
                    .then(function() {
                        this.itemInitStub.reset();
                        ns.events.trigger('init-event');
                        expect(this.itemInitStub).to.be.calledTwice;
                    }, this);
            });

        });

        describe('уничтожение коллекции ->', function() {

            beforeEach(function() {
                var collectionView = this.sinon.getViewByKey(this.app, 'view=collection');
                collectionView.destroy();
                ns.events.trigger('init-event');
            });

            it('должен отписать collection', function() {
                expect(this.collectionInitStub).to.be.not.called;
            });

            it('должен отписать элементы коллекции', function() {
                expect(this.itemInitStub).to.be.not.called;
            });

        });

    });

    describe('show events ->', function() {

        describe('coздание или изменение ns.ViewReactCollection ->', function() {

            beforeEach(function() {
                ns.events.trigger('show-event');
            });

            it('должен вызвать обработчик на collection', function() {
                expect(this.collectionShowStub).to.be.calledOnce;
            });

            it('должен вызвать обработчики на элементе коллекции', function() {
                expect(this.itemShowStub).to.be.calledThrice;
            });

            it('должен вызвать событие только на существующих элементах коллекции', function() {
                var item = ns.Model.get('item', { id: 2 });
                ns.Model.get('collection').remove(item);
                var collectionView = this.sinon.getViewByKey(this.app, 'view=collection');
                collectionView.invalidate();

                return new ns.Update(this.app, ns.layout.page('index'), {})
                    .render()
                    .then(function() {
                        this.itemShowStub.reset();
                        ns.events.trigger('show-event');
                        expect(this.itemShowStub).to.be.calledTwice;
                    }, this);
            });

        });

        describe('уничтожение коллекции ->', function() {

            beforeEach(function() {
                var collectionView = this.sinon.getViewByKey(this.app, 'view=collection');
                collectionView.destroy();
                ns.events.trigger('init-event');
            });

            it('должен отписать collection', function() {
                expect(this.collectionShowStub).to.be.not.called;
            });

            it('должен отписать элементы коллекции', function() {
                expect(this.itemShowStub).to.be.not.called;
            });

        });

    });

});
