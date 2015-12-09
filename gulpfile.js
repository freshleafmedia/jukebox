var gulp = require('gulp');
var browserify = require('gulp-browserify');
var sass = require('gulp-sass');
var watch = require('gulp-watch');
var minifycss = require('gulp-minify-css');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');

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
        .pipe(gulp.dest(dest.javascript))
});

gulp.task('sass', function() {
    return gulp.src('scss/main.scss')
        .pipe(sass())
        .on('error', swallowError)
        .pipe(gulp.dest(dest.css))
        .pipe(rename({suffix: '.min'}))
        .pipe(minifycss())
        .pipe(gulp.dest(dest.css))
});

function swallowError (error) {

    //If you want details of the error in the console
    console.log(error.toString());

    this.emit('end');
}

gulp.task('default', ['sass', 'scripts']);