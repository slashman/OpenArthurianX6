const gulp = require('gulp');
const browserify = require('browserify');
const watchify = require('watchify');
const tsify = require('tsify');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');

const b = browserify({
    entries: ['./src/js/main.ts'],
    cache: {},
    packageCache: {},
    debug: true
}).plugin(tsify);

function bundle() {
    return b.bundle()
        .on('error', function (err) {
            console.error(err.toString());
            this.emit('end');
        })
        .pipe(source('oax6.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./build'));
}

function copyHtml() {
    return gulp.src('./src/html/index.html')
        .pipe(gulp.dest('./build'));
}

function copyCss() {
    return gulp.src('./src/html/oax6.css')
        .pipe(gulp.dest('./build'));
}

function copyAssets() {
    return gulp.src('./assets/**/*')
        .pipe(gulp.dest('./build/assets'));
}

function copyScenario() {
    // Note: Assuming wod6 is the active scenario, mapping it to build/scenario
    return gulp.src('./scenarios/wod6/**/*')
        .pipe(gulp.dest('./build/scenario'));
}

gulp.task('build', gulp.parallel(bundle, copyHtml, copyCss, copyAssets, copyScenario));

gulp.task('watch', gulp.series(
    gulp.parallel(bundle, copyHtml, copyCss, copyAssets, copyScenario),
    function watchFiles() {
        const w = watchify(b);
        w.on('update', bundle);
        w.on('log', console.log);
        
        gulp.watch('./src/html/index.html', copyHtml);
        gulp.watch('./src/html/oax6.css', copyCss);
        gulp.watch('./assets/**/*', copyAssets);
        gulp.watch('./scenarios/wod6/**/*', copyScenario);
        return Promise.resolve();
    }
));

gulp.task('default', gulp.series('build'));