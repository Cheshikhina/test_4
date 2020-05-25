"use strict";
var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var server = require("browser-sync").create();
var csso = require("gulp-csso");
var rename = require("gulp-rename");
var imagemin = require("gulp-imagemin");
var webp = require("gulp-webp");
var svgstore = require("gulp-svgstore")
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");
var del = require("del");
var concat = require("gulp-concat");
var uglify = require("gulp-uglify");
var terser = require("gulp-terser");
var babel = require("gulp-babel");
var cssBase64 = require("gulp-css-base64");

gulp.task("scripts:index", function () {
  return gulp.src(["source/js/polyfill/*.js", "source/js/*.js"])
    .pipe(babel())
    .pipe(plumber())
    .pipe(concat("index.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(gulp.dest("build/js"));
});

gulp.task("scripts-min:index", function () {
  return gulp.src(["source/js/polyfill/*.js", "source/js/*.js"])
    .pipe(babel())
    .pipe(terser())
    .pipe(plumber())
    .pipe(concat("index.js"))
    .pipe(gulp.dest("build/js"))
    .pipe(uglify())
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(gulp.dest("build/js"));
});

gulp.task("css", function () {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass({
      includePaths: require('node-normalize-scss').includePaths
    }))
    .pipe(postcss([autoprefixer({
      browsers: [
        "last 2 versions",
        "not dead",
        "not IE <= 10",
        "not ie_mob <= 10"
      ]
    })]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });
  gulp.watch("source/sass/**/*.{scss,sass}", gulp.series("css", "base64", "refresh"));
  gulp.watch("source/img/icon-*.svg", gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html", "refresh"));
  gulp.watch("source/js/*.js", gulp.series("scripts:index", "refresh"));
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("images", function () {
  return gulp.src("source/img/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({
        optimizationLevel: 3
      }),
      imagemin.jpegtran({
        progressive: true
      }),
      imagemin.svgo({
        plugins: [{
            cleanupIDs: false
          },
          {
            removeViewBox: false
          },
          {
            convertPathData: false
          },
          {
            mergePaths: false
          },
        ],
      })
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/*.{png,jpg}")
    .pipe(webp({
      quality: 90
    }))
    .pipe(gulp.dest("source/img"));
});

gulp.task("sprite", function () {
  return gulp.src("source/img/icon-*.svg")
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest("build/img"));
});

gulp.task("base64", function () {
  return gulp.src("build/css/style.min.css")
    .pipe(cssBase64({
      maxWeightResource: 5000, //50кб
      extensionsAllowed: [".png", ".jpg"]
    }))
    .pipe(gulp.dest("build/css"));
});

gulp.task("html", function () {
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("copy", function () {
  return gulp.src([
      "source/fonts/**/*.{woff,woff2}",
      "source/img/**",
      "source//*.ico",
      "source/js/async-polyfills/*.js"
    ], {
      base: "source"
    })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", gulp.series("clean", "copy", 'scripts:index', "css", "base64", "sprite", "html"));
gulp.task("start", gulp.series("build", "server"));
gulp.task("prod", gulp.series("clean", "copy", 'scripts-min:index', "css", "base64", "sprite", "html"));
