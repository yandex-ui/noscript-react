describe('ns.js', function() {

    describe('ns.init', function() {
        describe('ns.MAIN_VIEW не определен ->', function() {
            it('должен кинуть исключение', function() {
                expect(function() {
                    ns.init();
                }).to.throw();
            });
        });
    });

    describe('ns.parseQuery', function() {

        var tests = {
            'a=1': { a: '1' },
            'a=1&b=2': { a: '1', b: '2' },
            'a=1&b=2&': { a: '1', b: '2' },
            'a=1&b=2&c': { a: '1', b: '2', c: '' },
            'a=1&b=2&c=': { a: '1', b: '2', c: '' },
            'a=1&b=2&c=foo=bar': { a: '1', b: '2', c: 'foo=bar' },
            'a=1&a=2&a=foo': { a: ['1', '2', 'foo'] },
            'a=%3D': { a: '=' },
            'a=%3': { a: '' }
        };
        Object.keys(tests).forEach(function(key) {
            var testString = key;
            var expectedResult = tests[key];
            it('should parse "' + testString + '" as ' + JSON.stringify(expectedResult), function() {
                var actualResult = ns.parseQuery(testString);
                expect(actualResult).to.be.eql(expectedResult);
            });
        });
    });

    describe('ns.assert', function() {
        it('should be ok', function() {
            expect(function() {
                ns.assert(true, '', '');
            }).to.not.throw();
        });
        it('should throw error', function() {
            expect(function() {
                ns.assert(false, 'context', 'message');
            }).to.throw(/\[context\] message/);
        });
        it('should throw error with params', function() {
            expect(function() {
                ns.assert(false, 'context', 'error code %s', 7);
            }).to.throw(/\[context\] error code 7/);
        });
    });

    describe('ns.assert.fail', function() {
        it('should throw error', function() {
            expect(function() {
                ns.assert.fail('context', 'message');
            }).to.throw(/\[context\] message/);
        });
        it('should throw error with params', function() {
            expect(function() {
                ns.assert.fail('context', 'error code %s', 7);
            }).to.throw(/\[context\] error code 7/);
        });
    });
});
