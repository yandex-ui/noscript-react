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

beforeEach(function() {
    this.sinon = sinon.sandbox.create({
        useFakeServer: true
    });

    this.sinon.stub(ns.history, 'pushState');
    this.sinon.stub(ns.history, 'replaceState');

    this.sinon.stub(ns.log, 'exception', function(a,b,c) {
        console.error('ns.log.exception', a, b, c);
    });
});

afterEach(function() {
    this.sinon.restore();
    ns.reset();
});
