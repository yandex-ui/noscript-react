describe('ns.ViewReactСollection встроенные события', function() {
    beforeEach(function() {
        ns.layout.define('app', {
            app: {
                wrapper: {
                    'content@': true
                }
            }
        });

        ns.layout.define('content1', {
            'app wrapper content@': {
                'content-collection': true
            }
        }, 'app');

        ns.layout.define('content2', {
            'app wrapper content@': {
                content2: true
            }
        }, 'app');

        ns.layout.define('content3', {
            'app wrapper content@': {
                'content-collection&': true
            }
        }, 'app');

        ns.Model.define('model-collection-item', {
            params: {
                id: null
            }
        });

        ns.Model.define('model-collection', {
            split: {
                items: '.item',
                params: {
                    id: '.id'
                },
                model_id: 'model-collection-item'
            }
        });

        ns.Model.get('model-collection').setData({
            item: [
                { id: 1, data: 'item1' },
                { id: 2, data: 'item2' },
                { id: 3, data: 'item3' }
            ]
        });

        this.events = {};
        this.events['content-collection-item-ns-view-async-spy'] = this.sinon.spy();
        this.events['content-collection-item-ns-view-init-spy'] = this.sinon.spy();
        this.events['content-collection-item-ns-view-htmlinit-spy'] = this.sinon.spy();
        this.events['content-collection-item-ns-view-show-spy'] = this.sinon.spy();
        this.events['content-collection-item-ns-view-touch-spy'] = this.sinon.spy();
        this.events['content-collection-item-ns-view-hide-spy'] = this.sinon.spy();
        this.events['content-collection-item-ns-view-htmldestroy-spy'] = this.sinon.spy();

        ns.ViewReact.define('content-collection-item', {
            events: {
                'ns-view-async': this.events['content-collection-item-ns-view-async-spy'],
                'ns-view-init': this.events['content-collection-item-ns-view-init-spy'],
                'ns-view-htmlinit': this.events['content-collection-item-ns-view-htmlinit-spy'],
                'ns-view-show': this.events['content-collection-item-ns-view-show-spy'],
                'ns-view-touch': this.events['content-collection-item-ns-view-touch-spy'],
                'ns-view-hide': this.events['content-collection-item-ns-view-hide-spy'],
                'ns-view-htmldestroy': this.events['content-collection-item-ns-view-htmldestroy-spy']
            },
            models: ['model-collection-item']
        });

        var views = ['head', 'content-collection@model-collection', 'content2', 'wrapper'];
        var events = ['ns-view-async', 'ns-view-init', 'ns-view-htmlinit', 'ns-view-show', 'ns-view-touch', 'ns-view-hide', 'ns-view-htmldestroy'];

        for (var i = 0, j = views.length; i < j; i++) {
            var viewDecl = views[i].split('@');
            var view = viewDecl[0];
            var model = viewDecl[1];

            var eventsDecl = {};
            for (var k = 0, l = events.length; k < l; k++) {
                var event = events[k];
                var spy = this.sinon.spy();

                eventsDecl[event + ' .'] = spy;
                this.events[view + '-' + event + '-spy'] = spy;
            }

            if (/-collection$/.test(view)) {
                ns.ViewReactCollection.define(view, {
                    events: eventsDecl,
                    models: model ? [model] : [],
                    split: {
                        byModel: model,
                        intoViews: view + '-item'
                    }
                });

            } else {
                ns.ViewReact.define(view, {
                    events: eventsDecl,
                    models: model ? [model] : []
                });
            }
        }
        ns.View.define('app');

        this.APP = ns.View.create('app');
    });

    afterEach(function() {
        delete this.events;
        delete this.APP;
    });

    describe('первая отрисовка без данных', function() {

        beforeEach(function() {
            var layout = ns.layout.page('content1', {});
            var update = new ns.Update(this.APP, layout, {});
            update.start();
        });

        ns.test.genEventsTests([
            ['content-collection', 'ns-view-async', 'called', false],
            ['content-collection', 'ns-view-init', 'calledOnce'],
            ['content-collection', 'ns-view-htmlinit', 'called', false],
            ['content-collection', 'ns-view-show', 'called', false],
            ['content-collection', 'ns-view-touch', 'called', false],
            ['content-collection', 'ns-view-hide', 'called', false],
            ['content-collection', 'ns-view-htmldestroy', 'called', false]
        ]);

    });

    describe('первая отрисовка', function() {
        beforeEach(function(finish) {
            var layout = ns.layout.page('content1', {});
            var update = new ns.Update(this.APP, layout, {});
            update.start().then(function() {
                finish();
            });
        });

        ns.test.genEventsTests([
            ['content-collection', 'ns-view-async', 'called', false],
            ['content-collection', 'ns-view-init', 'calledOnce'],
            ['content-collection', 'ns-view-htmlinit', 'calledOnce'],
            ['content-collection', 'ns-view-show', 'calledOnce'],
            ['content-collection', 'ns-view-touch', 'calledOnce'],
            ['content-collection', 'ns-view-hide', 'called', false],
            ['content-collection', 'ns-view-htmldestroy', 'called', false],

            ['content-collection-item', 'ns-view-async', 'called', false],
            ['content-collection-item', 'ns-view-init', 'calledThrice'],
            ['content-collection-item', 'ns-view-htmlinit', 'calledThrice'],
            ['content-collection-item', 'ns-view-show', 'calledThrice'],
            ['content-collection-item', 'ns-view-touch', 'calledThrice'],
            ['content-collection-item', 'ns-view-hide', 'called', false],
            ['content-collection-item', 'ns-view-htmldestroy', 'called', false]
        ]);
    });

    describe('смена лейаута в боксе', function() {
        beforeEach(function(finish) {
            var layout = ns.layout.page('content1', {});
            var update = new ns.Update(this.APP, layout, {});
            update.start().then(function() {
                layout = ns.layout.page('content2', {});
                new ns.Update(this.APP, layout, {}).start().then(function() {
                    finish();
                });
            }.bind(this));

        });

        ns.test.genEventsTests([
            ['content-collection', 'ns-view-async', 'called', false],
            ['content-collection', 'ns-view-init', 'calledOnce'],
            ['content-collection', 'ns-view-htmlinit', 'calledOnce'],
            ['content-collection', 'ns-view-show', 'calledOnce'],
            ['content-collection', 'ns-view-touch', 'calledOnce'],
            ['content-collection', 'ns-view-hide', 'calledOnce'],
            ['content-collection', 'ns-view-htmldestroy', 'called', false],

            ['content-collection-item', 'ns-view-async', 'called', false],
            ['content-collection-item', 'ns-view-init', '', 3],
            ['content-collection-item', 'ns-view-htmlinit', '', 3],
            ['content-collection-item', 'ns-view-show', '', 3],
            ['content-collection-item', 'ns-view-touch', '', 3],
            ['content-collection-item', 'ns-view-hide', '', 3],
            ['content-collection-item', 'ns-view-htmldestroy', 'called', false]
        ]);

    });

    describe('показать коллекцию -> скрыть коллекцию -> показать коллекцию', function() {
        beforeEach(function() {
            var layout1 = ns.layout.page('content1', {});
            var layout2 = ns.layout.page('content2', {});
            return new ns.Update(this.APP, layout1, {}).render().then(function() {
                return new ns.Update(this.APP, layout2, {}).render().then(function() {
                    return new ns.Update(this.APP, layout1, {}).render();
                }, null, this);
            }, null, this);

        });

        ns.test.genEventsTests([
            ['content-collection', 'ns-view-async', 'called', false],
            ['content-collection', 'ns-view-init', 'calledOnce'],
            ['content-collection', 'ns-view-htmlinit', 'calledOnce'],
            ['content-collection', 'ns-view-show', '', 2],
            ['content-collection', 'ns-view-touch', '', 2],
            ['content-collection', 'ns-view-hide', '', 1],
            ['content-collection', 'ns-view-htmldestroy', 'called', false],

            ['content-collection-item', 'ns-view-async', 'called', false],
            ['content-collection-item', 'ns-view-init', '', 3],
            ['content-collection-item', 'ns-view-htmlinit', '', 3],
            ['content-collection-item', 'ns-view-show', '', 6],
            ['content-collection-item', 'ns-view-touch', '', 6],
            ['content-collection-item', 'ns-view-hide', '', 3],
            ['content-collection-item', 'ns-view-htmldestroy', 'called', false]
        ]);

    });

    describe('показать коллекцию -> скрыть коллекцию -> показать коллекцию (с полной перерисовкой)', function() {

        // тот же самый тест,
        // но при втором пока коллекция будет перерисована полностью

        beforeEach(function() {
            var layout1 = ns.layout.page('content1', {});
            var layout2 = ns.layout.page('content2', {});
            return new ns.Update(this.APP, layout1, {}).render().then(function() {
                return new ns.Update(this.APP, layout2, {}).render().then(function() {

                    var mc = ns.Model.get('model-collection');
                    mc.setData(mc.getData());
                    return new ns.Update(this.APP, layout1, {}).render();

                }, null, this);
            }, null, this);

        });

        ns.test.genEventsTests([
            ['content-collection', 'ns-view-async', 'called', false],
            ['content-collection', 'ns-view-init', 'calledOnce'],
            ['content-collection', 'ns-view-htmlinit', '', 2],
            ['content-collection', 'ns-view-show', '', 2],
            ['content-collection', 'ns-view-touch', '', 2],
            ['content-collection', 'ns-view-hide', '', 1],
            ['content-collection', 'ns-view-htmldestroy', '', 1],

            ['content-collection-item', 'ns-view-async', 'called', false],
            ['content-collection-item', 'ns-view-init', '', 3],
            ['content-collection-item', 'ns-view-htmlinit', '', 6],
            ['content-collection-item', 'ns-view-show', '', 6],
            ['content-collection-item', 'ns-view-touch', '', 6],
            ['content-collection-item', 'ns-view-hide', '', 3],
            ['content-collection-item', 'ns-view-htmldestroy', '', 3]
        ]);
    });

    describe('показать коллекцию -> скрыть коллекцию -> показать коллекцию (с перерисовкой, без элементов)', function() {

        // тот же самый тест,
        // но при повтороном показе коллекция будет перерисована без детей

        beforeEach(function() {
            var layout1 = ns.layout.page('content1', {});
            var layout2 = ns.layout.page('content2', {});
            return new ns.Update(this.APP, layout1, {}).render().then(function() {
                return new ns.Update(this.APP, layout2, {}).render().then(function() {
                    var mc = ns.Model.get('model-collection');
                    mc.set('.test', 1);
                    return new ns.Update(this.APP, layout1, {}).render();

                }, null, this);
            }, null, this);

        });

        ns.test.genEventsTests([
            ['content-collection', 'ns-view-async', 'called', false],
            ['content-collection', 'ns-view-init', 'calledOnce'],
            ['content-collection', 'ns-view-htmlinit', '', 2],
            ['content-collection', 'ns-view-show', '', 2],
            ['content-collection', 'ns-view-touch', '', 2],
            ['content-collection', 'ns-view-hide', '', 1],
            ['content-collection', 'ns-view-htmldestroy', '', 1],

            ['content-collection-item', 'ns-view-async', 'called', false],
            ['content-collection-item', 'ns-view-init', '', 3],
            ['content-collection-item', 'ns-view-htmlinit', '', 3],
            ['content-collection-item', 'ns-view-show', '', 6],
            ['content-collection-item', 'ns-view-touch', '', 6],
            ['content-collection-item', 'ns-view-hide', '', 3],
            ['content-collection-item', 'ns-view-htmldestroy', '', 0]
        ]);
    });
});
