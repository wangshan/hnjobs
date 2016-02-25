var gulp = require('gulp');
var concat = require('gulp-concat');
var ngConstant = require('gulp-ng-constant');

// when this runs in the backend, process.env.NODE_ENV is known
gulp.task('config', function() {
    var environment = process.env.NODE_ENV || 'development';
    var stream = gulp.src('public/config/' + environment + '.json')
        .pipe(ngConstant({
            name: 'app.config'
        }))
        .pipe(concat('public/js/config.js'))
        .pipe(gulp.dest('.'))
        .on('error', function() { });
    return stream;
});

gulp.task('build', ['config'], function() {
    var stream = gulp.src(['public/js/config.js', 'public/js/*.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('public/dist'));
    return stream;
});

gulp.task('watch:build', ['build'], function() {
    gulp.watch('public/js/*.js', ['build']);
});

gulp.task('default', ['build']);
