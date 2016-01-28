var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('js', function() {
    gulp.src('public/js/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('watch:js', ['js'], function() {
    gulp.watch('public/js/*.js', ['js']);
});
