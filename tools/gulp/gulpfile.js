var fs = require('fs'),
    gulp = require('gulp'),
    browserify = require('browserify'),
    watchify = require('watchify');

function bundle(b) {
    console.log("Creating bundle");

    b.bundle()
        .pipe(fs.createWriteStream('../../build/oax6.js'));
}

gulp.task('build', function() {
    var b = browserify();

    b.add('../../src/js/OAX6.js');
    bundle(b);
});

gulp.task('watch', function() {
    var b = browserify({
        entries: ['../../src/js/OAX6.js'],
        cache: {},
        packageCache: {},
        plugin: [watchify]
    });

    b.on('update', function(){ bundle(b); });
    bundle(b);
});

gulp.task('default', ['build']);