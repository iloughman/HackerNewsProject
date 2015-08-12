var gulp = require('gulp');
var run = require('gulp-run');
var plumber = require('gulp-plumber');
var sourcemaps = require('gulp-sourcemaps');
var concat = require('gulp-concat');
var runSeq = require('run-sequence');
var sass = require('gulp-sass');
var rename = require('gulp-rename');
var mocha = require('gulp-mocha');
var babel = require('gulp-babel');

gulp.task('default', function(){
	gulp.start('build');

	gulp.watch(['client/app.js', 'client/**/*.js'], function(){
		runSeq('buildJS');
	});

	gulp.watch(['client/app.scss', 'client/**/*.scss'], function () {
	    runSeq('buildCSS');
	});
});

gulp.task('build', function() {
	runSeq(['buildJS', 'buildCSS']);
});

gulp.task('buildJS', function () {
    return gulp.src(['./client/app.js', './client/**/*.js'])
        .pipe(plumber())
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/'));
});

gulp.task('buildCSS', function () {
    return gulp.src('./client/app.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(rename('main.css'))
        .pipe(gulp.dest('./public/'));
});