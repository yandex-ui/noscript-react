var gulp = require('gulp');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

var codeWrapper = 'module.exports = function(ns) {\n\
    var React = require(\'react\');\n\
    var ReactDOM = require(\'react-dom\');\n\
    var ReactDOMServer = require(\'react-dom/server\');\n\
    var no = require(\'nommon\');\n\
\n\
<%= contents %>\n\
};\r\n';
var destinationFolder = './dist';

gulp.task('default', function() {
    // Build server module
    gulp.src(['./src/ns.viewReactMixin.js', './src/*.js'])
        .pipe(concat('noscript-react.module.js'))
        .pipe(wrap(codeWrapper))
        .pipe(gulp.dest(destinationFolder));

    // Build browser modules
    gulp.src(['./src/ns.viewReactMixin.js', './src/*.js'])
        .pipe(concat('noscript-react.js'))
        .pipe(gulp.dest(destinationFolder))
        .pipe(rename({ extname: '.min.js' }))
        .pipe(uglify())
        .pipe(gulp.dest(destinationFolder));
});

