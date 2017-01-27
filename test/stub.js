ns.Model.TESTDATA = {
    split1: {
        item: [
            {
                id: '1',
                value: 'foo'
            },
            {
                id: '2',
                value: 'bar'
            },
            {
                id: '3',
                value: 'baz'
            }
        ]
    },
    split2: {
        item: [
            {
                id: '1',
                value: 'foo'
            },
            {
                id: '2',
                value: 'bar'
            },
            {
                id: '4',
                value: 'zzap'
            }
        ]
    }
};

/**
 * В тестах ReactDOM
 * подключен в браузере глобально
 */
ns.React = React;
ns.ReactDOM = ReactDOM;

beforeEach(function() {
    this.sinon = sinon.sandbox.create({
        useFakeServer: true
    });

    this.sinon.stub(ns.history, 'pushState');
    this.sinon.stub(ns.history, 'replaceState');

    this.sinon.stub(ns.log, 'exception', function(a, b, c) {
        console.error('ns.log.exception', a, b, c);
    });

    this.APP_CONTAINER = document.createElement('div');
    this.APP_CONTAINER.id = 'app';
    document.body.appendChild(this.APP_CONTAINER);
});

afterEach(function() {
    this.sinon.restore();
    ns.reset();
    document.body.removeChild(this.APP_CONTAINER);
});
