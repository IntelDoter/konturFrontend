/**
 * Created by IntelDoter on 04.02.2017.
 */

'use strict';

var gulp = require('gulp');
var sass = require('gulp-sass');
var minify = require('gulp-minify');

gulp.task('sass', function () {
    return gulp.src('./sass/*.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./css'));
});

gulp.task('watch', function () {
    gulp.watch('./sass/styles/*.scss', ['sass']);
});

gulp.task('compress_js', function() {
    gulp.src('scripts/*.js')
        .pipe(minify({
            ext:{
                src:'-debug.js',
                min:'.js'
            },
            exclude: ['tasks'],
            ignoreFiles: ['.combo.js', '.min.js']
        }))
        .pipe(gulp.dest('dist/scripts'))
});