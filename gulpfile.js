'use strict';

var gulp = require('gulp');

var browserify = require('browserify');
var source = require('vinyl-source-stream');

var browserSync = require('browser-sync');
var gutil = require('gulp-util');
var minimist = require('minimist');
var buffer = require('gulp-buffer');
var uglify = require('gulp-uglify');
var imagemin = require('gulp-imagemin');
var CacheBuster = require('gulp-cachebust');
var cachebust = new CacheBuster();
var runSequence = require('run-sequence');
var favicons = require('gulp-favicons');
var concat = require('gulp-concat');
var manifest = require('gulp-manifest');


var express = require('express');
var options = minimist(process.argv);
var environment = options.environment || 'development';





var server;






gulp.task('html', function() {
  return gulp.src('src/html/**/*.html')
    .pipe(cachebust.references())
    .pipe(gulp.dest('dist'))
    .pipe(reload());
});

gulp.task('font', function() {
  return gulp.src('src/font/**/*.{woff,woff2}')
    .pipe(gulp.dest('dist'))
    .pipe(reload());
});

gulp.task('images', function() {
  return gulp.src('src/images/**/*.{png,jpg,svg}')
    .pipe(imagemin())
    .pipe(cachebust.resources())
    .pipe(gulp.dest('dist/images'))
    .pipe(reload());
});

gulp.task("favicons", function () {
    return gulp.src("src/images/icons/icon.png").pipe(favicons({
        appName: "dmitryovchinnikov.com",
        appDescription: "Dmitry Ovchinnikov, web designer and developer",
        developerName: "Dmitry Ovchinnikov",
        developerURL: "http://dmitryovchinnikov.com/",
        background: "#ffffff",
        path: "favicons/",
        url: "http://dmitryovchinnikov.com/",
        display: "standalone",
        orientation: "portrait",
        start_url: "/?homescreen=1",
        version: 1.0,
        logging: false,
        online: false,
        html: "index.html",
        pipeHTML: true,
        replace: true
    }))
    .on("error", handleError)
    .pipe(gulp.dest("dist/favicons"));
});

gulp.task('scripts', function() {
  return browserify('./src/scripts/main.js')
    .bundle().on('error', handleError)
    .pipe(source('bundle.js'))
    .pipe(environment === 'production' ? buffer() : gutil.noop())
    .pipe(environment === 'production' ? uglify() : gutil.noop())
    .pipe(cachebust.resources())
    .pipe(gulp.dest('dist/scripts'))
    .pipe(reload());
});

gulp.task('manifest', function(){
  gulp.src(['dist/*'], { base: './' })
    .pipe(manifest({
      hash: true,
      preferOnline: true,
      network: ['*'],
      filename: 'manifest',
      exclude: 'manifest'
     }))
    .pipe(gulp.dest('dist'));
});




gulp.task('server', function() {
  server = express();
  server.use(express.static('dist'));
  server.listen(8000);
  browserSync({ proxy: 'localhost:8000' });
});


//gulp.task('build', ['font', 'favicons', 'images', 'html']);

gulp.task('build', function(done) {
  runSequence('images', 'favicons', 'scripts', 'font', 'html', done); // 'done' is the call back function
});

gulp.task('watch', function() {
  gulp.watch('src/html/**/*.html', ['html']);
  gulp.watch('src/font/**/*.{woff,woff2}', ['font']);
  gulp.watch('src/images/**/*.{png,jpg,svg}', ['images']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
});


gulp.task('default', ['build', 'server']);

















function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}

function reload() {
  if (server) {
    return browserSync.reload({ stream: true });
  }

  return gutil.noop();
}






