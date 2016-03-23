beforeEach(function() {
    this.sinon = sinon.sandbox.create({
        useFakeServer: true
    });

    this.sinon.stub(ns.history, 'pushState');
    this.sinon.stub(ns.history, 'replaceState');
    this.sinon.stub(ns.log, 'exception', function(a,b,c) {
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
            var view = allChildrenViews.filter(function(view){
                return view.key === viewKey
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
            }, props))
        };
});

afterEach(function() {
    this.sinon.restore();
    ns.reset();

    // Очистка контекста тестов от созданных в нём, в процессе выполнения, элементов
    for(var key in this) {
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
                {"Content-Type": "application/json"},
                JSON.stringify(mock[xhr.url])
            );
        });
    }
};
