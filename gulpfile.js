const gulp = require("gulp");
const sass = require("gulp-sass");
const autoprefixer = require("gulp-autoprefixer");
const cssnano = require("gulp-cssnano");
const plumber = require('gulp-plumber');
const concat = require('gulp-concat');
const uglify = require('gulp-uglifyjs');


// CSS task
function css() {
  return gulp
    .src("dev/scss/**/*.scss")
    .pipe(sass())
    .pipe(
      autoprefixer(["last 15 versions", "> 1%", "ie 8", "ie 7"], {
        cascade: true
      })
    )
    .pipe(cssnano())
    .pipe(gulp.dest("public/stylesheets"))
}

function js(){
  return gulp
  .src([
    'dev/js/auth.js',
    'dev/js/post.js',
    'dev/js/comment.js',
    'dev/js/category.js'
    //
  ])
  .pipe(concat('scripts.js'))
  //.pipe(uglify())
  .pipe(gulp.dest('public/javascripts'))
}


// Watch files
// function watchFiles() {
//   gulp.watch("./dev/scss/**/*.scss", css);
//   gulp.watch("./dev/js/**/*.js", js);
// }

gulp.task("css", css);
gulp.task("js", js);
//gulp.task("watchFiles", watchFiles);
gulp.task(
  "default",
  gulp.series(gulp.parallel("css"),gulp.parallel("js"))
);