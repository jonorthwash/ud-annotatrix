const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');
const compileEJS = require('./scripts/compile-ejs');

gulp.task('js', () => {
  return browserify('client/index.js', {
      standalone: 'data'
    })
    .transform('babelify', {
      presets: ['env'],
      compact: false
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('server/public/js'));
});

gulp.task('html', () => {
  return compileEJS();
});

/*
gulp.task('uglify', () => {
  return browserify('client/index.js')
    .transform('babelify', {
      presets: ['env'],
      compact: true
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('public/js'))
    .pipe(rename('bundle.min.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('.', {
      mapFile: filename => {
        return filename.replace(/min\.js/, 'js');
      }
    }))
    .pipe(gulp.dest('public/js'));
});
*//*
gulp.task('uglifyify', () => {
  return browserify('client/index.js')
    .transform('babelify', {
      presets: ['env'],
      compact: true
    })
    .transform('uglifyify', {
      sourceMap: true
    })
    .bundle()
    .pipe(source('bundle.min.js'))
    .pipe(buffer())
    .pipe(gulp.dest('public/js'));
});
*/

gulp.task('watch', () => {
  gulp.watch(['client/*.js', 'client/*/*.js'], [/*'uglify', */'js', 'html']);
});

gulp.task('default', [/*'uglify', */'js', 'html']);
