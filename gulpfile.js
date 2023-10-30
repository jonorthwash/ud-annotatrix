const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const babelify = require("babelify");
const rename = require("gulp-rename");
const sourcemaps = require("gulp-sourcemaps");
const compileEJS = require("./scripts/compile-ejs");
const terser = require("gulp-terser");
const size = require("gulp-size");
const tsify = require("tsify");
require("dotenv").config();

const gulp_mode = process.env.GULP_ENV || "development";
console.log("Gulp runs in " + gulp_mode + " mode");

gulp.task("js", function() {
  let stream = browserify({entries: ["src/client/index.ts"], debug: true})
                   .plugin(tsify)
                   .transform(babelify, {global: true})
                   .bundle()
                   .on("error", function(err) { console.error(err); })
                   .pipe(source("bundle.js"))
                   .pipe(buffer())
                   .pipe(size());

  if (gulp_mode == "production") {
    stream = stream.pipe(terser({keep_fnames: true, mangle: false, compress: {drop_console: true}})).pipe(size())
  }
  return stream.pipe(gulp.dest("src/client/public/js"));
});

gulp.task("html", function(done) {
  compileEJS();
  done();
});

gulp.task("ico", function() { return gulp.src(["./src/client/favicon.png"]).pipe(gulp.dest("./src/client/public")); });

gulp.task("watch", () => {
  gulp.watch(["src/**/*.ts", "src/client/views/**/*.ejs"], gulp.parallel("js", "html"));
});

gulp.task("default", gulp.parallel("js", "html", "ico"));
