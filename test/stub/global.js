beforeEach(function() {
    this.sinon = sinon.sandbox.create({
        useFakeServer: true
    });

    this.sinon.stub(ns.history, 'pushState');
    this.sinon.stub(ns.history, 'replaceState');
    this.sinon.stub(ns.log, 'exception', function(a, b, c) {
        console.error('ns.log.exception', a, b, c);
    });

    /**
     * Помошник в получении view по ключу
     * @param {ns.View} parentView корневое view, с которого начинается поиск
     * @param {string} viewKey
     * @returns {?ns.View}
     */

    this.sinon.getViewByKey = function(parentView, viewKey) {
        if (parentView.key === viewKey) {
            return parentView;
        } else {
            var allChildrenViews = parentView._getDescendantsAndSelf();
            var view = allChildrenViews.filter(function(view) {
                return view.key === viewKey;
            })[0];

            return view || null;
        }
    };

    // Проставляем класс и ключ для реактивных view для удобства тестирования
    ns.ViewReact.prototype.createElement =
    ns.ViewReactCollection.prototype.createElement =
    ns.BoxReact.prototype.createElement =
        function(props) {
            return ns.ViewReactMixin.createElement.call(this, no.extend({
                className: this.id,
                'data-key': this.key
            }, props));
        };
});

afterEach(function() {
    this.sinon.restore();
    ns.reset();

    // Очистка контекста тестов от созданных в нём, в процессе выполнения, элементов
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            delete this[key];
        }
    }
});

ns.test = {
    /**
     * Включает автоответ валидными моделями по заданному моку {url: response}
     * @param {sinon.sandbox} sinon
     * @param {object} mock
     */
    modelsValidAutorespondByMock: function(sinon, mock) {
        sinon.server.autoRespond = true;
        sinon.server.respond(function(xhr) {
            if (ns.DEBUG) {
                console.log('modelsValidAutorespondByMock', xhr.url);
            }
            if (!(xhr.url in mock)) {
                throw new Error('No mock defined for ' + xhr.url);
            }
            xhr.respond(
                200,
                { 'Content-Type': 'application/json' },
                JSON.stringify(mock[xhr.url])
            );
        });
    },

    /**
     * Генерирует тесты для событий:
     * "Должен всплывать ns-view-htmlinit на v1"
     * "Должен не всплывать ns-view-show на v2"
     *
     * @param {Array} defs
     *
     * @example
     * // должен не всплывать ns-view-html-destroy на app (called)
     * genTests([
     *     ['app', 'ns-view-htmldestroy', 'called', false]
     * ])
     */
    genEventsTests: function(defs) {
        for (var i = 0, j = defs.length; i < j; i++) {
            var def = defs[i];
            (function(view, event, check, not) {
                it('должен ' + (not === false ? 'не ' : '') + ' всплывать "' + event + '" на "' + view + '" (' + check + ')', function() {
                    var spyName = view + '-' + event + '-spy';
                    if (not === false) {
                        expect(this.events[spyName][check]).to.be.equal(false);
                    } else if (typeof not === 'number') {
                        expect(this.events[spyName]).to.have.callCount(not);
                    } else {
                        expect(this.events[spyName][check]).to.be.equal(true);
                    }
                });
            }(def[0], def[1], def[2], def[3]));
        }
    },

    /**
     * Генерирует тесты для проверки
     * порядка всплытия событий
     * @param {Array} defs
     */
    genEventsOrderTests: function(defs) {
        for (var i = 0, j = defs.length - 1; i < j; i++) {
            var def = defs[i];
            var defNext = defs[i + 1];
            (function(view, event, pos, nextView, nextEvent, nextPos) {
                it('должен всплывать "' + event + '" на "' + view + '" перед "' + nextEvent + '" на "' + nextView + '" ', function() {
                    var spyName = view + '-' + event + '-spy';
                    var nextSpyName = nextView + '-' + nextEvent + '-spy';

                    var spy = this.events[spyName];
                    if (typeof pos === 'number') {
                        spy = spy.getCall(pos);
                    }

                    var nextSpy = this.events[nextSpyName];
                    if (typeof nextPos === 'number') {
                        nextSpy = nextSpy.getCall(nextPos);
                    }

                    expect(spy.calledBefore(nextSpy)).to.be.equal(true);
                });
            }(def[0], def[1], def[2], defNext[0], defNext[1], defNext[2]));
        }
    }
};
