const gulp = require('gulp');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const babelify = require('babelify');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const sourcemaps = require('gulp-sourcemaps');

gulp.task('js', () => {
  return browserify('src/index.js', {
      standalone: 'uda'
    })
    .transform('babelify', {
      presets: ['env'],
      compact: false
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('public/js'));
});

gulp.task('uglify', () => {
  return browserify('src/index.js', {
      standalone: 'uda'
    })
    .transform('babelify', {
      presets: ['env']
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

gulp.task('watch', () => {
  gulp.watch('src/*.js', [/*'uglify', */'js']);
});

gulp.task('default', [/*'uglify', */'js', 'watch']);
