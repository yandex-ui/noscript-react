describe('ns.history', function() {
    beforeEach(function() {
        ns.router.baseDir = '/my/';
        ns.history.init();
    });

    describe('#_onAnchorClick', function() {

        beforeEach(function() {
            this.sinon.stub(ns.history, 'followAnchorHref');

            this.event = {
                target: document.createElement('a')
            };
        });

        it('должен перейти по ссылке, если baseDir совпадает частично', function() {
            this.event.target.href = '/my/page1';

            ns.history._onAnchorClick(this.event);
            expect(ns.history.followAnchorHref).to.be.calledWith('/my/page1');
        });

        it('должен перейти по ссылке, если baseDir совпадает полностью', function() {
            this.event.target.href = '/my/';

            ns.history._onAnchorClick(this.event);
            expect(ns.history.followAnchorHref).to.be.calledWith('/my/');
        });

        it('не должен перейти по ссылке, если baseDir не совпадает совсем', function() {
            this.event.target.href = '/another/page1';

            ns.history._onAnchorClick(this.event);
            expect(ns.history.followAnchorHref).to.have.callCount(0);
        });

        it('не должен перейти по ссылке, если baseDir не совпадает частично', function() {
            this.event.target.href = '/my';

            ns.history._onAnchorClick(this.event);
            expect(ns.history.followAnchorHref).to.have.callCount(0);
        });

        it('не должен перейти по ссылке, если baseDir совпадает, но задан атрибут target', function() {
            this.event.target.target = '_self';

            ns.history._onAnchorClick(this.event);
            expect(ns.history.followAnchorHref).to.have.callCount(0);
        });

        it('не должен перейти по ссылке, если href=javascript:void(0)', function() {
            this.event.target.href = 'javascript:void(0)';

            ns.history._onAnchorClick(this.event);
            expect(ns.history.followAnchorHref).to.have.callCount(0);
        });
    });

    describe('DOM ->', function() {
        beforeEach(function() {
            this.sinon.stub(ns.page, 'go', function() {
                return Vow.resolve();
            });

            this.a = document.createElement('a');
            this.a.setAttribute('href', '/my/page');

            document.body.appendChild(this.a);
        });
        afterEach(function() {
            ns.page.go.restore();
        });
        describe('при клике на ссылку', function() {
            beforeEach(function() {
                ns.test.clickOnElement(this.a);
            });
            it('должен вызвать ns.page.go с урлом /my/page', function() {
                expect(ns.page.go).to.be.calledWith('/my/page');
            });
        });
    });

    // TODO: history.back() не работает в phantomjs
    xdescribe('History API ->', function() {
        beforeEach(function() {
            this.sinon.stub(ns.page, 'go', function() {
                return Vow.resolve();
            });
            window.history.pushState(null, 'page 1', '?page=1');
        });
        afterEach(function() {
            ns.page.go.restore();
        });
        describe('onpopstate', function() {
            beforeEach(function() {
                window.history.back();
            });
            it('должен вызвать ns.page.go', function() {
                expect(ns.page.go).to.have.callCount(1);
            });
        });
    });
});
