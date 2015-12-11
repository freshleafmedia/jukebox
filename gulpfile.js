var gulp = require('gulp');
var browserify = require('gulp-browserify');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var notify = require("gulp-notify");
var livereload = require('gulp-livereload');

var paths = {
    sass: 'scss/*.scss',
    javascript: 'js/source/*.js',
};

var dest = {
    css: 'css',
    javascript: 'js'
};


// Basic usage
gulp.task('scripts', function() {
    gulp.src('js/source/app.js')
        .pipe(browserify())
        .on('error', notify.onError({
            message: "Error: <%= error.message %>",
            title: "Browserify failed"
        }))
        .on('error', swallowError)
        .pipe(concat('app.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(dest.javascript))
        .pipe(notify({title: "Browserify complete", message: "All of the shiny things!!"}))
        .pipe(livereload());
});

gulp.task('sass', function() {
    return gulp.src('scss/main.scss')
        .pipe(sass())
        .on('error', notify.onError({
            message: "Error: <%= error.message %>",
            title: "Gulp SASS failed"
        }))
        .on('error', swallowError)
        .pipe(gulp.dest(dest.css))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(dest.css))
        .pipe(notify({title: "SASS Compiled", message: "Jam my sandwich!!"}))
        .pipe(livereload());

});

/* Watch Files For Changes */
gulp.task('watch', function() {
    livereload.listen();
    gulp.watch(paths.sass, ['sass']);
    gulp.watch(paths.javascript, ['scripts']);

});

function swallowError (error) {

    //If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}

gulp.task('default', ['sass', 'scripts', 'watch']);