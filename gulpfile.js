const {src, dest, watch, parallel, series} = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const htmlmin = require('gulp-htmlmin');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const avif = require('gulp-avif');
const webp = require('gulp-webp');
const imagemin = require('gulp-imagemin');
const newer = require('gulp-newer');
const fonter = require('gulp-fonter');
const ttf2woff2 = require('gulp-ttf2woff2');

function htmlMin() {
    return src("src/*.html")
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest("build"))
}

function images() {
    return src([
        'src/img/src/*.*',
        '!src/img/src/*.svg'
    ])
    .pipe(newer('src/img/build'))
    .pipe(avif({quality: 70}))

    .pipe(src('src/img/src/*.*'))
    .pipe(newer('src/img/build'))
    .pipe(webp())

    .pipe(src('src/img/src/*.*'))
    .pipe(newer('src/img/build'))
    .pipe(imagemin())
    
    .pipe(dest('src/img/build'))
}

function styles() {
    return src('src/scss/style.scss')
        .pipe(concat('style.min.css'))
        .pipe(scss({
            outputStyle: 'compressed'
        }))
        .pipe(dest('src/css'))
        .pipe(browserSync.stream())
}

function scripts() {
    return src([
        'src/js/*.js',
        '!src/js/main.min.js'
    ])
        .pipe(concat('main.min.js'))
        .pipe(uglify())
        .pipe(dest('src/js'))
        .pipe(browserSync.stream())
}

function fonts() {
    return src('src/fonts/src/*.*')
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src('src/fonts/*.ttf'))
        .pipe(ttf2woff2())
        .pipe(dest('src/fonts'))
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "src/"
        },
        notify: false
    });
    watch(['src/scss/**/*.scss'], styles)
    watch(['src/img/src'], images)
    watch(['src/js/**/*.js'], scripts)
    watch(['src/*.html']).on('change', browserSync.reload)
}

function cleanBuild() {
    return src('build')
        .pipe(clean())
}

function building() {
    return src([
        'src/css/style.min.css',
        'src/js/main.min.js',
        'src/img/build/*.*',
        'src/fonts/*.*',
    ], {base: 'src'})
    .pipe(dest('build'))
}

exports.styles = styles;
exports.htmlMin = htmlMin;
exports.images = images;
exports.scripts = scripts;
exports.watching = watching;
exports.building = building;
exports.fonts = fonts;

exports.default = parallel(styles, images, fonts, scripts, watching);
exports.build = series(cleanBuild, parallel(building, htmlMin));