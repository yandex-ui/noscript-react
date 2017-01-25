module.exports = function(config) {
    config.set({
        basePath: '',
        frameworks: ['mocha', 'sinon-chai'],
        files: [
            // для тестов
            './node_modules/vow/lib/vow.js',
            './node_modules/react/dist/react.js',
            './node_modules/react-dom/dist/react-dom.js',
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
