describe('ns.BoxReact', function() {

    beforeEach(function() {
        ns.layout.define('app', {
            app: {
                content: {
                    'contentBox@': true
                }
            }
        });

        ns.layout.define('content1', {
            'app content contentBox@': {
                content1: {}
            }
        }, 'app');

        ns.layout.define('content2', {
            'app content contentBox@': {
                content2: {}
            }
        }, 'app');

        ns.layout.define('content3', {
            'app content contentBox@': {
                'content3&': {}
            }
        }, 'app');

        ns.layout.define('content4', {
            'app content contentBox@': {
                content4: {}
            }
        }, 'app');

        ns.layout.define('parent1', {
            app: {
                parent: {
                    'content@': {
                        content1: true
                    }
                }
            }
        });

        ns.layout.define('parent2', {
            app: {
                parent: {
                    'content@': {
                        content2: true
                    }
                }
            }
        });

        // define views
        ns.View.define('app');
        ns.ViewReact.define('content');
        ns.ViewReact.define('content1', {
            params: {
                p: null
            }
        });
        ns.ViewReact.define('content2');
        ns.ViewReact.define('content3', {
            models: ['model3']
        });

        ns.ViewReact.define('content4', {
            params: function() {
                return {
                    pOwn: ns.Model.getValid('model4').get('.value')
                };
            }
        });

        ns.ViewReact.define('parent', {
            p: null
        });

        ns.Model.define('model3', {
            params: {
                p: null
            }
        });

        ns.Model.define('model4', {});

        /**
         * @type {ns.View}
         */
        this.APP = ns.View.create('app');
    });

    afterEach(function() {
        delete this.APP;
    });

    describe('#destroy', function() {

        beforeEach(function() {
            this.sinon.spy(ns.ViewReact.prototype, 'destroy');
            this.sinon.spy(ns.BoxReact.prototype, 'destroy');

            var _this = this;

            var page1Params = {};
            var page1 = ns.layout.page('content2', page1Params);
            var page2Params = { p: 1 };
            var page2 = ns.layout.page('content1', page2Params);

            return new ns.Update(this.APP, page1, page1Params)
                .render()
                .then(function() {
                    return new ns.Update(_this.APP, page2, page2Params).render();
                });
        });

        it('должен вызвать #destroy у ns.Box', function() {
            this.APP.destroy();
            expect(ns.BoxReact.prototype.destroy).to.have.callCount(1);
        });

        it('должен уничтожить все виды внутри бокса', function() {
            this.APP.destroy();
            // content + content1 + content2
            expect(ns.ViewReact.prototype.destroy).to.have.callCount(3);
        });

    });

    describe('#invalidate', function() {

        beforeEach(function() {
            var layout = ns.layout.page('content2', {});
            return new ns.Update(this.APP, layout, {})
                .render()
                .then(function() {
                    this.sinon.spy(ns.ViewReact.prototype, 'invalidate');
                    var layout = ns.layout.page('content1', { p: 1 });

                    return new ns.Update(this.APP, layout, { p: 1 }).render();
                }, this);
        });

        it('должен вызывать invalidate для всех видов в ns.BoxReact', function() {
            var allAppViews = this.APP._getDescendantsAndSelf();

            // app + content + contentBox + 2 вида внутри
            expect(allAppViews).to.have.length(5);
            allAppViews.forEach(function(view) {
                expect(view.isValid()).to.be.true;
            });

            this.APP.invalidate();

            allAppViews.forEach(function(view) {
                if (view instanceof ns.BoxReact) {
                    return;
                }
                expect(view.isValid()).to.be.false;
            });

        });

    });

    describe('view select ->', function() {

        describe('regular view ->', function() {

            beforeEach(function() {
                var layout = ns.layout.page('content2', {});
                return new ns.Update(this.APP, layout, {}).render();
            });

            it('should have node for "content2"', function() {
                expect($(this.APP.node).find('.content2')).to.have.length(1);
            });

        });

        describe('async view ->', function() {

            beforeEach(function() {
                var layout = ns.layout.page('content3', {});
                return new ns.Update(this.APP, layout, {}).render();
            });

            it('should have node for "content3"', function() {
                expect($(this.APP.node).find('.content3')).to.have.length(1);
            });

        });

    });

    describe('view change', function() {

        describe('"content2" -> "content1"', function() {

            beforeEach(function() {
                return new ns.Update(
                        this.APP,
                        ns.layout.page('content2', {}),
                        {}
                    )
                    .render()
                    .then(function() {
                        var page2Params = { p: 1 };
                        return new ns.Update(
                                this.APP,
                                ns.layout.page('content1', page2Params),
                                page2Params
                            )
                            .render();
                    }, this);
            });

            it('should have node for "content1" ', function() {
                expect($(this.APP.node).find('.content1')).to.have.length(1);
            });

            it('should not have node for "content2" ', function() {
                expect($(this.APP.node).find('.content2')).to.have.length(0);
            });

        });

        describe('"content1"(p=1) -> "content1"(p=2)', function() {

            beforeEach(function() {
                var page1Params = { p: 1 };
                return new ns.Update(
                        this.APP,
                        ns.layout.page('content1', page1Params),
                        page1Params
                    )
                    .render()
                    .then(function() {
                        var page2Params = { p: 2 };
                        return new ns.Update(
                                this.APP,
                                ns.layout.page('content1', page2Params),
                                page2Params
                            )
                            .render();
                    }, this);
            });

            it('should have one node for "content1" ', function() {
                expect($(this.APP.node).find('.content1')).to.have.length(1);
            });

            it('should have second visible node for "content1" (view=content1&p=2) ', function() {
                expect($(this.APP.node).find('.content1[data-key="view=content1&p=2"]')).to.be.length(1);
            });

        });

        describe('"async-view"(p=1) -> "async-view"(p=2)', function() {

            beforeEach(function() {
                var page1Params = { p: 1 };
                return new ns.Update(
                        this.APP,
                        ns.layout.page('content3', page1Params),
                        page1Params
                    )
                    .render()
                    .then(function(promises) {

                        // finish first draw
                        this.sinon.server.requests[0].respond(
                            200,
                            { 'Content-Type': 'application/json' },
                            JSON.stringify({
                                models: [
                                    { data: true }
                                ]
                            })
                        );

                        return Vow.all(promises.async).then(function() {
                            var page2Params = { p: 2 };
                            return new ns.Update(
                                    this.APP,
                                    ns.layout.page('content3', page2Params),
                                    page2Params
                                )
                                .render()
                                .then(function() {
                                    this.sinon.server.requests[1].respond(
                                        200,
                                        { 'Content-Type': 'application/json' },
                                        JSON.stringify({
                                            models: [
                                                { data: true }
                                            ]
                                        })
                                    );
                                }, this);
                        }, this);
                    }, this);
            });

            describe('first pass ->', function() {

                it('should create second "content3" node', function() {
                    expect(
                        $(this.APP.node).find('.content3')
                    ).to.have.length(1);
                });

            });

            describe('second pass ->', function() {

                it('should create second "content3" node', function() {
                    expect(
                        $(this.APP.node).find('.content3')
                    ).to.have.length(1);
                });

                it('should show second "content3" node ("view=content3&p=2")', function() {
                    expect(
                        $(this.APP.node).find('.content3[data-key="view=content3&p=2"]')
                    ).to.have.length(1);
                });

            });

        });

        describe('"content4"(pOwn=1) -> "content4"(pOwn=2), where pOwn depends only of models ->', function() {

            beforeEach(function() {
                var model = ns.Model.get('model4');
                model.setData({ value: 1 });

                return new ns.Update(
                        this.APP,
                        ns.layout.page('content4', {}),
                        {}
                    )
                    .render()
                    .then(function() {
                        model.set('.value', 2);
                        return new ns.Update(
                                this.APP,
                                ns.layout.page('content4', {}),
                                {}
                            )
                            .render();
                    }, this);
            });

            it('should have one node for "content4" ', function() {
                expect($(this.APP.node).find('.content4')).to.have.length(1);
            });

            it('should have second visible node for "content4" "view=content4&pOwn=2"', function() {
                expect($(this.APP.node).find('.content4[data-key="view=content4&pOwn=2"]')).to.have.length(1);
            });

        });

        describe('"parent1"(p=1) -> "parent1"(p=2)', function() {

            beforeEach(function() {
                var params1 = { p: 1 };
                return new ns.Update(
                        this.APP,
                        ns.layout.page('parent1', params1),
                        params1
                    )
                    .render()
                    .then(function() {
                        var params2 = { p: 2 };
                        return new ns.Update(
                            this.APP,
                            ns.layout.page('parent1', params2),
                            params2
                        ).render();
                    }, this);
            });

            it('should have one node for view "content1" ', function() {
                expect($(this.APP.node).find('.content1')).to.be.length(1);
            });

            it('should have one visible node for view "content1" "view=content1&p=2" ', function() {
                expect($(this.APP.node).find('.content1[data-key="view=content1&p=2"]')).to.be.length(1);
            });
        });

        describe('"parent2"(p=1) -> "parent2"(p=2)', function() {

            beforeEach(function() {
                var params1 = { p: 1 };
                return new ns.Update(
                        this.APP,
                        ns.layout.page('parent2', params1),
                        params1
                    )
                    .render()
                    .then(function() {
                        var params2 = { p: 2 };
                        return new ns.Update(
                                this.APP,
                                ns.layout.page('parent2', params2),
                                params2
                            )
                            .render();
                    }, this);
            });

            it('should have one node for view "content2" ', function() {
                expect($(this.APP.node).find('.content2').length).to.be.equal(1);
            });

            it('should have one visible for view "content2" ', function() {
                expect($(this.APP.node).find('.content2')).to.be.length(1);
            });
        });

        describe('Update of ns.BoxReact`s parent and child at the same time ->', function() {
            beforeEach(function() {

                // layout
                ns.layout.define('parent3', {
                    app: {
                        vParent: {
                            'box@': {
                                vChild: true
                            }
                        }
                    }
                });

                // define models
                ns.Model.define('mParent', {});

                ns.Model.define('mChild', {
                    params: {
                        p: null
                    }
                });

                // set models data
                ns.Model.get('mParent', {}).setData({ foo: 'bar' });

                ns.Model.get('mChild', { p: 1 }).setData({ foo: 'bar' });
                ns.Model.get('mChild', { p: 2 }).setData({ foo: 'bar2' });

                // define views
                ns.ViewReact.define('vParent', {
                    models: ['mParent']
                });

                ns.ViewReact.define('vChild', {
                    models: ['mChild']
                });

            });

            describe('single redraw ->', function() {
                beforeEach(function() {
                    // update 1
                    return new ns.Update(
                            this.APP,
                            ns.layout.page('parent3', { p: 1 }),
                            { p: 1 }
                        )
                        .render()
                        .then(function() {
                            ns.Model.get('mParent', {}).set('.foo', 'bar2');

                            // update 2
                            return new ns.Update(
                                    this.APP,
                                    ns.layout.page('parent3', { p: 2 }),
                                    { p: 2 }
                                )
                                .render();

                        }, this);
                });

                it('should have 1 visible node for view vChild', function() {
                    expect(this.APP.node.querySelectorAll('.vChild')).to.have.length(1);
                });

                it('should have 1 visible node for view vChild', function() {
                    expect(this.APP.node.querySelectorAll('.vChild[data-key="view=vChild&p=2"]')).to.have.length(1);
                });

            });

            describe('multiple redraw ->', function() {
                beforeEach(function() {
                    // update 1
                    return new ns.Update(
                            this.APP,
                            ns.layout.page('parent3', { p: 1 }),
                            { p: 1 }
                        )
                        .render()
                        .then(function() {
                            ns.Model.get('mParent', {}).set('.foo', 'bar2');

                            // update 2
                            return new ns.Update(
                                    this.APP,
                                    ns.layout.page('parent3', { p: 2 }),
                                    { p: 2 }
                                )
                                .render()
                                .then(function() {
                                    ns.Model.get('mParent', {}).set('.foo', 'bar3');

                                    // update 3
                                    return new ns.Update(
                                            this.APP,
                                            ns.layout.page('parent3', { p: 1 }),
                                            { p: 1 }
                                        ).render();

                                }, this);
                        }, this);
                });

                it('should have 1 visible node for view vChild', function() {
                    expect(this.APP.node.querySelectorAll('.vChild').length).to.be.equal(1);
                });

                it('should have 1 visible node for view vChild', function() {
                    expect(this.APP.node.querySelectorAll('.vChild[data-key="view=vChild&p=1"]')).to.have.length(1);
                });

            });

        });

    });

    describe('box -> box', function() {

        beforeEach(function() {

            ns.layout.define('box1', {
                'app content contentBox@': {
                    'box1@': {}
                }
            }, 'app');

            ns.layout.define('box2', {
                'app content contentBox@': {
                    'box2@': {}
                }
            }, 'app');

            return new ns.Update(
                    this.APP,
                    ns.layout.page('box1', {}),
                    {}
                )
                .render()
                .then(function() {
                    return new ns.Update(
                            this.APP,
                            ns.layout.page('box2', {}),
                            {}
                        ).render();
                }, this);

        });

        it('should have one box in "contentBox@"', function() {
            expect(
                this.APP.node.querySelector('.contentBox').childNodes
            ).to.have.length(1);
        });

        it('should remove "box1@" from DOM', function() {
            expect(
                this.APP.node.querySelectorAll('.box1')
            ).to.have.length(0);
        });

        it('should set "box2@" as visible', function() {
            expect(
                this.APP.node.querySelectorAll('.box2')
            ).to.have.length(1);
        });

    });

    describe('views inside box keep sequence ->', function() {

        beforeEach(function() {
            ns.layout.define('sequence', {
                'app content contentBox@': {
                    a: true,
                    b: true
                }
            }, 'app');

            ns.ViewReact.define('a', { params: { t: null } });
            ns.ViewReact.define('b');

            return new ns.Update(
                    this.APP,
                    ns.layout.page('sequence'),
                    { t: 'zero' }
                )
                .render()
                .then(function() {
                    return new ns.Update(this.APP,
                        ns.layout.page('sequence'),
                        {
                            t: 'one'
                        }
                    ).render();
                }, this);

        });

        it('total of 2 views are inside .contentBox', function() {
            expect(this.APP.node.querySelector('.contentBox').childNodes).to.have.length(2);
        });

        it('total of 3 view are inside ns.BoxReact `contentBox`', function() {
            var contentBoxView = this.sinon.getViewByKey(this.APP, 'box=contentBox');
            expect(Object.keys(contentBoxView.views)).to.have.length(3);
        });

        it('view .a with key="view=a&t=zero" to be hidden', function() {
            var hiddenAView = this.sinon.getViewByKey(this.APP, 'view=a&t=zero');
            expect(hiddenAView.isVisible()).to.be.false;
        });

        it('first view is "a" with param one', function() {
            var firstChild = this.APP.node.querySelector('.contentBox').childNodes[0];
            expect(firstChild.className).to.be.equal('a');
            expect(firstChild.getAttribute('data-key')).to.be.equal('view=a&t=one');
        });

        it('third one is "b"', function() {
            var secondChild = this.APP.node.querySelector('.contentBox').childNodes[1];
            expect(secondChild.className).to.be.equal('b');
        });

    });

    /*
     For url '/' we get:
     app
     content
     a
     b
     c

     for url '/2' we get:
     app
     content
     c
     b
     a

     a, b and c are just sorted in a new way.
     */
    describe('sorting views inside box ->', function() {

        beforeEach(function() {
            ns.layout.define('index1', {
                'app content contentBox@': {
                    a: true,
                    b: true,
                    c: true
                }
            }, 'app');

            ns.layout.define('index2', {
                'app content contentBox@': {
                    c: true,
                    b: true,
                    a: true
                }
            }, 'app');

            ns.ViewReact.define('a');
            ns.ViewReact.define('b');
            ns.ViewReact.define('c');

            return new ns.Update(
                    this.APP,
                    ns.layout.page('index1'),
                    {}
                )
                .render()
                .then(function() {

                    return new ns.Update(
                            this.APP,
                            ns.layout.page('index2'),
                            {}
                        ).render()
                        .then(function() {
                            this.children = this.APP.node.querySelector('.contentBox').childNodes;
                        }, this);

                }, this);
        });

        it('total of 3 views are inside .contentBox', function() {
            expect(this.children).to.have.length(3);
        });

        it('first view is "c"', function() {
            expect($(this.children[0]).is('.c')).to.be.true;
        });

        it('second view is "b"', function() {
            expect($(this.children[1]).is('.b')).to.be.true;
        });

        it('finally third view is "a"', function() {
            expect($(this.children[2]).is('.a')).to.be.true;
        });

    });

    describe('do not sort view nodes when nothing have changed', function() {

        beforeEach(function() {
            ns.layout.define('index', {
                'app content contentBox@': {
                    a: true,
                    b: true
                }
            }, 'app');

            ns.ViewReact.define('a');
            ns.ViewReact.define('b');

            return new ns.Update(
                    this.APP,
                    ns.layout.page('index'),
                    {}
                )
                .render()
                .then(function() {
                    this.previousChildren = {
                        a: this.APP.node.querySelector('.a'),
                        b: this.APP.node.querySelector('.b')
                    };

                    return new ns.Update(
                        this.APP,
                        ns.layout.page('index'),
                        {}
                    ).render();

                }, this);
        });

        it('No DOM mutations are performed when page is redrawn and all views a valid', function() {
            expect(this.APP.node.querySelector('.a')).to.be.equal(this.previousChildren.a);
            expect(this.APP.node.querySelector('.b')).to.be.equal(this.previousChildren.b);
        });

    });

    it('should sort only sibling view nodes', function() {

        ns.layout.define('index', {
            'app content contentBox@': {
                a: {
                    'b-box@': {
                        b: true
                    }
                },
                c: true
            }
        }, 'app');

        ns.ViewReact.define('a');
        ns.ViewReact.define('b');
        ns.ViewReact.define('c');

        return new ns.Update(
                this.APP,
                ns.layout.page('index'),
                {}
            )
            .render();

    });

    describe('Box should hide inactive views only', function() {
        beforeEach(function() {
            var _this = this;
            var page1Params = {};
            var page1 = ns.layout.page('content2', page1Params);
            var page2Params = { p: 1 };
            var page2 = ns.layout.page('content1', page2Params);

            return new ns.Update(this.APP, page1, page1Params).render()
                .then(function() {
                    return new ns.Update(_this.APP, page2, page2Params).render();
                });
        });

        it('view content2 should be hidden', function() {
            var contentBoxView = this.sinon.getViewByKey(this.APP, 'box=contentBox');
            var views = contentBoxView.views;
            expect(views['view=content2'].isVisible()).to.be.false;
        });

        it('view content1 should be visible', function() {
            var contentBoxView = this.sinon.getViewByKey(this.APP, 'box=contentBox');
            var views = contentBoxView.views;
            expect(views['view=content1&p=1'].isVisible()).to.be.true;
        });
    });

    describe('ns.ViewReact вложенное в ns.Box + ns.View', function() {

        beforeEach(function() {
            ns.layout.define('index', {
                app: {
                    'yateBox@': {
                        yateView: {
                            reactView: true
                        }
                    }
                }
            });

            ns.View.define('yateView', {
                params: {
                    id: null
                }
            });
            this.componentWillUnmount = this.sinon.stub();
            var _this = this;
            ns.ViewReact.define('reactView', {
                params: {
                    id: null
                },
                component: {
                    componentWillUnmount: function() {
                        _this.componentWillUnmount(this);
                    }
                }
            });

            var indexPageLayout = ns.layout.page('index');

            return new ns.Update(this.APP, indexPageLayout, { id: 1 })
                .render()
                .then(function() {
                    return new ns.Update(this.APP, indexPageLayout, { id: 2 })
                        .render();
                }, this);
        });

        it('должен показать [data-key="view=reactView&id=2"]', function() {
            expect(this.APP.node.querySelectorAll('.reactView[data-key="view=reactView&id=2"]')).to.be.length(1);
        });

        it('должен скрыть [data-key="view=reactView&id=1"]', function() {
            var reactViewId1 = this.sinon.getViewByKey(this.APP, 'view=reactView&id=1');

            expect(reactViewId1.isVisible()).to.be.false;
        });

        it('должен отвязать компонент от [data-key="view=reactView&id=1"]', function() {
            var reactViewId1 = this.sinon.getViewByKey(this.APP, 'view=reactView&id=1');

            expect(reactViewId1.reactComponentType).to.be.equal('none');
        });

        it('должен уничтожить компонент, связанный с [data-key="view=reactView&id=1"]', function() {
            var reactViewId1 = this.sinon.getViewByKey(this.APP, 'view=reactView&id=1');
            var calledView = this.componentWillUnmount.getCall(0).args[0].props.view;

            expect(this.componentWillUnmount).to.be.calledOnce;
            expect(calledView).to.be.equal(reactViewId1);
        });

    });

    describe('получение HTML ns.BoxReact и восстановление приложения по нему ->', function() {

        beforeEach(function() {
            ns.SERVER = true;

            this.defineApp = function() {
                ns.reset();
                ns.layout.define('index', {
                    app: {
                        reactView: {
                            'boxReact@': {
                                itemView: true
                            }
                        }
                    }
                });

                ns.View.define('app');
                ns.ViewReact.define('reactView');
                ns.ViewReact.define('itemView');
                this.app = ns.View.create('app');
                this.indexPageLayout = ns.layout.page('index');
            }.bind(this);

            this.defineApp();

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
                expect(this.node.querySelectorAll('.ns-view-reactView')).to.have.length(1);
            });

            it('должен отрендерить в ввиде HTML boxReact', function() {
                expect(this.node.querySelectorAll('.boxReact')).to.have.length(1);
            });

            it('должен отрендерить содержимое бокса itemView', function() {
                expect(this.node.querySelectorAll('.itemView')).to.have.length(1);
            });

        });

        describe('восстановление приложения по HTML-> ', function() {
            beforeEach(function() {
                return this.update.generateHTML()
                    .then(function(html) {
                        ns.SERVER = false;
                        this.node = ns.html2node(html);
                        this.defineApp();
                        return new ns.Update(this.app, this.indexPageLayout, {})
                            .reconstruct(this.node);
                    }, this);
            });

            it('должен установить node у reactView', function() {
                var reactView = this.sinon.getViewByKey(this.app, 'view=reactView');

                expect(reactView.node).to.be.equal(this.app.node.querySelector('.ns-view-reactView'));
            });

            it('должен установить node у boxReact', function() {
                var boxReact = this.sinon.getViewByKey(this.app, 'box=boxReact');
                var reactView = this.sinon.getViewByKey(this.app, 'view=reactView');

                expect(boxReact.reactComponentType).to.be.equal('child');
                expect(reactView.node.querySelectorAll('.boxReact')).to.have.length(1);
            });

            it('должен установить node у содержимого бокса itemView', function() {
                var itemView = this.sinon.getViewByKey(this.app, 'view=itemView');
                var reactView = this.sinon.getViewByKey(this.app, 'view=reactView');

                expect(itemView.reactComponentType).to.be.equal('child');
                expect(reactView.node.querySelectorAll('.itemView')).to.have.length(1);
            });
        });

    });

    describe('сохранение стейта React компонента ns.BoxReact ->', function() {
        beforeEach(function() {
            ns.reset();

            ns.layout.define('index', {
                app: {
                    reactWrapper: {
                        'boxReact@': {
                            reactView: true
                        }
                    }
                }
            });

            ns.View.define('app');
            ns.ViewReact.define('reactWrapper');
            ns.ViewReact.define('reactView', {
                params: {
                    p: null
                },
                component: {
                    getInitialState: function() {
                        return {
                            content: 'start'
                        };
                    },
                    componentWillMount: function() {
                        ns.events.on('change-state', this.changeState);
                    },
                    componentWillUnmount: function() {
                        ns.events.off('change-state', this.changeState);
                    },
                    changeState: function(eventName, content) {
                        this.setState({
                            content: content
                        });
                    },
                    render: function() {
                        return React.createElement('div', {
                            className: 'content' + this.props.view.params.p
                        }, this.state.content);
                    }
                }
            });

            this.app = ns.View.create('app');
            this.indexPageLayout = ns.layout.page('index');
            return new ns.Update(this.app, this.indexPageLayout, { p: 1 }).render();
        });

        it('должен запоминать стейт React компонента отображаемого view', function() {
            expect(this.app.node.querySelector('.content1').innerHTML).to.be.equal('start');
        });

        it('должен дать перерисоваться React компоненту отображаемого view согласно изменению стейта', function() {
            ns.events.trigger('change-state', 'change');
            expect(this.app.node.querySelector('.content1').innerHTML).to.be.equal('change');
        });

        it('должен при смене отображаемого вью показать стейт нового React компонента', function() {
            ns.events.trigger('change-state', 'change');
            return new ns.Update(this.app, this.indexPageLayout, { p: 2 })
                .render()
                .then(function() {
                    expect(this.app.node.querySelector('.content2').innerHTML).to.be.equal('start');
                }, this);
        });

        it('не должен сохранять стейт React компонента при скрытии, а затем показе связанного с ним вью', function() {
            ns.events.trigger('change-state', 'change');
            expect(this.app.node.querySelector('.content1').innerHTML).to.be.equal('change');
            // Скрываем [view=reactView&p=1], в замен отображаем [view=reactView&p=2]
            return new ns.Update(this.app, this.indexPageLayout, { p: 2 })
                .render()
                .then(function() {
                    // Показываем [view=reactView&p=1]
                    return new ns.Update(this.app, this.indexPageLayout, { p: 1 })
                        .render()
                        .then(function() {
                            expect(this.app.node.querySelector('.content1').innerHTML).to.be.equal('start');
                        }, this);
                }, this);
        });
    });

    describe('установка props для дочерних view ns.BoxReact ->', function() {
        beforeEach(function() {
            ns.reset();

            ns.layout.define('index', {
                app: {
                    viewWithPatchLayout: true
                }
            });

            ns.layout.define('layout-content', {
                'someBox@': {
                    viewReact1: true,
                    viewReact2: true,
                    viewReact3: {
                        viewReact4: true
                    }
                }
            });

            ns.View.define('app');
            ns.ViewReact.define('viewWithPatchLayout', {
                methods: {
                    patchLayout: function() {
                        return 'layout-content';
                    }
                },
                component: {
                    render: function() {
                        return React.createElement(
                            'div',
                            null,
                            this.createChildren({
                                p1: '1',
                                p2: '2',
                                p3: '3',
                                type: 'foo'
                            })
                        );
                    }
                }
            });
            ns.ViewReact.define('viewReact1', {
                component: {
                    render: function() {
                        return React.createElement(
                            'div',
                            {
                                className: 'content1'
                            },
                            this.props.p1
                        );
                    }
                }
            });
            ns.ViewReact.define('viewReact2', {
                component: {
                    render: function() {
                        return React.createElement(
                            'div',
                            {
                                className: 'content2'
                            },
                            this.props.p2
                        );
                    }
                }
            });
            ns.ViewReact.define('viewReact3');
            ns.ViewReact.define('viewReact4', {
                component: {
                    render: function() {
                        return React.createElement(
                            'div',
                            {
                                className: 'content3'
                            },
                            this.props.p3 ? this.props.p3 : 'correct'
                        );
                    }
                }
            });

            this.app = ns.View.create('app');
            this.indexPageLayout = ns.layout.page('index');
            return new ns.Update(this.app, this.indexPageLayout, {}).render();
        });

        it('должен передать props для бокса его дочерним view', function() {
            expect(this.app.node.querySelector('.content1').innerHTML).to.be.equal('1');
            expect(this.app.node.querySelector('.content2').innerHTML).to.be.equal('2');
        });

        it('не должен передать props для потомков дочерних view бокса', function() {
            expect(this.app.node.querySelector('.content3').innerHTML).to.be.equal('correct');
        });

        it('[#49] не должен добавлять props в виде атрибутов своей ноды', function() {
            expect(this.app.node.querySelector('.someBox').getAttribute('type')).to.be.not.ok;
        });
    });
});
