const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const fonter = require('gulp-fonter');

function browsersync() { // название функции не должно полностью совпадать с названием константы 
  browserSync.init({
    server : {
      baseDir: 'app/'
    }
  })
}

function cleanDist() {
  return del('dist')
}

function images() {
  return src('app/images/**/*')
  .pipe(imagemin(
    [
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
    ]
   )
  )
  .pipe(dest('dist/images'))
}

function scripts() {
  return src([
    'node_modules/jquery/dist/jquery.js',
    'app/js/main.js'
  ])
  .pipe(concat('main.min.js'))// Объеденяем и называем файл
  .pipe(uglify()) // теперь мнифицируем файл
  .pipe(dest('app/js')) // путь или мест куда будет выгружен файл 
  .pipe(browserSync.stream()) // это для того что бы страница обновлялась
}


function styles() {
  return src('app/scss/**/*.scss') // находим и возвращаем в функцию 
  .pipe(scss({outputStyle: 'compressed'})) // тут через пайп обращаемся к пакету с запросом    
  .pipe(concat('style.min.css')) // через данный пайп мы переименуем стили и конвертнём 
  .pipe(autoprefixer({
    overrideBrowserslist: ['last 10 version'],
    grid: true
  }))
  .pipe(dest('app/css')) // мы указали куа выгрузить результат конвертации
  .pipe(browserSync.stream())
}
// Включил свой пакет для работы с шрифтами
function fonts() {
  return src('app/fonts/*')
  .pipe(fonter({
    subset: [66,67,68, 69, 70, 71],
    formats: ['woff', 'ttf']
  }))
  pipe(dest('./dist'))
}

function build() {
  return src([
    'app/css/style.min.css',
    'app/fonts/**/*',
    'app/js/main.min.js',
    'app/*.html'
  ], {base: 'app'})
  .pipe(dest('dist'))
}


function watching() {
  watch(['app/scss/**/*.scss'], styles);
  watch(['app/js/**/*.js','!app/js/main.min.js'], scripts);// Следить за всеми! Кроме main.min.js
  watch(["app/*.html"]).on('change', browserSync.reload)
}
// тут мы экспортируем на ружу все наши функции
exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.fonts = fonts;
exports.cleanDist = cleanDist;

exports.build = series(cleanDist, images, build, fonts);
exports.default = parallel(browsersync, watching, scripts, styles);