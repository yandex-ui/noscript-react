var h = React.createElement.bind(React);

describe('Photo Gallery', function() {
    beforeEach(function() {
        ns.router.routes = {
            route: {
                '/photos/{image-id:int}': 'index',
                '/photos': 'index'
            }
        };

        ns.Model.define('photo', {
            params: {
                'image-id': null
            }
        });
        ns.Model.define('photos', {
            split: {
                items: '.images',
                model_id: 'photo',
                params: {
                    'image-id': '.id'
                }
            },
            methods: {
                request: function() {
                    var that = this;
                    var promise = new Vow.Promise();

                    setTimeout(function() {
                        promise.fulfill();
                        that.setData({
                            images: [
                                { id: 1, url_: '1' },
                                { id: 2, url_: '2' },
                                { id: 3, url_: '3' }
                            ]
                        });
                    }, 0);

                    return promise;
                }
            }
        });

        ns.action.define('change-photo', function(e, params) {
            ns.Model.get('photo', {
                'image-id': params.id
            }).set('.url_', '4');

            return ns.page.go();
        });

        ns.MAIN_VIEW = React.createClass({
            render: function() {
                return h('div', {},
                    h(ns.DataProvider, {
                        model: 'photos'
                    }, function(status, data) {
                        if (status === ns.V.OK) {
                            var items = data.images.map(function(item) {
                                return h(ns.DataProvider, {
                                    model: 'photo',
                                    params: { 'image-id': item.id },
                                    key: item.id
                                }, function(status, data) {
                                    return h('span', {
                                        className: 'photo photo-' + data.id
                                    }, data.url_);
                                });
                            });
                            return h.apply(React, ['div', {}].concat(items));
                        }
                        if (status === ns.V.LOADING) {
                            return h('span', { className: 'loading' });
                        }
                        return h('span', { className: 'error' });
                    })
                );
            }
        });

        ns.init();
    });

    describe('в первом апдейте, когда коллекция фоточек незагружена ->', function() {
        beforeEach(function() {
            var counter = 0;
            var secondUpdate = this.secondUpdate = new Vow.Promise();

            ns.events.on('ns-page-after-load', function() {
                if (++counter === 2) {
                    secondUpdate.fulfill();
                }
            });
            return ns.page.go('/photos');
        });
        it('должен загрузить модельку фоточек', function() {
            expect(ns.Model.get('photos').isValid()).to.be.eql(true);
        });
        it('должен нарисовать <span class="loading">', function() {
            expect(document.querySelector('.loading')).to.be.ok;
        });

        describe('во втором апдейте, после загрузки коллекции фоточек ->', function() {
            beforeEach(function() {
                return this.secondUpdate;
            });
            it('должен нарисовать 3 фотографии', function() {
                expect(document.querySelectorAll('.photo').length).to.be.eql(3);
            });

            describe('после вызова экшена change-photo ->', function() {
                beforeEach(function() {
                    return ns.action.run('change-photo', { id: 1 });
                });
                it('должен поменять первую фоточку', function() {
                    expect(document.querySelector('.photo-1').innerText).to.be.eql('4');
                });
            });
        });
    });
});
