var fs = require('fs'),
    createSymlink = require('create-symlink'),
    gulp = require('gulp'),
    browserify = require('browserify'),
    watchify = require('watchify');

function createScenarioSymlink() {
    var path = '../../scenarios/wod6/Info.js',
        target = '../../src/js/ScenarioInfo.js';

    if (fs.existsSync(target)) {
        return Promise.resolve();
    }

    return createSymlink(path, target);
}

function bundle(b) {
    console.log("Creating bundle");

    b.bundle()
        .pipe(fs.createWriteStream('../../build/oax6.js'));
}

gulp.task('build', function() {
    createScenarioSymlink()
    .then(function() {
        var b = browserify({
            entries: ['../../src/js/OAX6.js'],
            debug: true
        });

        bundle(b);
    })
    .catch(function(error) {
        console.error(error);
    });
});

gulp.task('watch', function() {
    createScenarioSymlink()
    .then(function() {
        var b = browserify({
            entries: ['../../src/js/OAX6.js'],
            cache: {},
            packageCache: {},
            plugin: [watchify],
            debug: true
        });

        b.on('update', function(){ bundle(b); });
        bundle(b);
    })
    .catch(function(error) {
        console.error(error);
    });
});

gulp.task('default', ['build']);