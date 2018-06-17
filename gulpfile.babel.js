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
      presets: ['env']
    })
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(buffer())
    .pipe(gulp.dest('public/js'));

});

gulp.task('uglify', () => {
  return browserify('src/notatrix.js', {
      standalone: 'nx'
    })
    .transform('babelify', {
      presets: ['env'],
      plugins: ["transform-es5-property-mutators"]
    })
    .bundle()
    .pipe(source('notatrix.js'))
    .pipe(buffer())
    .pipe(gulp.dest('build'))
    .pipe(rename('notatrix.min.js'))
    .pipe(sourcemaps.init())
    .pipe(uglify())
    .pipe(sourcemaps.write('.', {
      mapFile: (filename) => {
        return filename.replace(/min\.js/, 'js');
      }
    }))
    .pipe(gulp.dest('build'));
})

gulp.task('watch', () => {
  gulp.watch('src/*.js', gulp.series('uglify', 'js'));
});

gulp.task('default', ['js']);
//gulp.task('default', gulp.series('uglify', 'js', 'watch'));
