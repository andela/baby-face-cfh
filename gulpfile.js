const  gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  eslint = require('gulp-eslint'),
  sass = require('gulp-sass'),
  mocha = require('gulp-mocha'),
  nodemon = require('gulp-nodemon'),
  bower = require('gulp-bower'),
  browserSync = require('browser-sync').create(),
  reload = browserSync.reload;

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
    .pipe(gulp.dest('public/css'))
    .pipe(reload({stream: true}));
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

gulp.task('watch', () => {
  gulp.watch(paths.jade).on('change', reload);
  gulp.watch(paths.scripts, ['eslint']).on('change', reload);
  gulp.watch(paths.html).on('change', reload);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.css, ['sass']).on('change', reload);
});

// Bower task
gulp.task('install', ['bower']);

// Build task
gulp.task('build', ['sass', 'angular', 'bootstrap', 'jquery', 'underscore',
  'angularUiUtils', 'angularBootstrap']);

// Test task
gulp.task('test', ['mochaTest']);

// Default task
gulp.task('default', ['nodemon', 'watch']);
