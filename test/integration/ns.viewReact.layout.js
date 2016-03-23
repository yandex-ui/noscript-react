describe('ns.ViewReact dynamic layouts ->', function() {

    describe('Простой случай ->', function() {

        beforeEach(function() {

            ns.layout.define('app', {
                'app': {
                    'view1': {
                        'view2': {}
                    }
                }
            });

            ns.layout.define('view-layout', {
                'box@': {
                    'view3': {}
                }
            });

            ns.layout.define('view-empty', {
                'box@': {}
            });

            this.view2GetLayoutFn = this.sinon.stub();

            ns.View.define('app');
            ns.ViewReact.define('view1');
            ns.ViewReact.define('view2', {
                methods: {
                    patchLayout: function() {
                        return this.getLayout();
                    },

                    getLayout: this.view2GetLayoutFn
                }
            });
            ns.ViewReact.define('view3');
            ns.ViewReact.define('content');

            this.view = ns.View.create('app');
        });

        describe('Отрисовка ->', function() {

            it('Должен создать view3, если отдали такой layout', function() {
                this.view2GetLayoutFn.returns('view-layout');

                return new ns.Update(this.view, ns.layout.page('app'), {})
                    .render()
                    .then(function() {
                        expect(this.view.node.querySelectorAll('.view2 .view3')).to.have.length(1);
                    }, this);
            });

            it('Не должен создать view3, если не отдали layout', function() {
                this.view2GetLayoutFn.returns('view-empty');

                return new ns.Update(this.view, ns.layout.page('app'), {})
                    .render()
                    .then(function() {
                        expect(this.view.node.querySelectorAll('.view2 .view3')).to.have.length(0);
                    }, this);
            });

            it('Должен правильно перерисовывать виды при изменении layout', function() {
                this.view2GetLayoutFn.returns('view-empty');

                return new ns.Update(this.view, ns.layout.page('app'), {})
                    .render()
                    .then(function() {
                        this.view2GetLayoutFn.returns('view-layout');
                        return this.view.update();
                    }, this)
                    .then(function() {
                        expect(this.view.node.querySelectorAll('.view2 .view3')).to.have.length(1);

                        this.view2GetLayoutFn.returns('view-empty');
                        return this.view.update();
                    }, this)
                    .then(function() {
                        var boxView = this.sinon.getViewByKey(this.view, 'box=box');
                        expect(this.view.node.querySelectorAll('.view2 .view3')).to.have.length(0);
                        expect(boxView.views['view=view3']).to.be.exist;
                        expect(boxView.active['view3']).to.be.empty;

                        this.view2GetLayoutFn.returns('view-layout');
                        return this.view.update();
                    }, this)
                    .then(function() {
                        var boxView = this.sinon.getViewByKey(this.view, 'box=box');
                        expect(this.view.node.querySelectorAll('.view2 .view3')).to.have.length(1);
                        expect(boxView.views['view=view3']).to.be.exist;
                        expect(boxView.active['view3']).to.be.exist;
                    }, this);
            });

        });

    });

    describe('Ограничения ->', function() {

        beforeEach(function() {
            ns.layout.define('app', {
                'app': {
                    'view1': {}
                }
            });

            ns.layout.define('view-layout', {
                'view3': {}
            });

            ns.View.define('app');
            this.APP = ns.View.create('app');

            this.sinon.stub(ns.View, 'assert');

            // Выключаем логирование ошибок
            ns.log.exception.restore();
            // убираем логи из консоли
            this.sinon.stub(ns.log, 'exception');
        });

        it('должен бросить исключение, если верхушка дерева не box', function() {
            ns.ViewReact.define('view1', {
                methods: {
                    patchLayout: function() {
                        return 'view-layout';
                    }
                }
            });

            return new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                .then(function() {
                    return Vow.reject('resolved');
                }, function() {
                    expect(ns.View.assert).to.be.calledWith(false, 12);
                    return Vow.resolve();
                });
        });

        it('должен бросить исключение, если #patchLayout ничего не вернул', function() {
            ns.ViewReact.define('view1', {
                methods: {
                    patchLayout: function() {
                        return null;
                    }
                }
            });

            return new ns.Update(this.APP, ns.layout.page('app'), {}).render()
                .then(function() {
                    return Vow.reject('resolved');
                }, function() {
                    expect(ns.View.assert).to.be.calledWith(false, 11);
                    return Vow.resolve();
                });
        });

    });

    describe('Коллеция ->', function() {

        beforeEach(function() {

            // layouts
            ns.layout.define('app', {
                'app': {
                    'vc': {}
                }
            });

            ns.layout.define('vc-layout-item1', {
                'vc-item1': {
                    'vc-item1-subview': {}
                }
            });

            ns.layout.define('vc-layout-item2', {
                'vc-item2': {
                    'vc-item2-subview': {}
                }
            });

            // models
            ns.Model.define('mc-item', {
                params: { id: null },
                methods: {
                    isItem1: function() {
                        return this.get('.value') === 1;
                    }
                }
            });

            ns.Model.define('mc', {
                split: {
                    items: '.item',
                    params: { id: '.id' },
                    model_id: 'mc-item'
                }
            });

            // views
            ns.View.define('app');
            ns.ViewReactCollection.define('vc', {
                models: {
                    'mc': true
                },
                split: {
                    byModel: 'mc',
                    intoLayouts: function(model) {
                        if (model.isItem1()) {
                            return 'vc-layout-item1';
                        } else {
                            return 'vc-layout-item2';
                        }
                    }
                }
            });

            ns.ViewReact.define('vc-item1', { models: ['mc-item'] });
            ns.ViewReact.define('vc-item1-subview');

            ns.ViewReact.define('vc-item2', { models: ['mc-item'] });
            ns.ViewReact.define('vc-item2-subview');

            // run
            ns.Model.get('mc').setData({
                item: [
                    {id: 1, value: 1},
                    {id: 2, value: 2},
                    {id: 3, value: 3}
                ]
            });

            this.view = ns.View.create('app');
            return new ns.Update(this.view, ns.layout.page('app'), {}).render();
        });

        describe('Отрисовка ->', function() {

            it('Должен создать один ".vc-item1 > .vc-item1-subview"', function() {
                expect(this.view.node.querySelectorAll('.vc-item1 > .vc-item1-subview')).to.have.length(1);
            });

            it('Должен создать два ".vc-item2 > .vc-item2-subview"', function() {
                expect(this.view.node.querySelectorAll('.vc-item2 > .vc-item2-subview')).to.have.length(2);
            });

        });

        describe('Перерисовки внутри детей ->', function() {

            /*
             Следующий случай:
             vc
               vc-item1
                 vc-item1-subview (invalid)
               vc-item2
                 vc-item2-subview (valid)
               vc-item2
                 vc-item2-subview (valid)
             */

            beforeEach(function() {
                this.vcItem1Subview = this.sinon.getViewByKey(this.view, 'view=vc-item1-subview');
                this.vcItem1Subview.invalidate();
                this.vcItem1Subview.resetStateOfUpdate();

                // запускаем апдейт, он должен перерисоваться
                return new ns.Update(this.view, ns.layout.page('app'), {}).render();
            });

            it('должен пересчитать (и, если необходимо, перерисовать) вид "vc-item1-subview"', function() {
                var vcItem1Subview = this.sinon.getViewByKey(this.view, 'view=vc-item1-subview');

                expect(vcItem1Subview.hasStateOfUpdate()).to.be.true;
            });

        });

    });

    describe('Коллеция (истории) ->', function() {

        describe('Элемент коллекции имеет #patchLayout ->', function() {

            beforeEach(function() {
                // layouts
                ns.layout.define('app-vc2', {
                    'app': {
                        'vc2': {}
                    }
                });

                ns.layout.define('vc2-item-layout', {
                    'vc2-item-box@': {
                        'vc2-item1': {},
                        'vc2-item2': {}
                    }
                });

                // models
                ns.Model.define('mc2-item', {
                    params: { id: null }
                });

                ns.Model.define('mc2', {
                    split: {
                        items: '.item',
                        params: { id: '.id' },
                        model_id: 'mc2-item'
                    }
                });
                ns.Model.get('mc2').setData({
                    item: [
                        {id: 1, value: 1}
                    ]
                });

                // views
                ns.View.define('app');
                ns.ViewReactCollection.define('vc2', {
                    models: {
                        'mc2': false
                    },
                    split: {
                        byModel: 'mc2',
                        intoViews: 'vc2-item'
                    }
                });

                ns.ViewReact.define('vc2-item', {
                    models: {
                        'mc2-item': false
                    },
                    methods: {
                        patchLayout: function() {
                            return 'vc2-item-layout';
                        }
                    }
                });

                ns.ViewReact.define('vc2-item1', {
                    models: ['mc2-item']
                });
                ns.ViewReact.define('vc2-item2', {
                    models: ['mc2-item']
                });

                this.view = ns.View.create('app');
            });

            it('должен отрисовать `vc2-item`1 и `vc2-item2`', function() {
                return new ns.Update(this.view, ns.layout.page('app-vc2'), {})
                    .render()
                    .then(function() {
                        expect(this.view.node.querySelector('.vc2-item1')).to.be.an.instanceof(Node);
                        expect(this.view.node.querySelector('.vc2-item2')).to.be.an.instanceof(Node);
                    }, this);
            });

            it('должен пересчитать (и, если необходимо, перерисовать) вид `vc2-item1` и `vc2-item2` при втором апдейте', function() {
                return new ns.Update(this.view, ns.layout.page('app-vc2'), {})
                    .render()
                    .then(function() {
                        var vc2Item1 = this.sinon.getViewByKey(this.view, 'view=vc2-item1&id=1');
                        var vc2Item2 = this.sinon.getViewByKey(this.view, 'view=vc2-item2&id=1');
                        vc2Item1.resetStateOfUpdate();
                        vc2Item2.resetStateOfUpdate();

                        ns.Model.get('mc2').setData({
                            item: [
                                {id: 1, value: 1}
                            ]
                        });

                        return new ns.Update(this.view, ns.layout.page('app-vc2'), {})
                            .render()
                            .then(function() {
                                expect(vc2Item1.hasStateOfUpdate()).to.be.true;
                                expect(vc2Item2.hasStateOfUpdate()).to.be.true;
                            }, this)
                    }, this);
            });

        });

    });

});
