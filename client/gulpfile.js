var gulp = require('gulp');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
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
    javascript: 'js/**/*.js'
};

var dest = {
    css: 'css',
    javascript: 'js'
};


// Basic usage
gulp.task('scripts', function() {
    return browserify('./js/app.js', { debug: true })
        .transform("babelify", { presets: ["es2015"] })
        .bundle()
        .pipe(source('../public/js/app.min.js'))
        //.pipe(uglify())
        .pipe(gulp.dest(dest.javascript))
        .pipe(notify({title: "Browserify complete", message: "All of the shiny things!!"}))
        .pipe(livereload());
});

gulp.task('publish', function () {
    gulp.src('./node_modules/socket\.io-client/dist/socket.io.js')
        .pipe(gulp.dest('./../public/js/test.js'))
        .on('error', notify.onError({
            message: "Error: <%= error.message %>",
            title: "Gulp SASS failed"
        }));
});

gulp.task('sass', function() {
    return gulp.src('./scss/main.scss')
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