const gulp = require("gulp");
const browserify = require("browserify");
const source = require("vinyl-source-stream");
const buffer = require("vinyl-buffer");
const babelify = require("babelify");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify");
const sourcemaps = require("gulp-sourcemaps");
const jsdoc2md = require("jsdoc-to-markdown");
const fs = require("fs");
const tsify = require("tsify");

gulp.task("js", () => {
  return browserify("src/index.js", {standalone: "nx"})
      .plugin(tsify)
      .transform(
          "babelify",
          {presets: ["@babel/preset-env"]})
      .bundle()
      .pipe(source("notatrix.js"))
      .pipe(buffer())
      .pipe(gulp.dest("build"));
});

gulp.task("uglify", () => {
  return browserify("src/index.js", {standalone: "nx"})
      .plugin(tsify)
      .transform(
          "babelify",
          {presets: ["@babel/preset-env"]})
      .bundle()
      .pipe(source("notatrix.js"))
      .pipe(buffer())
      .pipe(gulp.dest("build"))
      .pipe(rename("notatrix.min.js"))
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(sourcemaps.write(".", {
        mapFile: (filename) => { return filename.replace(/min\.js/, "js"); }
      }))
      .pipe(gulp.dest("build"));
});

gulp.task(
    "docs",
    done => {jsdoc2md.render({files: ["./src/nx/*.js", "./src/formats/*.js"]})
                 .then(md => {fs.writeFile("./build/docs.md", md, err => {
                         if (err)
                           throw err;

                         done();
                       })})});

gulp.task(
    "watch",
    () => { gulp.watch("src/*.js", gulp.series("uglify", "js", "docs")); });

gulp.task("default", gulp.series("uglify", "js", "docs"));
