describe.only('[#40] replaceNode в ReactView#_updateNode ->', function() {
    var getClassList = function(node) {
        var classList = node.classList;
        return [].slice.call(classList, 0);
    };

    if (!ns.View.prototype._hideNode) {
        return;
    }
    
    beforeEach(function() {
        ns.layout.define('app', {
            app: {
                'layerApp@': function(params) {
                    if (params.foo) {
                        return {
                            v1: {
                                inner: {}
                            }
                        };
                    } else {
                        return {
                            v2: {
                                inner: {}
                            }
                        };
                    }
                }
            }
        });

        ns.View.define('app');
        ns.View.define('v1');
        ns.View.define('v2');
        ns.ViewReact.define('inner');

        this.layoutWithoutFoo = ns.layout.page('app', {});
        this.layoutWithFoo = ns.layout.page('app', {
            foo: true
        });
        this.app = ns.View.create('app');

        return new ns.Update(this.app, this.layoutWithoutFoo, {})
            .render();
    });
    
    describe('первая отрисовка без foo ->', function() {
        it('должен отрисовать v2', function() {
            expect(this.app.node.querySelectorAll('.ns-view-v2')).to.be.length(1);
        });

        it('должен отрисовать внутренний элемент v2', function() {
            expect(this.app.node.querySelector('.ns-view-v2').querySelectorAll('.inner')).to.be.length(1);
        });
        
        it('не должен отрисовывать v1', function() {
            expect(this.app.node.querySelectorAll('.ns-view-v1')).to.be.length(0);
        })
    });
    
    describe('вторая отрисовка с foo === true ->', function() {
        
        beforeEach(function() {
            return new ns.Update(this.app, this.layoutWithFoo, { foo: true })
                .render();
        });
        
        it('должен отрисовать v1', function() {
            expect(this.app.node.querySelectorAll('.ns-view-v1')).to.be.length(1);
        });

        it('должен отрисовать внутренний элемент v1', function() {
            expect(this.app.node.querySelector('.ns-view-v1').querySelectorAll('.inner')).to.be.length(1);
        });

        it('должен скрыть v2', function() {
            var classList = getClassList(this.app.node.querySelector('.ns-view-v2'));
            expect(classList.indexOf('ns-view-hidden')).to.not.be.equal(-1);
        });
    });

    describe('третья отрисовка без foo ->', function() {

        beforeEach(function() {
            return new ns.Update(this.app, this.layoutWithFoo, { foo: true })
                .render()
                .then(function () {
                    return new ns.Update(this.app, this.layoutWithoutFoo, {})
                        .render();
                }, this)
        });

        it('должен отрисовать v2', function() {
            expect(this.app.node.querySelectorAll('.ns-view-v2')).to.be.length(1);
        });

        it('должен отрисовать внутренний элемент v2', function() {
            expect(this.app.node.querySelector('.ns-view-v2').querySelectorAll('.inner')).to.be.length(1);
        });

        it('должен скрыть v1', function() {
            var classList = getClassList(this.app.node.querySelector('.ns-view-v1'));
            expect(classList.indexOf('ns-view-hidden')).to.not.be.equal(-1);
        })
    });

});
