describe('Issues', function() {
    describe('#94 -> события вида вложенного в асинхронный вид', function() {
        beforeEach(function() {
            ns.layout.define('app', {
                app: {
                    'async&': 'inner'
                }
            });
            ns.View.define('app');
            ns.ViewReact.define('async', {
                models: ['m1']
            });

            this.htmlinitstub = this.sinon.stub();
            this.showstub = this.sinon.stub();

            ns.ViewReact.define('inner', {
                events: {
                    'ns-view-htmlinit': this.htmlinitstub,
                    'ns-view-show': this.showstub
                }
            });

            var APP = ns.View.create('app');

            ns.Model.define('m1', {
                methods: {
                    request: function() {
                        var promise = new Vow.Promise();
                        var update = new ns.Update(APP, ns.layout.page('app', {}), {}, {
                            execFlag: ns.U.EXEC.ASYNC
                        });

                        setTimeout(function() {
                            update.render();
                        }, 10);
                        setTimeout(function() {
                            promise.fulfill();
                        }, 1000);

                        return promise.then(function() {
                            this.setData({});
                        }, this);
                    }
                }
            });
            return new ns.Update(APP, ns.layout.page('app', {}), {}).render().then(function(result) {
                return result.async[0];
            });
        });

        it('show/hide не должны всплывать при случайном асинхронном апдейте до загрузки моделей', function() {
            expect(this.htmlinitstub.callCount).to.be.eql(1);
            expect(this.showstub.callCount).to.be.eql(1);
        });
    });
});
