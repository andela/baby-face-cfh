import gulp from 'gulp';
import babel from 'gulp-babel';
import sourcemaps from 'gulp-sourcemaps';
import eslint from 'gulp-eslint';
import sass from 'gulp-sass';
import mocha from 'gulp-mocha';
import nodemon from 'gulp-nodemon';
import bower from 'gulp-bower';
import exit from 'gulp-exit';
import browserSync from 'browser-sync';

const { reload } = browserSync,
  paths = {
    css: ['public/css/**'],
    html: ['public/views/**'],
    jade: ['app/views/**'],
    lint: [
      'gulpfile.js', 'public/js/**/*.js', 'test/**/*.js', 'app/**/*.js',
      '!node_modules/**'
    ],
    sass: ['public/css/common.scss'],
    scripts: ['public/js/**', 'app/**/*.js'],
    test: ['./dist/test/**/*.js'],
  };

gulp.task('babel', () =>
  gulp.src(['./**/*.js', '!dist/**', '!bower_components/**/*', '!node_modules/**',
    '!gulpfile.babel.js'])
    .pipe(babel())
    .pipe(gulp.dest('dist')));

gulp.task('lint', () => gulp.src(paths.lint)
  .pipe(eslint())
  .pipe(eslint.formatEach()));

gulp.task('sass', () => gulp.src(paths.sass)
  .pipe(sourcemaps.init())
  .pipe(sass().on('error', sass.logError))
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public/css'))
  .pipe(reload({ stream: true })));

gulp.task('nodemon', () => {
  nodemon({
    script: './dist/server.js',
    ignore: ['README.md', 'node_modules/**', '.DS_Store'],
    ext: 'js',
    env: {
      PORT: 3000,
    },
    watch: ['app', 'config'],
    task: ['rebuild']
  });
});

gulp.task('mochaTest', () => gulp.src(paths.test)
  .pipe(mocha({
    reporter: 'spec',
  }))
  .pipe(exit()));

gulp.task('bower', () => bower());

gulp.task('angular', () => {
  gulp.src('bower_components/angular/**/*.js')
    .pipe(gulp.dest('./dist/public/lib/angular'));
});

gulp.task('bootstrap', () => {
  gulp.src('bower_components/bootstrap/dist/**/*')
    .pipe(gulp.dest('./dist/public/lib/bootstrap'));
});

gulp.task('jquery', () => {
  gulp.src('bower_components/jquery/**/*')
    .pipe(gulp.dest('./dist/public/lib/jquery'));
});

gulp.task('underscore', () => {
  gulp.src('bower_components/underscore/**/*')
    .pipe(gulp.dest('./dist/public/lib/underscore'));
});

gulp.task('angularUiUtils', () => {
  gulp.src('bower_components/angular-ui-utils/modules/route/route.js')
    .pipe(gulp.dest('./dist/public/lib/angular-ui-utils/modules'));
});

gulp.task('angularBootstrap', () => {
  gulp.src('bower_components/angular-bootstrap/**/*')
    .pipe(gulp.dest('./dist/public/lib/angular-bootstrap'));
});

// Move bower component files into dist/public folder
gulp.task('move-bower', ['angular', 'bootstrap', 'jquery', 'underscore',
  'angularUiUtils', 'angularBootstrap']);

// Move jade files into dist folder
gulp.task('move-jade', () => {
  gulp.src('app/views/**/*')
    .pipe(gulp.dest('./dist/app/views'));
});

// Move json config files to dist folder
gulp.task('move-json', () => {
  gulp.src('config/env/*.json')
    .pipe(gulp.dest('./dist/config/env'));
});

// Move files in public folder to dist folder
gulp.task('move-public', ['sass'], () => {
  gulp.src(['public/**/*', '!public/js/**'])
    .pipe(gulp.dest('./dist/public'));
});

gulp.task('watch', () => {
  gulp.watch(paths.jade).on('change', reload);
  gulp.watch(paths.scripts, ['lint']).on('change', reload);
  gulp.watch(paths.html).on('change', reload);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.css, ['sass']).on('change', reload);
});

// Bower task
gulp.task('install', ['bower']);

// Build task
gulp.task('build', ['sass', 'babel', 'move-public', 'move-jade', 'move-json', 'move-bower']);

// Re-build task after changes
gulp.task('rebuild', ['sass', 'babel', 'move-public', 'move-jade', 'move-json']);

// Test task
gulp.task('test', ['mochaTest']);

// Default task
gulp.task('default', ['nodemon', 'watch']);
