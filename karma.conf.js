module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon-chai'],
        files: [
            './node_modules/jquery/dist/jquery.js',

            // VOW
            './node_modules/vow/lib/vow.js',
            // ----------------------------------------

            // NOMMON
            './node_modules/nommon/lib/no.base.js',
            './node_modules/nommon/lib/no.string.js',
            './node_modules/nommon/lib/no.array.js',
            './node_modules/nommon/lib/no.object.js',
            './node_modules/nommon/lib/no.events.js',
            './node_modules/nommon/lib/no.parser.js',
            './node_modules/nommon/lib/no.jpath.js',
            './node_modules/nommon/lib/no.promise.js',
            './node_modules/nommon/lib/no.date.js',
            // ----------------------------------------

            './dist/noscript-react.js',
            './test/stub.js',
            './test/ns.tests.js',
            './test/unit/*.js'
        ],
        reporters: ['progress'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['PhantomJS'],
        singleRun: false,
        concurrency: Infinity
    });
};
