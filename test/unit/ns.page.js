describe('ns.page', function() {

    describe('ns.page.go', function() {

        beforeEach(function() {
            ns.router.routes = {
                redirect: {
                    '/': '/inbox'
                },
                route: {
                    '/inbox': 'messages',
                    '/message/{mid:int}': 'message'
                }
            };
            ns.router.init();
        });

        describe('redirect', function() {

            beforeEach(function() {
                this.sinon.stub(ns.page, 'redirect');
            });

            it('calls ns.page.redirect in "/" ', function(done) {

                ns.page.go('/').then(function() {
                    expect(ns.page.redirect).to.have.callCount(1);
                    done();
                }, function() {
                    done('reject');
                });
            });

            describe('go on page with redirect', function() {

                beforeEach(function() {
                    ns.page.history._history = [];
                    this.sinon.stub(ns.page, 'followRoute').returns(Vow.fulfill());

                    ns.page.history.push('/1');
                    ns.page.history.push('/2');
                });

                afterEach(function() {
                    ns.page.followRoute.restore();
                });

                it('calls correct redirect', function(done) {
                    ns.page.go('/')
                        .then(function() {
                            expect(ns.page.redirect).have.been.calledWith(
                                '/inbox'
                            );
                            done();
                        }, function() {
                            done('reject');
                        });
                });

                it('history length is correct', function(done) {
                    ns.page.go('/')
                        .then(function() {
                            expect(ns.page.history._history.length).to.be.equal(2);
                            done();
                        }, function() {
                            done('reject');
                        });
                });

                it('previous page is correct', function(done) {
                    ns.page.go('/')
                        .then(function() {
                            expect(ns.page.history.getPrevious()).to.be.equal('/2');
                            done();
                        }, function() {
                            done('reject');
                        });
                });

            });

        });

        describe('Запись в историю', function() {

            beforeEach(function() {
                this.sinon.spy(ns.page, '_fillHistory');
                this.sinon.stub(ns.page, 'startUpdate', function() {
                    return Vow.fulfill();
                })
            });

            it('должен записать переход в историю', function() {
                return ns.page.go('/inbox')
                    .then(function() {
                        expect(ns.page._fillHistory).to.be.calledWith('/inbox', 'push');
                    });
            });

            it('не должен записать переход на тот же URL в историю ', function() {
                return ns.page.go('/inbox')
                    .then(function() {
                        ns.page._fillHistory.reset();

                        return ns.page.go('/inbox').then(function() {
                            expect(ns.page._fillHistory).to.be.calledWith('/inbox', 'preserve');
                        });
                    });
            });

        });

        describe('Запись в историю ns.page._fillHistory', function() {
            beforeEach(function() {
                this.sinon.spy(ns.page.history, 'push');
            });

            it('ns.page._fillHistory должен записывать историю с параметром push ', function() {
                ns.page._fillHistory('/new', 'push');
                expect(ns.page.history.push).to.be.calledWith('/new');
            });

            it('ns.page._fillHistory не должен записывать историю при вызове с параметром preserve ', function() {
                ns.page._fillHistory('/new', 'preserve');
                expect(ns.page.history.push.called).to.be.eql(false);
            });
        });

    });

    describe('getDefaultUrl', function() {

        beforeEach(function() {
            this.sinon.stub(ns.router, 'url', no.nop);
        });

        it('should exists', function() {
            expect(ns.page.getDefaultUrl).to.be.a('function');
        });

        it('should call ns.router.url', function() {
            ns.page.getDefaultUrl();
            expect(ns.router.url.calledOnce).to.be.equal(true);
        });

        it('should call ns.router.url with "/" arg', function() {
            ns.page.getDefaultUrl();
            expect(ns.router.url.calledWithExactly('/')).to.be.equal(true);
        });

    });

});
