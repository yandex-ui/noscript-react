describe('ns.DataProvider', function() {
    beforeEach(function() {
        ns.Model.define('test', {
            id: null
        });
        this.layout = this.sinon.spy();
    });

    describe('моделька валидная ->', function() {
        beforeEach(function() {
            this.data = {
                foo: 'bar'
            };
            ns.Model.get('test', {
                id: 1
            }).setData(this.data);

            ns.DataProvider({
                model: 'test',
                params: { id: 1 },
                children: this.layout
            });
        });

        it('должен вызвать layout со статусом OK и данными модели', function() {
            expect(this.layout).to.be.calledWith(ns.V.OK, this.data);
        });
    });

    describe('моделька невалидная ->', function() {
        beforeEach(function() {
            ns.DataProvider({
                model: 'test',
                params: { id: 1 },
                children: this.layout
            });
        });
        afterEach(function() {
            ns._requestsInUpdate = [];
        });
        it('должен вызвать layout со статусом LOADING', function() {
            expect(this.layout).to.be.calledWith(ns.V.LOADING, null);
        });
        it('должен добавить модельку в очередь на загрузку', function() {
            expect(ns._requestsInUpdate.length).to.be.eql(1);
        });
    });

    describe('моделька с ошибкой ->', function() {
        beforeEach(function() {
            this.error = {
                id: 'INVALID_FORMAT'
            };
            ns.Model.get('test', {
                id: 1
            }).setError(this.error);

            ns.DataProvider({
                model: 'test',
                params: { id: 1 },
                children: this.layout
            });
        });
        it('должен вызвать layout со статусом ERROR и данными ошибки', function() {
            expect(this.layout).to.be.calledWith(ns.V.ERROR, this.error);
        });
    });
});
