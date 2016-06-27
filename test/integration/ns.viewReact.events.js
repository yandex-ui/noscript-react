describe('ns.ViewReact встроенные события', function() {
    beforeEach(function() {
        ns.layout.define('app', {
            app: {
                head: true,
                'content@': true
            }
        });

        ns.layout.define('content1', {
            'app content@': {
                content1: {
                    'content1-inner': true
                }
            }
        }, 'app');

        ns.layout.define('content2', {
            'app content@': {
                content2: {
                    'content2-inner': true
                }
            }
        }, 'app');

        var views = ['app', 'head', 'content1', 'content1-async@content1-async-model', 'content2-async@content2-async-model', 'content1-inner', 'content2', 'content2-inner'];
        var events = ['ns-view-async', 'ns-view-init', 'ns-view-htmlinit', 'ns-view-show', 'ns-view-touch', 'ns-view-hide', 'ns-view-htmldestroy'];

        this.events = {};

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
            (view === 'app' ? ns.View : ns.ViewReact).define(view, {
                events: eventsDecl,
                models: model ? [model] : []
            });
        }

        this.APP = ns.View.create('app');
    });

    describe('первая отрисовка', function() {

        beforeEach(function() {
            return new ns.Update(this.APP, ns.layout.page('content1', {}), {}).render();
        });

        describe('ns-view-init', function() {
            ns.test.genEventsTests([
                ['app', 'ns-view-init', 'calledOnce'],
                ['head', 'ns-view-init', 'calledOnce'],
                ['content1', 'ns-view-init', 'calledOnce'],
                ['content1-inner', 'ns-view-init', 'calledOnce'],
                ['content2', 'ns-view-init', 'called', false],
                ['content2-inner', 'ns-view-init', 'called', false]
            ]);
        });

        describe('ns-view-htmlinit', function() {
            ns.test.genEventsTests([
                ['app', 'ns-view-htmlinit', 'calledOnce'],
                ['head', 'ns-view-htmlinit', 'calledOnce'],
                ['content1', 'ns-view-htmlinit', 'calledOnce'],
                ['content1-inner', 'ns-view-htmlinit', 'calledOnce'],
                ['content2', 'ns-view-htmlinit', 'called', false],
                ['content2-inner', 'ns-view-htmlinit', 'called', false]
            ]);
        });

        describe('ns-view-show', function() {
            ns.test.genEventsTests([
                ['app', 'ns-view-show', 'calledOnce'],
                ['head', 'ns-view-show', 'calledOnce'],
                ['content1', 'ns-view-show', 'calledOnce'],
                ['content1-inner', 'ns-view-show', 'calledOnce'],
                ['content2', 'ns-view-show', 'called', false],
                ['content2-inner', 'ns-view-show', 'called', false]
            ]);
        });

        describe('ns-view-touch', function() {
            ns.test.genEventsTests([
                ['app', 'ns-view-touch', 'calledOnce'],
                ['head', 'ns-view-touch', 'calledOnce'],
                ['content1', 'ns-view-touch', 'calledOnce'],
                ['content1-inner', 'ns-view-touch', 'calledOnce'],
                ['content2', 'ns-view-touch', 'called', false],
                ['content2-inner', 'ns-view-touch', 'called', false]
            ]);
        });

        describe('ns-view-hide', function() {
            ns.test.genEventsTests([
                ['app', 'ns-view-hide', 'called', false],
                ['head', 'ns-view-hide', 'called', false],
                ['content1', 'ns-view-hide', 'called', false],
                ['content1-inner', 'ns-view-hide', 'called', false],
                ['content2', 'ns-view-hide', 'called', false],
                ['content2-inner', 'ns-view-hide', 'called', false]
            ]);
        });

        describe('ns-view-htmldestroy', function() {
            ns.test.genEventsTests([
                ['app', 'ns-view-htmldestroy', 'called', false],
                ['head', 'ns-view-htmldestroy', 'called', false],
                ['content1', 'ns-view-htmldestroy', 'called', false],
                ['content1-inner', 'ns-view-htmldestroy', 'called', false],
                ['content2', 'ns-view-htmldestroy', 'called', false],
                ['content2-inner', 'ns-view-htmldestroy', 'called', false]
            ]);
        });

        describe('порядок всплытия событий', function() {
            ns.test.genEventsOrderTests([
                ['content1-inner', 'ns-view-htmlinit'],
                ['content1', 'ns-view-htmlinit'],
                ['head', 'ns-view-htmlinit'],
                ['app', 'ns-view-htmlinit'],

                ['content1-inner', 'ns-view-show'],
                ['content1', 'ns-view-show'],
                ['head', 'ns-view-show'],
                ['app', 'ns-view-show'],

                ['content1-inner', 'ns-view-touch'],
                ['content1', 'ns-view-touch'],
                ['head', 'ns-view-touch'],
                ['app', 'ns-view-touch']
            ]);
        });
    });

    describe('переключение в боксе', function() {

        beforeEach(function() {
            return new ns.Update(this.APP, ns.layout.page('content1', {}), {}).render().then(function() {
                return new ns.Update(this.APP, ns.layout.page('content2', {}), {}).render();
            }, this);
        });

        ns.test.genEventsTests([
            ['content2-inner', 'ns-view-init', 'calledOnce'],
            ['content2-inner', 'ns-view-htmlinit', 'calledOnce'],
            ['content2-inner', 'ns-view-show', 'calledOnce'],
            ['content2-inner', 'ns-view-touch', 'calledOnce'],

            ['content2', 'ns-view-init', 'calledOnce'],
            ['content2', 'ns-view-htmlinit', 'calledOnce'],
            ['content2', 'ns-view-show', 'calledOnce'],
            ['content2', 'ns-view-touch', 'calledOnce'],

            ['app', 'ns-view-show', 'calledOnce'],
            ['content1-inner', 'ns-view-hide', 'calledOnce'],
            ['content1', 'ns-view-hide', 'calledOnce'],

            ['app', 'ns-view-touch', 'calledTwice'],
            ['head', 'ns-view-touch', 'calledTwice'],
            ['content1', 'ns-view-touch', 'calledOnce'],
            ['content1-inner', 'ns-view-touch', 'calledOnce'],
            ['content2', 'ns-view-touch', 'calledOnce'],
            ['content2-inner', 'ns-view-touch', 'calledOnce']
        ]);

        describe('порядок всплытия событий', function() {
            ns.test.genEventsOrderTests([
                ['content1-inner', 'ns-view-htmlinit', 0],
                ['content1', 'ns-view-htmlinit', 0],
                ['head', 'ns-view-htmlinit', 0],
                ['app', 'ns-view-htmlinit', 0],

                ['content1-inner', 'ns-view-show', 0],
                ['content1', 'ns-view-show', 0],
                ['head', 'ns-view-show', 0],
                ['app', 'ns-view-show', 0],

                ['content1-inner', 'ns-view-touch', 0],
                ['content1', 'ns-view-touch', 0],
                ['head', 'ns-view-touch', 0],
                ['app', 'ns-view-touch', 0],

                ['content1-inner', 'ns-view-hide', 0],
                ['content1', 'ns-view-hide', 0],

                ['content2-inner', 'ns-view-htmlinit', 0],
                ['content2', 'ns-view-htmlinit', 0],
                ['content2-inner', 'ns-view-show', 0],
                ['content2', 'ns-view-show', 0],

                ['content2-inner', 'ns-view-touch', 0],
                ['content2', 'ns-view-touch', 0],
                ['head', 'ns-view-touch', 1],
                ['app', 'ns-view-touch', 1]
            ]);
        });
    });

    describe('апдейт на валидной вьюшке', function() {
        beforeEach(function() {
            var layout = ns.layout.page('content1', {});
            return new ns.Update(this.APP, layout, {}).render().then(function() {
                return new ns.Update(this.APP, layout, {}).render();
            }, this);
        });

        ns.test.genEventsTests([
            ['content1-inner', 'ns-view-hide', 'called', false],
            ['content1', 'ns-view-hide', 'called', false],

            ['content1-inner', 'ns-view-htmldestroy', 'called', false],
            ['content1', 'ns-view-htmldestroy', 'called', false],

            ['content1-inner', 'ns-view-htmlinit', 'calledOnce'],
            ['content1', 'ns-view-htmlinit', 'calledOnce'],

            ['content1-inner', 'ns-view-show', 'calledOnce'],
            ['content1', 'ns-view-show', 'calledOnce'],

            ['content1-inner', 'ns-view-touch', 'calledTwice'],
            ['content1', 'ns-view-touch', 'calledTwice']
        ]);
    });

    describe('перерисовка невалидной вьюшки', function() {
        beforeEach(function() {
            var layout = ns.layout.page('content1', {});

            return new ns.Update(this.APP, layout, {}).render().then(function() {
                var vContent1 = this.events['content1-ns-view-init-spy'].getCall(0).thisValue;
                vContent1.invalidate();

                return new ns.Update(this.APP, layout, {}).render();
            }, this);
        });

        ns.test.genEventsTests([
            ['content1-inner', 'ns-view-hide', 'calledOnce'],
            ['content1', 'ns-view-hide', 'calledOnce'],

            ['content1-inner', 'ns-view-htmldestroy', 'calledOnce'],
            ['content1', 'ns-view-htmldestroy', 'calledOnce'],

            ['content1-inner', 'ns-view-htmlinit', 'calledTwice'],
            ['content1', 'ns-view-htmlinit', 'calledTwice'],

            ['content1-inner', 'ns-view-show', 'calledTwice'],
            ['content1', 'ns-view-show', 'calledTwice'],

            ['content1-inner', 'ns-view-touch', 'calledTwice'],
            ['content1', 'ns-view-touch', 'calledTwice']
        ]);

        describe('порядок всплытия событий', function() {
            ns.test.genEventsOrderTests([
                ['content1-inner', 'ns-view-htmlinit', 0],
                ['content1', 'ns-view-htmlinit', 0],
                ['head', 'ns-view-htmlinit', 0],
                ['app', 'ns-view-htmlinit', 0],

                ['content1-inner', 'ns-view-show', 0],
                ['content1', 'ns-view-show', 0],
                ['head', 'ns-view-show', 0],
                ['app', 'ns-view-show', 0],

                ['content1-inner', 'ns-view-touch', 0],
                ['content1', 'ns-view-touch', 0],
                ['head', 'ns-view-touch', 0],
                ['app', 'ns-view-touch', 0],

                ['content1-inner', 'ns-view-hide', 0],
                ['content1', 'ns-view-hide', 0],

                ['content1-inner', 'ns-view-htmldestroy', 0],
                ['content1', 'ns-view-htmldestroy', 0],

                ['content1-inner', 'ns-view-htmlinit', 1],
                ['content1', 'ns-view-htmlinit', 1],
                ['content1-inner', 'ns-view-show', 1],
                ['content1', 'ns-view-show', 1],

                ['content1-inner', 'ns-view-touch', 1],
                ['content1', 'ns-view-touch', 1],
                ['head', 'ns-view-touch', 1],
                ['app', 'ns-view-touch', 1]
            ]);
        });
    });

    describe('асинхронные вьюшки', function() {
        beforeEach(function() {
            ns.layout.define('content1-async', {
                'app content@': {
                    'content1-async&': {
                        'content1-inner': true
                    }
                }
            }, 'app');
            ns.Model.define('content1-async-model');

            return new ns.Update(this.APP, ns.layout.page('content1-async', {}), {})
                .render()
                .then(function(result) {
                    this.asyncPromise1 = result.async[0];
                }, this);
        });

        describe('первый апдейт', function() {
            ns.test.genEventsTests([
                ['content1-async', 'ns-view-async', 'calledOnce'],

                ['content1-async', 'ns-view-htmldestroy', 'called', false],
                ['content1-async', 'ns-view-hide', 'called', false],
                ['content1-async', 'ns-view-htmlinit', 'called', false],
                ['content1-async', 'ns-view-show', 'called', false],
                ['content1-async', 'ns-view-touch', 'called', false],

                ['content1-inner', 'ns-view-htmldestroy', 'called', false],
                ['content1-inner', 'ns-view-hide', 'called', false],
                ['content1-inner', 'ns-view-htmlinit', 'called', false],
                ['content1-inner', 'ns-view-show', 'called', false],
                ['content1-inner', 'ns-view-touch', 'called', false]
            ]);

            describe('порядок всплытия событий', function() {
                ns.test.genEventsOrderTests([
                    ['head', 'ns-view-htmlinit', 0],
                    ['app', 'ns-view-htmlinit', 0],

                    ['content1-async', 'ns-view-async', 0],

                    ['head', 'ns-view-show', 0],
                    ['app', 'ns-view-show', 0],

                    ['head', 'ns-view-touch', 0],
                    ['app', 'ns-view-touch', 0]
                ]);
            });
        });

        describe('второй апдейт, после загрузки моделей', function() {
            beforeEach(function() {
                this.sinon.server.requests[0].respond(
                    200,
                    { 'Content-Type': 'application/json' },
                    JSON.stringify({
                        models: [
                            { data: true }
                        ]
                    })
                );

                return this.asyncPromise1;
            });

            ns.test.genEventsTests([
                ['content1-async', 'ns-view-async', 'calledOnce'],

                ['content1-async', 'ns-view-htmlinit', 'calledOnce'],
                ['content1-async', 'ns-view-show', 'calledOnce'],
                ['content1-async', 'ns-view-touch', 'calledOnce'],

                ['content1-inner', 'ns-view-htmlinit', 'calledOnce'],
                ['content1-inner', 'ns-view-show', 'calledOnce'],
                ['content1-inner', 'ns-view-touch', 'calledOnce'],

                ['head', 'ns-view-touch', 'calledOnce'],
                ['app', 'ns-view-touch', 'calledOnce'],

                ['content1-async', 'ns-view-htmldestroy', 'called', false],
                ['content1-inner', 'ns-view-htmldestroy', 'called', false]
            ]);

            describe('порядок всплытия событий', function() {
                ns.test.genEventsOrderTests([
                    ['head', 'ns-view-htmlinit', 0],
                    ['app', 'ns-view-htmlinit', 0],

                    ['content1-async', 'ns-view-async', 0],

                    ['head', 'ns-view-show', 0],
                    ['app', 'ns-view-show', 0],

                    ['head', 'ns-view-touch', 0],
                    ['app', 'ns-view-touch', 0],

                    ['content1-inner', 'ns-view-htmlinit', 0],
                    ['content1-async', 'ns-view-htmlinit', 0],

                    ['content1-inner', 'ns-view-show', 0],
                    ['content1-async', 'ns-view-show', 0],

                    ['content1-inner', 'ns-view-touch', 0],
                    ['content1-async', 'ns-view-touch', 0]
                ]);
            });
        });
    });

    describe('вложенные асинхронные вьюшки', function() {
        beforeEach(function() {
            ns.layout.define('content2-async', {
                'app content@': {
                    'content2-inner': {
                        'content2-async&': true
                    }
                }
            }, 'app');

            ns.Model.define('content2-async-model');

            return new ns.Update(this.APP, ns.layout.page('content2-async', {}), {})
                .render()
                .then(function(result) {
                    this.asyncPromise1 = result.async[0];
                }, this);
        });

        describe('первый апдейт', function() {
            ns.test.genEventsTests([
                ['content2-inner', 'ns-view-htmldestroy', 'called', false],
                ['content2-inner', 'ns-view-hide', 'called', false],
                ['content2-inner', 'ns-view-htmlinit', 'calledOnce'],
                ['content2-inner', 'ns-view-show', 'calledOnce'],
                ['content2-inner', 'ns-view-touch', 'calledOnce'],

                ['content2-async', 'ns-view-async', 'calledOnce'],
                ['content2-async', 'ns-view-htmldestroy', 'called', false],
                ['content2-async', 'ns-view-hide', 'called', false],
                ['content2-async', 'ns-view-htmlinit', 'called', false],
                ['content2-async', 'ns-view-show', 'called', false],
                ['content2-async', 'ns-view-touch', 'called', false]
            ]);

            describe('порядок всплытия событий', function() {
                ns.test.genEventsOrderTests([
                    ['content2-inner', 'ns-view-htmlinit', 0],
                    ['head', 'ns-view-htmlinit', 0],
                    ['app', 'ns-view-htmlinit', 0],

                    ['content2-async', 'ns-view-async', 0],

                    ['content2-inner', 'ns-view-show', 0],
                    ['head', 'ns-view-show', 0],
                    ['app', 'ns-view-show', 0],

                    ['content2-inner', 'ns-view-touch', 0],
                    ['head', 'ns-view-touch', 0],
                    ['app', 'ns-view-touch', 0]
                ]);
            });
        });

        describe('повторный апдейт, после загрузки моделей', function() {
            beforeEach(function() {
                this.sinon.server.requests[0].respond(
                    200,
                    { 'Content-Type': 'application/json' },
                    JSON.stringify({
                        models: [
                            { data: true }
                        ]
                    })
                );
                return this.asyncPromise1;
            });

            ns.test.genEventsTests([
                ['content2-inner', 'ns-view-htmldestroy', 'called', false],
                ['content2-inner', 'ns-view-hide', 'called', false],
                ['content2-inner', 'ns-view-htmlinit', 'calledOnce'],
                ['content2-inner', 'ns-view-show', 'calledOnce'],
                ['content2-inner', 'ns-view-touch', 'calledOnce'],

                ['content2-async', 'ns-view-async', 'calledOnce'],
                ['content2-async', 'ns-view-htmldestroy', 'called', false],
                ['content2-async', 'ns-view-hide', 'called', false],
                ['content2-async', 'ns-view-htmlinit', 'calledOnce'], // +1
                ['content2-async', 'ns-view-show', 'calledOnce'], // +1
                ['content2-async', 'ns-view-touch', 'calledOnce'] // +1
            ]);

            describe('порядок всплытия событий', function() {
                ns.test.genEventsOrderTests([
                    ['content2-inner', 'ns-view-htmlinit', 0],
                    ['head', 'ns-view-htmlinit', 0],
                    ['app', 'ns-view-htmlinit', 0],

                    ['content2-async', 'ns-view-async', 0],

                    ['content2-inner', 'ns-view-show', 0],
                    ['head', 'ns-view-show', 0],
                    ['app', 'ns-view-show', 0],

                    ['content2-inner', 'ns-view-touch', 0],
                    ['head', 'ns-view-touch', 0],
                    ['app', 'ns-view-touch', 0],

                    // После того, как отрендерился content2-async
                    ['content2-async', 'ns-view-htmlinit', 0],
                    ['content2-async', 'ns-view-show', 0],
                    ['content2-async', 'ns-view-touch', 0]
                ]);
            });
        });

        describe('первый апдейт после инвалидации модельки', function() {
            beforeEach(function() {
                this.sinon.server.requests[0].respond(
                    200,
                    { 'Content-Type': 'application/json' },
                    JSON.stringify({
                        models: [
                            { data: true }
                        ]
                    })
                );

                return this.asyncPromise1.then(function() {
                    ns.Model.get('content2-async-model').invalidate();

                    return new ns.Update(this.APP, ns.layout.page('content2-async', {}), {}).render();
                }, this);
            });

            ns.test.genEventsTests([
                ['content2-inner', 'ns-view-htmldestroy', 'called', false],
                ['content2-inner', 'ns-view-hide', 'called', false],
                ['content2-inner', 'ns-view-htmlinit', 'calledOnce'],
                ['content2-inner', 'ns-view-show', 'calledOnce'],
                ['content2-inner', 'ns-view-touch', 'calledTwice'], // +1 показ

                ['content2-async', 'ns-view-async', 'calledTwice'], // +1 новый async рендеринг
                ['content2-async', 'ns-view-htmldestroy', 'calledOnce'], // +1 async вид перерисовался и теперь loading
                ['content2-async', 'ns-view-hide', 'calledOnce'], // +1 async вид был спрятан (отрендерили async заглушку)
                ['content2-async', 'ns-view-htmlinit', 'calledOnce'],
                ['content2-async', 'ns-view-show', 'calledOnce'],
                ['content2-async', 'ns-view-touch', 'calledOnce']
            ]);

            describe('порядок всплытия событий', function() {
                ns.test.genEventsOrderTests([
                    ['content2-inner', 'ns-view-htmlinit', 0],
                    ['head', 'ns-view-htmlinit', 0],
                    ['app', 'ns-view-htmlinit', 0],

                    ['content2-async', 'ns-view-async', 0],

                    ['content2-inner', 'ns-view-show', 0],
                    ['head', 'ns-view-show', 0],
                    ['app', 'ns-view-show', 0],

                    ['content2-inner', 'ns-view-touch', 0],
                    ['head', 'ns-view-touch', 0],
                    ['app', 'ns-view-touch', 0],

                    ['content2-async', 'ns-view-htmlinit', 0],
                    ['content2-async', 'ns-view-show', 0],
                    ['content2-async', 'ns-view-touch', 0],

                    // Второй update отсюда
                    ['content2-async', 'ns-view-hide', 0],
                    ['content2-async', 'ns-view-htmldestroy', 0],

                    ['content2-async', 'ns-view-async', 1],
                    ['content2-inner', 'ns-view-touch', 1]
                ]);
            });
        });

        describe('повторный апдейт после инвалидации модельки', function() {
            beforeEach(function() {
                this.sinon.server.requests[0].respond(
                    200,
                    { 'Content-Type': 'application/json' },
                    JSON.stringify({
                        models: [
                            { data: true }
                        ]
                    })
                );

                return this.asyncPromise1.then(function() {
                    ns.Model.get('content2-async-model').invalidate();

                    return new ns.Update(this.APP, ns.layout.page('content2-async', {}), {})
                        .render()
                        .then(function(result) {
                            this.sinon.server.requests[1].respond(
                                200,
                                { 'Content-Type': 'application/json' },
                                JSON.stringify({
                                    models: [
                                        { data: true }
                                    ]
                                })
                            );
                            return result.async[0];
                        }, this);
                }, this);
            });

            ns.test.genEventsTests([
                ['content2-inner', 'ns-view-htmldestroy', 'called', false],
                ['content2-inner', 'ns-view-hide', 'called', false],
                ['content2-inner', 'ns-view-htmlinit', 'calledOnce'],
                ['content2-inner', 'ns-view-show', 'calledOnce'],
                ['content2-inner', 'ns-view-touch', 'calledTwice'],

                ['content2-async', 'ns-view-async', 'calledTwice'],
                ['content2-async', 'ns-view-htmldestroy', 'calledOnce'],
                ['content2-async', 'ns-view-hide', 'calledOnce'],
                ['content2-async', 'ns-view-htmlinit', 'calledTwice'], // +1
                ['content2-async', 'ns-view-show', 'calledTwice'], // +1
                ['content2-async', 'ns-view-touch', 'calledTwice'] // +1
            ]);

            describe('порядок всплытия событий', function() {
                ns.test.genEventsOrderTests([
                    ['content2-inner', 'ns-view-htmlinit', 0],
                    ['head', 'ns-view-htmlinit', 0],
                    ['app', 'ns-view-htmlinit', 0],

                    ['content2-async', 'ns-view-async', 0],

                    ['content2-inner', 'ns-view-show', 0],
                    ['head', 'ns-view-show', 0],
                    ['app', 'ns-view-show', 0],

                    ['content2-inner', 'ns-view-touch', 0],
                    ['head', 'ns-view-touch', 0],
                    ['app', 'ns-view-touch', 0],

                    ['content2-async', 'ns-view-htmlinit', 0],
                    ['content2-async', 'ns-view-show', 0],
                    ['content2-async', 'ns-view-touch', 0],

                    ['content2-async', 'ns-view-hide', 0],
                    ['content2-async', 'ns-view-htmldestroy', 0],

                    ['content2-async', 'ns-view-async', 1],
                    ['content2-inner', 'ns-view-touch', 1],

                    ['content2-async', 'ns-view-htmlinit', 1],
                    ['content2-async', 'ns-view-show', 1],
                    ['content2-async', 'ns-view-touch', 1]
                ]);
            });
        });
    });
});
