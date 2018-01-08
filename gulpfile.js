var gulp = require('gulp');
var ts = require('gulp-typescript');//
var sourcemaps = require('gulp-sourcemaps');
var concat = require("gulp-concat");
var uglify=require("gulp-uglify");
var rename = require("gulp-rename");
var merge = require('merge2'); 
del = require('del');

var tsProject = ts.createProject('tsconfig.json');
// gulp.task("default", function () {
//     return tsProject.src()
//     .pipe(sourcemaps.init())
//         .pipe(tsProject()).js
//         .pipe(concat('all.js'))
//         .pipe(gulp.dest("dist"))
//         .pipe(uglify())
//         .pipe(rename('all.min.js'))
//         .pipe(sourcemaps.write("./"))
//         .pipe(gulp.dest("dist"));
// });

 
gulp.task('scripts', function() {
    var tsResult = tsProject.src()
        .pipe(sourcemaps.init())
        .pipe(tsProject());
 
    return merge([
        tsResult.dts.pipe(gulp.dest('dist/lib')),
        tsResult.js
        .pipe(sourcemaps.write("./"))
        .pipe(gulp.dest('dist/lib'))
    ]);
});

// Clean
gulp.task('clean', function(cb) {
    del(['dist/lib'], cb)
});
// Default task
gulp.task('default', ['clean','scripts']);
