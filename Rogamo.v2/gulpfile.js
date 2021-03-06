var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var templateCache = require('gulp-angular-templatecache');
var htmlreplace = require('gulp-html-replace');

var paths = {
  sass: ['./scss/**/*.scss'],
  templates: ['./www/app/**/*.html'],
  index_html: ['./www/index.html']
};

gulp.task('default', ['sass', 'templatecache', 'remove-cordova-browserscript']);

gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.templates, ['templatecache']);
  gulp.watch(paths.index_html, ['remove-cordova-browserscript']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});

/**
 * Used to concatenate all HTML templates into a single JavaScript module.
 */
gulp.task("templatecache", function() {
    console.log("Concatenating HTML templates to single JavaScript module.");
    return gulp.src(paths.templates)
        .pipe(templateCache({
            "filename": "templates.js",
            "root": "app/",
            "module": "templates",
            standalone: true
        }))
        .pipe(gulp.dest("./www/app"));
});

gulp.task("remove-cordova-browserscript", function() {
  console.log('Remove cordova browserscript...');
  gulp.src(paths.index_html)
    .pipe(htmlreplace({
        'cordovajs': {
            src: null,
            tpl: ''
        }
    }))
    .pipe(gulp.dest('./platforms/ios/www'));
});
