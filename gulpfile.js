let gulp = require("gulp"),
	cleanCSS = require('gulp-clean-css');
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps = require('gulp-sourcemaps'),
	del = require("del"),
	rename = require("gulp-rename"),
	uglify = require('gulp-uglify'),
	babel = require('gulp-babel');

gulp.task("clean", () => {
	return del(['public/js', 'public/css']);
});

gulp.task('setLibraries', () => {
	gulp.src("node_modules/jquery/dist/jquery.min.js")
		.pipe(rename("jquery.js"))
		.pipe(gulp.dest('public/js'));

	gulp.src("node_modules/axios/dist/axios.min.js")
		.pipe(gulp.dest('public/js'));

	return gulp.src("node_modules/normalize.css/normalize.css")
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('public/css'));
});

gulp.task('buildCSS', () =>
    gulp.src(["src/css/**/*.css", "!**/normalize.css"], { base: 'src' })
        .pipe(sourcemaps.init())
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(autoprefixer({
        	browsers: ['last 4 versions']
        }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public'))
);

gulp.task("buildJS", () =>
    gulp.src(["src/js/**/*.js", "!**/{jquery,axios.min}.js"], { base: 'src' })
        .pipe(sourcemaps.init())
        .pipe(babel({
            presets: ['@babel/env']
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('public'))
);


gulp.task("build", gulp.series("clean", "setLibraries", "buildCSS", "buildJS"));