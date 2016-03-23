describe('ns.ViewCollection', function() {
    describe('redraw ViewCollection within parent view', function() {

        beforeEach(function() {

            // define models
            ns.Model.define('m-collection', {
                isCollection: true
            });

            ns.Model.define('m-collection-item', {
                params: {
                    p: null
                }
            });

            this.model = ns.Model.get('m-collection');
            // insert first item
            this.model.insert(ns.Model.get('m-collection-item', {p: 1}).setData({data: 1}));

            ns.Model.define('wrap-model');
            ns.Model.get('wrap-model', {}).setData({data: true});

            // define views
            ns.View.define('app');
            ns.ViewReact.define('wrap', {
                models: ['wrap-model']
            });
            ns.ViewReactCollection.define('v-collection', {
                models: [ 'm-collection' ],
                split: {
                    byModel: 'm-collection',
                    intoViews: 'v-collection-item'
                }
            });
            ns.ViewReact.define('v-collection-item', {
                models: [ 'm-collection-item' ]
            });
            this.APP = ns.View.create('app');

            // define layout
            ns.layout.define('app', {
                'app': {
                    'wrap': {
                        'v-collection': {}
                    }
                }
            });

            // first rewdraw
            var layoutParams = {};
            var layout = ns.layout.page('app', layoutParams);

            return new ns.Update(this.APP, layout, layoutParams)
                .render()
                .then(function() {
                    // set fake data to invalidate wrap-view
                    ns.Model.get('wrap-model').set('.fake', 1);

                    // start update to redraw wrap-view
                    return new ns.Update(this.APP, layout, layoutParams)
                        .render();
                }, this);
        });

        it('should have 1 v-collection-item after redraw', function() {
            expect(this.APP.node.getElementsByClassName('v-collection')[0].childNodes).to.have.length(1);
        });

    });

    describe('ViewCollection view in case on ModelCollection changes', function() {

        function shouldSaveVCollectionNode() {
            it('should save view-collection node', function() {
                var newVCollectionNode = this.APP.node.getElementsByClassName('v-collection')[0];
                expect(newVCollectionNode).to.be.equal(this.vCollectionNodeList[0])
            });
        }

        function shouldSaveNVCollectionItemNode(newPosition, oldPosition) {
            oldPosition = typeof oldPosition === 'number' ? oldPosition : newPosition;

            it('should save view-collection-item[' + oldPosition + '] node', function() {
                var newVCollectionItemNode = this.APP.node.getElementsByClassName('v-collection-item')[newPosition];
                expect(newVCollectionItemNode).to.be.equal(this.vCollectionItemNodeList[oldPosition]);
            });
        }

        function shouldHaveNViewCollectionItemNodes(n) {
            it('should have ' + n + ' view-collection-item nodes', function() {
                expect(
                    this.APP.node.getElementsByClassName('v-collection-item')
                ).to.have.length(n)
            });
        }

        beforeEach(function() {

            // define models
            ns.Model.define('m-collection', {
                isCollection: true
            });

            ns.Model.define('m-collection-item', {
                params: {
                    p: null
                }
            });

            // insert items in collection
            ns.Model.get('m-collection').insert([
                ns.Model.get('m-collection-item', {p: 1}).setData({data: 1}),
                ns.Model.get('m-collection-item', {p: 2}).setData({data: 2})
            ]);

            // define views
            ns.View.define('app');
            ns.ViewReactCollection.define('v-collection', {
                models: [ 'm-collection' ],
                split: {
                    byModel: 'm-collection',
                    intoViews: 'v-collection-item'
                }
            });
            ns.ViewReact.define('v-collection-item', {
                models: [ 'm-collection-item' ]
            });

            // define layout
            ns.layout.define('app', {
                'app': {
                    'v-collection': {}
                }
            });

            this.sinon.spy(ns.request, 'models');

            // initiate first rendering
            this.APP = ns.View.create('app');

            var layout = ns.layout.page('app', {});
            return new ns.Update(this.APP, layout, {})
                .render()
                .then(function() {
                    // copy nodes for phantom
                    this.vCollectionNodeList = [].slice.call(this.APP.node.getElementsByClassName('v-collection'), 0);
                    this.vCollectionItemNodeList = [].slice.call(this.APP.node.getElementsByClassName('v-collection-item'), 0);
                }, this);
        });

        describe('first rendering', function() {

            it('should have view-collection node', function() {
                expect(
                    this.vCollectionNodeList
                ).to.have.length(1)
            });

            shouldHaveNViewCollectionItemNodes(2);

        });

        describe('refresh layout without models changes', function() {

            beforeEach(function() {
                var layout = ns.layout.page('app', {});
                return new ns.Update(this.APP, layout, {})
                    .render()
            });

            shouldSaveVCollectionNode();
            shouldSaveNVCollectionItemNode(0);
            shouldSaveNVCollectionItemNode(1);

        });

        describe('refresh layout after model-item update', function() {

            beforeEach(function() {
                // update model collection item
                ns.Model.get('m-collection-item', {p: 1}).set('.newdata', 1);

                // start update to redraw views
                var layout = ns.layout.page('app', {});
                return new ns.Update(this.APP, layout, {})
                    .render();
            });

            shouldSaveVCollectionNode();
            shouldHaveNViewCollectionItemNodes(2);

            it('should render new view-collection-item[0] node', function() {
                var newVCollectionItemNode = this.APP.node.getElementsByClassName('ns-view-v-collection-item')[0];
                expect(newVCollectionItemNode).to.not.be.equal(this.vCollectionItemNodeList[0])
            });

            shouldSaveNVCollectionItemNode(1);

        });

        describe('refresh layout after insert new model-item ->', function() {

            describe('вставка в конец списка ->', function() {

                beforeEach(function() {
                    // insert another model-item in collection
                    ns.Model.get('m-collection').insert([
                        ns.Model.get('m-collection-item', {p: 3}).setData({data: 3})
                    ]);

                    // start update to redraw views
                    var layout = ns.layout.page('app', {});
                    return new ns.Update(this.APP, layout, {}).render();
                });

                shouldHaveNViewCollectionItemNodes(3);
                shouldSaveVCollectionNode();
                shouldSaveNVCollectionItemNode(0);
                shouldSaveNVCollectionItemNode(1);

            });

            describe('вставка в начало списка ->', function() {

                beforeEach(function() {
                    // insert another model-item in collection
                    ns.Model.get('m-collection').insert([
                        ns.Model.get('m-collection-item', {p: 3}).setData({data: 3})
                    ], 0);

                    // start update to redraw views
                    var layout = ns.layout.page('app', {});
                    return new ns.Update(this.APP, layout, {}).render();
                });

                shouldHaveNViewCollectionItemNodes(3);
                shouldSaveVCollectionNode();
                // первый элемент списка стал вторым
                shouldSaveNVCollectionItemNode(1, 0);
                // второй элемент списка стал третьим
                shouldSaveNVCollectionItemNode(2, 1);

            });

        });

        describe('refresh layout after remove model-item', function() {
            beforeEach(function() {

                // remove model-item from collection
                ns.Model.get('m-collection').remove(0);

                // start update to redraw views
                var layout = ns.layout.page('app', {});
                return new ns.Update(this.APP, layout, {})
                    .render();
            });

            shouldHaveNViewCollectionItemNodes(1);
            shouldSaveVCollectionNode();

            it('should save view-collection-item[1] node', function() {
                var newVCollectionItemNode = this.APP.node.getElementsByClassName('v-collection-item')[0];
                // we've removed first item, so new item[0] should be the same with old[1]
                expect(newVCollectionItemNode).to.be.equal(this.vCollectionItemNodeList[1])
            });

        });

        describe('refresh layout after model-item destroy', function() {
            beforeEach(function() {
                var layout = ns.layout.page('app', {});

                ns.Model.destroy(ns.Model.get('m-collection-item', {p: 1}));

                return new ns.Update(this.APP, layout, {})
                    .render();
            });

            it('should save view-collection-item[1] node', function() {
                var newVCollectionItemNode = this.APP.node.getElementsByClassName('v-collection-item')[0];
                expect(newVCollectionItemNode).to.be.equal(this.vCollectionItemNodeList[1])
            });
        });

        describe('refresh layout after model-collection update', function() {

            beforeEach(function(finish) {
                // touching model after a small timeout to guarantee, that
                // model and view will have different timeout attribute
                window.setTimeout(function() {
                    this.vCollection = this.sinon.getViewByKey(this.APP, 'view=v-collection');
                    this.vCollection.resetStateOfUpdate();

                    ns.Model.get('m-collection').touch();

                    // start update to redraw a core view
                    var layout = ns.layout.page('app', {});
                    return new ns.Update(this.APP, layout, {})
                        .render()
                        .then(function() {
                            finish();
                        });
                }.bind(this), 10);
            });

            it('should update view-collection', function() {
                expect(this.vCollection.hasStateOfUpdate()).to.be.true;
            });

            shouldSaveNVCollectionItemNode(0);
            shouldSaveNVCollectionItemNode(1);

        });

        describe('refresh layout after model-item change position', function() {

            beforeEach(function() {
                var secondItem = ns.Model.get('m-collection-item', {p: 2});

                ns.Model.get('m-collection').remove(secondItem);
                ns.Model.get('m-collection').insert(secondItem, 0);

                // start update to redraw views
                var layout = ns.layout.page('app', {});
                return new ns.Update(this.APP, layout, {}).render();
            });

            shouldHaveNViewCollectionItemNodes(2);
            shouldSaveVCollectionNode();
            shouldSaveNVCollectionItemNode(0, 1);
            shouldSaveNVCollectionItemNode(1, 0);

        });

        describe('refresh layout after model-item change position and insert new item', function() {

            beforeEach(function() {
                var secondItem = ns.Model.get('m-collection-item', {p: 2});
                var newItem = ns.Model.get('m-collection-item', {p: 3}).setData({data: 3});

                ns.Model.get('m-collection').remove(secondItem);
                ns.Model.get('m-collection').insert(secondItem, 0);
                ns.Model.get('m-collection').insert(newItem);

                // start update to redraw views
                var layout = ns.layout.page('app', {});
                return new ns.Update(this.APP, layout, {}).render();
            });

            shouldHaveNViewCollectionItemNodes(3);
            shouldSaveVCollectionNode();
            shouldSaveNVCollectionItemNode(0, 1);
            shouldSaveNVCollectionItemNode(1, 0);

        });

    });

    describe('ViewCollection update after ModelCollection destruction', function() {
        beforeEach(function() {

            // define models
            ns.Model.define('mCollection', {
                split: {
                    model_id: 'mItem',
                    items: '.data',
                    params: {
                        id: '.id'
                    }
                }
            });

            ns.Model.define('mItem', {
                params: {
                    id: null
                }
            });

            // set data to collection
            ns.Model.get('mCollection').setData({data: [{id: '0'}, {id: '1'}]});

            // define views
            ns.View.define('app');

            ns.ViewReactCollection.define('vCollection', {
                models: [ 'mCollection' ],
                split: {
                    byModel: 'mCollection',
                    intoViews: 'vItem'
                }
            });
            ns.ViewReact.define('vItem', {
                models: [ 'mItem' ]
            });

            // define layout
            ns.layout.define('app', {
                'app': {
                    'vCollection': {}
                }
            });

            // initiate first rendering
            this.APP = ns.View.create('app');
            var layout = ns.layout.page('app', {});
            return new ns.Update(this.APP, layout, {})
                .render()
                .then(function() {
                    ns.Model.destroy(ns.Model.get('mCollection'));
                    ns.Model.destroy(ns.Model.get('mItem', {id: '0'}));
                    ns.Model.destroy(ns.Model.get('mItem', {id: '1'}));

                    ns.Model.get('mCollection').setData({data: [{id: '2'}]});

                    return new ns.Update(this.APP, layout, {}).render();
                }, this);
        });

        it('shouldn`t find destroyed models', function() {
            expect(ns.Model.getValid('mItem', {id: '0'})).to.be.equal(null);
            expect(ns.Model.getValid('mItem', {id: '1'})).to.be.equal(null);
        });

        it('should have 1 node for view vItem', function() {
            expect(this.APP.node.querySelectorAll('.vItem').length).to.be.equal(1);
        });

    });

    describe('Update of recursive view collections', function() {
        beforeEach(function() {
            ns.Model.define('m-collection-2', {
                params: {
                    id: null
                },
                split: {
                    model_id: 'm-collection-2',
                    items: '.data',
                    params: {
                        id: '.id'
                    }
                }
            });

            // recursive view
            ns.ViewReactCollection.define('v-collection-2', {
                models: [ 'm-collection-2' ],
                split: {
                    byModel: 'm-collection-2',
                    intoViews: 'v-collection-2'
                }
            });

            ns.View.define('app');
            this.APP = ns.View.create('app');

            ns.layout.define('app-2', {
                'app': {
                    'v-collection-2': {}
                }
            });

            this.model = ns.Model.get('m-collection-2', {id: '0'}).setData({
                data: [{
                    data: [],
                    title: '1',
                    id: '1'
                }, {
                    data: [],
                    title: '2',
                    id: '2'
                }],
                title: '0'
            });

            // first rewdraw
            var layout = ns.layout.page('app-2');
            return new ns.Update(this.APP, layout, {id: '0'})
                .render()
                .then(function() {
                    this.collectionViewNode = this.APP.node.getElementsByClassName('v-collection-2')[0];

                    // Load subcollection data.
                    ns.Model.get('m-collection-2', {id: '1'}).setData({
                        data: [
                            {
                                data: [{
                                    data: [],
                                    title: '1.1.1',
                                    id: '1.1.1'
                                }],
                                title: '1.1',
                                id: '1.1'
                            },
                            {
                                data: [],
                                title: '1.2',
                                id: '1.2'
                            }
                        ],
                        title: '1',
                        id: '1'
                    });

                    // start update to redraw views
                    var layout = ns.layout.page('app-2');
                    return new ns.Update(this.APP, layout, {id: '0'})
                        .render()
                        .then(function() {
                            // Skip this update loop.

                            var layout = ns.layout.page('app-2');
                            return new ns.Update(this.APP, layout, {id: '0'})
                                .render()
                                .then(function() {
                                    // Edit subcollection later on.
                                    ns.Model.get('m-collection-2', {id: '1.1'}).set('.title', '1.1-edit');

                                    var layout = ns.layout.page('app-2');
                                    return new ns.Update(this.APP, layout, {id: '0'})
                                        .render();
                                }, this);
                        }, this);
                }, this);
        });

        it('should correctly update nested nodes', function() {
            var cols = {};
            cols['1'] = $('.v-collection-2[data-key="view=v-collection-2&id=1"]', this.collectionViewNode);
            cols['2'] = $('.v-collection-2[data-key="view=v-collection-2&id=2"]', this.collectionViewNode);
            cols['1.1'] = cols['1'].find('.v-collection-2[data-key="view=v-collection-2&id=1.1"]');
            cols['1.2'] = cols['1'].find('.v-collection-2[data-key="view=v-collection-2&id=1.2"]');
            cols['1.1.1'] = cols['1.1'].find('.v-collection-2[data-key="view=v-collection-2&id=1.1.1"]');
            cols['2.x'] = cols['2'].find('.v-collection-2');

            expect(cols['1'].length).to.be.equal(1);
            expect(cols['2'].length).to.be.equal(1);
            expect(cols['1.1'].length).to.be.equal(1);
            expect(cols['1.2'].length).to.be.equal(1);
            expect(cols['1.1.1'].length).to.be.equal(1);
            expect(cols['2.x'].length).to.be.equal(0);
        });
    });

    describe('Update of nested view collections', function() {
        beforeEach(function() {
            ns.Model.define('nested-model', {
                params: {
                    id: null
                }
            });

            ns.Model.define('outer-collection-model', {
                isCollection: true
            });

            ns.Model.define('nested-collection', {
                isCollection: true,
                params: {
                    id: null
                }
            });

            ns.ViewReact.define('nested-view-collection-item', {
                models: [ 'nested-model' ]
            });

            ns.ViewReactCollection.define('nested-view-collection', {
                models: [ 'nested-collection' ],
                split: {
                    byModel: 'nested-collection',
                    intoViews: 'nested-view-collection-item'
                }
            });

            ns.ViewReactCollection.define('outer-view-collection', {
                models: [ 'outer-collection-model' ],
                split: {
                    byModel: 'outer-collection-model',
                    intoViews: 'nested-view-collection'
                }
            });

            ns.View.define('app');
            this.APP = ns.View.create('app');

            ns.layout.define('app-3', {
                'app': {
                    'outer-view-collection': true
                }
            });

            var parent = ns.Model.get('outer-collection-model');

            var itemA = ns.Model.get('nested-model', {id: 'A'}).setData({});
            var itemB = ns.Model.get('nested-model', {id: 'B'}).setData({});
            var itemC = ns.Model.get('nested-model', {id: 'C'}).setData({});

            var childA = ns.Model.get('nested-collection', {id: 'A'});
            var childB = ns.Model.get('nested-collection', {id: 'B'});

            childA.insert([itemA]);
            childB.insert([itemB, itemC]);

            parent.insert([childA, childB]);

            var layout = ns.layout.page('app-3');
            return new ns.Update(this.APP, layout, {})
                .render()
                .then(function() {
                    var itemD = ns.Model.get('nested-model', {id: 'D'}).setData({});
                    var childC = ns.Model.get('nested-collection', {id: 'C'});

                    childC.insert([itemD]);
                    parent.insert(childC, 2);

                    var layout = ns.layout.page('app-3');
                    return new ns.Update(this.APP, layout, {})
                        .render()
                        .then(function() {
                            this.collectionViewNode = this.APP.node.querySelector('.outer-view-collection');
                        }, this);
                }, this);
        });

        it('should correctly update nested nodes', function() {
            var childNodesContainer = this.collectionViewNode.childNodes;
            var childANode = childNodesContainer[0];
            var childBNode = childNodesContainer[1];
            var childCNode = childNodesContainer[2];

            expect(childANode.childNodes).to.have.length(1);
            expect(childBNode.childNodes).to.have.length(2);
            expect(childCNode.childNodes).to.have.length(1);
        });
    });

    describe('Перерисовка вложенных коллекций (VC1_INVALID -> VC2_VALID -> VC2_ITEM_SOME_INVALID) ->', function() {

        beforeEach(function() {
            ns.Model.define('nested-model', {
                params: {
                    id: null
                }
            });

            ns.Model.define('outer-collection-model', {
                isCollection: true
            });

            ns.Model.define('nested-collection', {
                isCollection: true,
                params: {
                    id: null
                }
            });

            ns.ViewReact.define('nested-view-collection-item', {
                models: [ 'nested-model' ]
            });

            ns.ViewReactCollection.define('nested-view-collection', {
                models: [ 'nested-collection' ],
                split: {
                    byModel: 'nested-collection',
                    intoViews: 'nested-view-collection-item'
                }
            });

            ns.ViewReactCollection.define('outer-view-collection', {
                models: [ 'outer-collection-model' ],
                split: {
                    byModel: 'outer-collection-model',
                    intoViews: 'nested-view-collection'
                }
            });

            ns.View.define('app');
            this.APP = ns.View.create('app');

            ns.layout.define('app-3', {
                'app': 'outer-view-collection'
            });

            var parent = ns.Model.get('outer-collection-model');

            var itemA = ns.Model.get('nested-model', {id: 'A'}).setData({});
            var itemB = ns.Model.get('nested-model', {id: 'B'}).setData({});
            var itemC = ns.Model.get('nested-model', {id: 'C'}).setData({});

            var childA = ns.Model.get('nested-collection', {id: 'A'});
            var childB = ns.Model.get('nested-collection', {id: 'B'});

            childA.insert([itemA]);
            childB.insert([itemB, itemC]);

            parent.insert([childA, childB]);

            var layout = ns.layout.page('app-3');
            return new ns.Update(this.APP, layout, {}).render();
        });

        describe('невалиден первый элемент вложенной коллекции ->', function() {

            beforeEach(function() {
                ns.Model.get('outer-collection-model').set('.foo', 'bar');
                ns.Model.get('nested-model', {id: 'B'}).set('.foo', 'bar');

                this.itemB = this.sinon.getViewByKey(this.APP, 'view=nested-view-collection-item&id=B');
                this.itemC = this.sinon.getViewByKey(this.APP, 'view=nested-view-collection-item&id=C');
                this.itemB.resetStateOfUpdate();
                this.itemC.resetStateOfUpdate();

                var layout = ns.layout.page('app-3');
                return new ns.Update(this.APP, layout, {}).render();
            });

            it('вложенная коллекция должна иметь два элемента', function() {
                expect(this.APP.node.querySelectorAll('[data-key="view=nested-view-collection-item&id=B"]')).to.have.length(1);
                expect(this.APP.node.querySelectorAll('[data-key="view=nested-view-collection-item&id=C"]')).to.have.length(1);
            });

            it('вложенная коллекция должна перерисовать первый элемент', function() {
                expect(this.itemB.hasStateOfUpdate()).to.be.true;
            });

            it('вложенная коллекция должна сохранить второй элемент', function() {
                expect(this.itemC.hasStateOfUpdate()).to.be.false;
            });

        });

        describe('невалиден второй элемент вложенной коллекции ->', function() {

            beforeEach(function() {
                ns.Model.get('outer-collection-model').set('.foo', 'bar');
                ns.Model.get('nested-model', {id: 'C'}).set('.foo', 'bar');

                this.itemB = this.sinon.getViewByKey(this.APP, 'view=nested-view-collection-item&id=B');
                this.itemC = this.sinon.getViewByKey(this.APP, 'view=nested-view-collection-item&id=C');
                this.itemB.resetStateOfUpdate();
                this.itemC.resetStateOfUpdate();

                var layout = ns.layout.page('app-3');
                return new ns.Update(this.APP, layout, {}).render();
            });

            it('вложенная коллекция должна иметь два элемента', function() {
                expect(this.APP.node.querySelectorAll('[data-key="view=nested-view-collection-item&id=B"]')).to.have.length(1);
                expect(this.APP.node.querySelectorAll('[data-key="view=nested-view-collection-item&id=C"]')).to.have.length(1);
            });

            it('вложенная коллекция должна сохранить первый элемент', function() {
                expect(this.itemB.hasStateOfUpdate()).to.be.false;
            });

            it('вложенная коллекция должна перерисовать второй элемент', function() {
                expect(this.itemC.hasStateOfUpdate()).to.be.true;

            });
        });

    });

    describe('Обновление внешней коллекции работает корректно, если внутренняя не изменилсь', function() {

        // это тест, чтобы исправить JS-ошибку
        // теперь должен кидаться варнинг, а вложенная коллекция инвалидироваться

        beforeEach(function() {

            ns.Model.define('parent-mc', {isCollection: true});
            ns.Model.define('parent-mc-item', { params: {pid: null} });

            ns.Model.define('child-mc', {
                isCollection: true,
                split: {
                    items: '.items',
                    model_id: 'child-mc-item',
                    params: {
                        cid: '.cid'
                    }
                }
            });
            ns.Model.define('child-mc-item', { params: {cid: null} });

            ns.ViewReactCollection.define('parent-vc', {
                models: [ 'parent-mc' ],
                split: {
                    byModel: 'parent-mc',
                    intoViews: 'child-vc'
                }
            });
            ns.ViewReactCollection.define('child-vc', {
                models: [ 'parent-mc-item', 'child-mc' ],
                split: {
                    byModel: 'child-mc',
                    intoViews: 'child-vc-item'
                }
            });
            ns.ViewReact.define('child-vc-item', {
                models: ['child-mc-item']
            });

            ns.View.define('app');

            ns.layout.define('test', {
                'app': {
                    'parent-vc': {}
                }
            });

            ns.Model.get('parent-mc').insert([
                ns.Model.get('parent-mc-item', {pid: 1}).setData({pid: 1, val: 1})
            ]);

            ns.Model.get('child-mc', {pid: 1}).insert([
                ns.Model.get('child-mc-item', {cid: 1}).setData({cid: 1, val: 1})
            ]);

            this.sinon.stub(ns.log, 'debug');

            this.view = ns.View.create('app');
            var layout = ns.layout.page('test');

            ns.test.modelsValidAutorespondByMock(this.sinon, {
                '/models/?_m=child-mc': {
                    models: [
                        {
                            data: {
                                items: [
                                    {cid: 3, val: 3}
                                ]
                            }
                        }
                    ]

                }
            });

            return new ns.Update(this.view, layout, {})
                .render()
                .then(function() {
                    ns.Model.get('child-mc', {pid: 1}).invalidate();
                    return new ns.Update(this.view, layout, {}).render();
                }, this);
        });

        it('должен перезапросить модель вложенной коллекции', function() {
            expect(this.sinon.server.requests[0].url).to.be.equal('/models/?_m=child-mc');
        });

        it('должен нарисовать один элемент коллекции', function() {
            var childVC = this.view.node.getElementsByClassName('child-vc')[0];
            expect(childVC.childNodes).to.have.length(1);
        });

        it('должен удалить старый элемент и заменить его на новый', function() {
            var childVC = this.view.node.getElementsByClassName('child-vc')[0];
            expect(childVC.childNodes[0].getAttribute('data-key')).to.be.equal('view=child-vc-item&cid=3');
        });

    });

    describe('асинхронная коллекция', function() {

        beforeEach(function() {

            ns.test.modelsValidAutorespondByMock(this.sinon, {
                '/models/?_m=mc': {
                    models: [
                        {
                            data: {
                                items: [
                                    {id: '1', val: 1},
                                    {id: '2', val: 2},
                                    {id: '3', val: 3}
                                ]
                            }
                        }
                    ]

                }
            });

            ns.layout.define('app', {
                'app': {
                    'vc&': {}
                }
            });

            ns.Model.define('mc', {
                split: {
                    model_id: 'mc-item',
                    items: '.items',
                    params: {
                        id: '.id'
                    }
                }
            });
            ns.Model.define('mc-item', {
                params: {
                    id: null
                }
            });

            ns.View.define('app');
            ns.ViewReactCollection.define('vc', {
                models: ['mc'],
                split: {
                    byModel: 'mc',
                    intoViews: 'vc-item'
                },
                component: {
                    render: function() {
                        if (this.props.view.isLoading()) {
                            return React.createElement(
                                'div',
                                no.extend({}, this.props, {
                                    className: 'vc async'
                                })
                            );
                        } else {
                            return React.createElement(
                                'div',
                                this.props,
                                this.createChildren()
                            )
                        }
                    }
                }
            });

            ns.ViewReact.define('vc-item', {
                models: ['mc-item']
            });


            this.view = ns.View.create('app');
            var layout = ns.layout.page('app');

            return new ns.Update(this.view, layout, {})
                .render()
                .then(function(result) {
                    this.result = result;
                }, this);
        });

        it('коллекция должна отрисоваться в async-режиме', function() {
            expect(this.view.node.querySelectorAll('.vc.async')).to.have.length(1);
        });

        describe('перерисовка после получения моделей', function() {

            beforeEach(function() {
                return Vow.all(this.result.async);
            });

            it('коллекция должна отрисоваться в обычном режиме', function() {
                expect(this.view.node.querySelectorAll('.vc')).to.have.length(1);
            });

            it('коллекция должна отрисовать свои элементы', function() {
                expect(this.view.node.querySelectorAll('.vc-item')).to.have.length(3);
            });

        });


    });
});
