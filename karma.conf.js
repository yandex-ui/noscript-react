module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon-chai'],
        files: [
            './node_modules/jquery/dist/jquery.js',

            // VOW
            './node_modules/vow/lib/vow.js',
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
