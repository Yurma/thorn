const gulp = require('gulp');
const rename = require('gulp-rename');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const sourcemaps = require('gulp-sourcemaps');
const sassLint = require('gulp-sass-lint');
const autoprefixer = require('autoprefixer');
const header = require('postcss-header');
const cssnano = require('cssnano');

const package = require('./package.json');

const paths = {
  styles: {
    src: 'src/index.sass',
    dest: 'dist/css/'
  }
};

const hdr = `
/*!
  * @name     ${package.name}
  * @author   ${package.author}
  * @version  ${package.version}
  * @license  ${package.license}
  * Thorn is an open-source CSS framework
*/
`;

const options = [
  header({
    header: hdr
  }),
  autoprefixer({
    // browsers: [
    //   'last 3 versions',
    //   "IE >= 10"
    // ]
  })
];

const shrinkOptions = [cssnano()];

const toSass = () => {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss(options))
    .pipe(rename('index.css'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.styles.dest));
}; 

const toMin = () => {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(postcss(options))
    .pipe(postcss(shrinkOptions))
    .pipe(rename({
      base: 'index',
      suffix: '.min'
    }))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(paths.styles.dest));
};

const toLint = () => {
  return gulp.src('src/sass/**/*.s(a|c)ss')
    .pipe(sassLint())
    .pipe(sassLint.format())
    .pipe(sassLint.failOnError());
};

const watch = () => {
  gulp.watch(paths.styles.src, toSass);
};

const build = gulp.series(toLint, gulp.parallel(toSass, toMin));

build.description = 'Production mode build';
toSass.description = 'Development mode build';
toMin.description = 'CSS Min build';
toLint.description = 'Format code according to .sass-lint.yml file';
watch.description = 'Watches css files for changes';

exports.toSass = toSass;
exports.toMin = toMin;
exports.toLint = toLint;
exports.watch = watch;

exports.default = build;