const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const compileEJS = require('./scripts/compile-ejs');
const jsdoc2md = require('jsdoc-to-markdown');
const fs = require('fs');

gulp.task('js', function () {
    return browserify({
        entries: 'client/index.js',
        debug: true
    })
    .transform(babelify, { global: true })
    .bundle()
    .on('error', function (err) { console.error(err); })
    .pipe(source('bundle2.js'))
    .pipe(buffer())
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

gulp.task('watch', () => {
  gulp.watch(['client/*.js', 'client/*/*.js'], gulp.parallel(/*'uglify', */'js', 'html', 'docs'));
});

gulp.task('default', gulp.parallel('js', 'html', 'docs'));