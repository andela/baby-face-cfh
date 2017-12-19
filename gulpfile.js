const  gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  eslint = require('gulp-eslint'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  sass = require('gulp-sass'),
  mocha = require('gulp-mocha'),
  nodemon = require('gulp-nodemon'),
  bower = require('gulp-bower');

  paths = {
    css: ['public/css/**'],
    html: ['public/views/**'],
    jade: ['app/views/**'],
    lint: [
      'gulpfile.js', 'public/js/**/*.js', 'test/**/*.js', 'app/**/*.js',
      '!node_modules/**'
    ],
    sass: ['public/css/common.scss, public/css/views/articles.scss'],
    scripts: ['public/js/**', 'app/**/*.js'],
    test: ['test/**/*.js'],
  };

gulp.task('lint', () => {
  return gulp.src(paths.lint)
    .pipe(eslint())
    .pipe(eslint.formatEach());
});

gulp.task('sass', () => {
  return gulp.src(paths.sass)
    .pipe(sourcemaps.init())
      .pipe(sass().on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('public/css'));
});

gulp.task('nodemon', () => {
  nodemon({
    script: 'server.js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    ext: 'js',
    env: {
      'PORT': 3000,
    },
    watch: ['app', 'config'],
  })
})

gulp.task('mochaTest', () => {
  return gulp.src(paths.test)
    .pipe(mocha({
      reporter: 'spec',
    }))
})

gulp.task('bower', () => {
  return bower();
});

gulp.task('angular', () => {
  gulp.src('bower_components/angular/**/*.js')
    .pipe(gulp.dest('./public/lib/angular'));
});

gulp.task('bootstrap', () => {
  gulp.src('bower_components/bootstrap/**/*')
    .pipe(gulp.dest('./public/lib/bootstrap'));
});

gulp.task('jquery', () => {
  gulp.src('bower_components/jquery/**/*')
    .pipe(gulp.dest('./public/lib/jquery'));
});

gulp.task('underscore', () => {
  gulp.src('bower_components/underscore/**/*')
    .pipe(gulp.dest('./public/lib/underscore'));
});

gulp.task('angularUiUtils', () => {
  gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
    .pipe(gulp.dest('./public/lib/angular-ui-utils/modules'));
});

gulp.task('angularBootstrap', () => {
  gulp.src('bower_components/angular-bootstrap/**/*')
    .pipe(gulp.dest('./public/lib/angular-bootstrap'));
});

gulp.task('transfer-bower', ['angular', 'bootstrap', 'jquery', 'underscore', 'angularUiUtils', 'angularBootstrap']);

gulp.task('watch', () => {
  gulp.watch(paths.jade);
  gulp.watch(paths.scripts, ['eslint']);
  gulp.watch(paths.html);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.css, ['sass']);
});

gulp.task('install', ['bower']);

gulp.task('build', ['sass', 'transfer-bower']);

gulp.task('test', ['mochaTest']);

gulp.task('default', ['nodemon', 'watch']);
