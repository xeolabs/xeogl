var gulp = require('gulp');
var yuidoc = require("gulp-yuidoc"); // https://www.npmjs.com/package/gulp-yuidoc
const rollup = require('rollup');
const path = require('path');
const license = require('rollup-plugin-license');

gulp.task('docs', function (done) {
    gulp.src([
        "./src/**/*.js",
        'examples/js/animation/*.js',
        'examples/js/annotations/*.js',
        'examples/js/controls/*.js',
        'examples/js/effects/*.js',
        'examples/js/curves/*.js',
        'examples/js/generation/*.js',
        'examples/js/skyboxes/*.js',
        'examples/js/stories/*.js',
        'examples/js/geometry/*.js',
        'examples/js/models/*.js',
        'examples/js/helpers/*.js'
    ])
        .pipe(yuidoc.parser())
        .pipe(yuidoc.generator({
            themedir: "yuiDocThemes/xeogl",
            paths: [
                'src',
                'examples/js/animation',
                'examples/js/annotations',
                'examples/js/controls',
                'examples/js/effects',
                'examples/js/curves',
                'examples/js/generation',
                'examples/js/skyboxes',
                'examples/js/stories',
                'examples/js/geometry',
                'examples/js/models',
                'examples/js/helpers'
            ],
            outdir: './docs/',
            exclude: "renderer, utils"
        }))
        .pipe(gulp.dest("./docs"));
});

gulp.task('bundle-umd', () => {
    return rollup.rollup({
        input: './src/xeogl.js',
        plugins: [
            license({
                banner: {
                    file: path.join(__dirname, 'BANNER'),
                    encoding: 'utf-8' // Default is utf-8
                }
            })
        ]
    }).then(bundle => {
        return bundle.write({
            file: './build/xeogl.js',
            format: 'umd',
            name: 'xeogl',
            sourcemap: false
        });
    });
});

gulp.task('bundle-es', () => {
    return rollup.rollup({
        input: './src/xeogl.js',
        plugins: [
            license({
                banner: {
                    file: path.join(__dirname, 'BANNER'),
                    encoding: 'utf-8' // Default is utf-8
                }
            })
        ]
    }).then(bundle => {
        return bundle.write({
            file: './build/xeogl.module.js',
            format: 'es',
            name: 'xeogl',
            sourcemap: false
        });
    });
});

gulp.task('website', () => {
    gulp.src(['website/**/*']).pipe(gulp.dest('.'));
});

gulp.task('default', ['bundle-umd', 'bundle-es', 'docs']);