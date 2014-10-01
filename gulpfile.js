var gulp = require('gulp'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify');

gulp.task('default', function() {
	gulp.src('src/**/*.js')
		.pipe(uglify())
		.pipe(concat('nacho.js'))
		.pipe(gulp.dest('./'))
		.pipe(gulp.dest('./test/'));
});