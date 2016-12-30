// Karma configuration
module.exports = function(config) {
    config.set({

        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '',


        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: ['mocha', 'sinon-chai', 'browserify'],


        // list of files / patterns to load in the browser
        files: [
            // Plugin's files
            './node_modules/jquery/dist/jquery.js',
            './node_modules/noscript/dist/noscript.js',
            './node_modules/yate/lib/runtime.js',
            './node_modules/noscript-bosphorus/noscript-bosphorus.js',

            // WARNING - only for version 0.0.32 nommon
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

            './test/test.yate.js',
            './test/test.bundle.js',

            // Test's files and its suite
            './test/unit/*.js',
            './test/integration/*.js'
        ],


        // list of files to exclude
        exclude: [],

        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            './test/test.bundle.js': ['browserify']
        },


        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: ['progress'],


        // web server port
        port: 9876,


        // enable / disable colors in the output (reporters and logs)
        colors: true,


        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,


        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,


        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: ['PhantomJS'],


        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,

        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
