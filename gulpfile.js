const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const rename = require('gulp-rename');
const sourcemaps = require('gulp-sourcemaps');
const compileEJS = require('./scripts/compile-ejs');
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');
const terser = require('gulp-terser');
const size = require('gulp-size');
require('dotenv').config();

const gulp_mode = process.env.GULP_ENV || "development";
console.log("Gulp runs in "+ gulp_mode + " mode");


gulp.task('js', function () {
    let stream =  browserify({
        entries: ['client/index.js'],
        debug: true
    })
    .transform(babelify, { global: true})
    .bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(size());

    if (gulp_mode == "production"){
      stream = stream
      .pipe(terser({
        keep_fnames: true,
        mangle: false,
        compress: {
           drop_console: true
          }
      }))
      .pipe(size())
    }
    return stream
    .pipe(gulp.dest('server/public/js'));
});

gulp.task('html',  function(done) {
  compileEJS();
  done();
});

gulp.task('docs', done => {
  jsdoc2md.render({
    files: [
      'client/*.js',
      'client/*/*.js',
    ]
  }).then(md => {
    fs.writeFile('./client/README.md', md, err => {
      if (err)
        throw err;
    });
  });
done();
});

gulp.task('ico', function () {
    return gulp
        .src([ './client/favicon.png'])
        .pipe(gulp.dest('./server/public'));
});

gulp.task('watch', () => {
  gulp.watch(['client/*.js', 'client/*/*.js', 'server/views/*.ejs'], gulp.parallel('js', 'html', 'docs'));
});

gulp.task('default', gulp.parallel('js', 'html', 'docs', 'ico'));
