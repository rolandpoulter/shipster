var gulp = require('gulp');
var runSequence = require('run-sequence');
var del = require('del');
var vinylPaths = require('vinyl-paths');
var to5 = require('gulp-6to5');
var jshint = require('gulp-jshint');
var stylish = require('jshint-stylish');
var yuidoc = require('gulp-yuidoc');
var changelog = require('conventional-changelog');
var assign = Object.assign || require('object.assign');
var fs = require('fs');
var bump = require('gulp-bump');
var browserSync = require('browser-sync');
var changed = require('gulp-changed');
var plumber = require('gulp-plumber');
var tools = require('aurelia-tools');

var gutil = require('gulp-util');
// var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
var watchify = require('watchify');
var browserify = require('browserify');
var stringify = require('stringify');

var bundler = watchify(browserify('./common_js/index.js', watchify.args)),
    watch = false, // Default
    exit;

// add any other browserify options or transforms here
bundler.transform(stringify(['.pem']));

gulp.task('build-common', bundle); // so you can run `gulp js` to build the file

bundler.on('update', function () {
  bundle();
  browserSync.reload();
});

bundler.on('log', gutil.log); // output build logs to terminal

function bundle() {
  clearTimeout(exit);

  if (!watch) {
    exit = setTimeout(function () {
      console.error(new Error('build-common timed out after 30 seconds.').stack);
      process.exit();
    }, 30000);
  }

  return bundler.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('common.js'))
    // optional, remove if you dont want sourcemaps
      // .pipe(buffer())
      // .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
      // .pipe(sourcemaps.write('./')) // writes .map file
    //
    .pipe(gulp.dest('./'));
}

var path = {
  common_js: 'common_js/**/*.js',
  source: ['src/**/*.js', '../lib/*.js'],
  html: 'src/**/*.html',
  style: 'styles/**/*.css',
  output: 'dist/',
  doc: './doc'
};

var compilerOptions = {
  filename: '',
  filenameRelative: '',
  blacklist: [],
  whitelist: [],
  modules: '',
  sourceMap: true,
  sourceMapName: '',
  sourceFileName: '',
  sourceRoot: '',
  moduleRoot: '',
  moduleIds: false,
  runtime: false,
  experimental: false,
  format: {
    comments: false,
    compact: false,
    indent: {
      parentheses: true,
      adjustMultilineComment: true,
      style: '  ',
      base: 0
    }
  }
};

var jshintConfig = {esnext:true};

gulp.task('clean', function() {
 return gulp.src([path.output])
    .pipe(vinylPaths(del));
});

gulp.task('build-system', function () {
  return gulp.src(path.source)
    .pipe(plumber())
    .pipe(changed(path.output, {extension: '.js'}))
    .pipe(to5(assign({}, compilerOptions, {modules:'system'})))
    .pipe(gulp.dest(path.output));
});

gulp.task('build-html', function () {
  return gulp.src(path.html)
    .pipe(changed(path.output, {extension: '.html'}))
    .pipe(gulp.dest(path.output));
});

gulp.task('lint', function() {
  return gulp.src(path.source)
    .pipe(jshint(jshintConfig))
    .pipe(jshint.reporter(stylish));
});

gulp.task('doc-generate', function(){
  return gulp.src(path.source)
    .pipe(yuidoc.parser(null, 'api.json'))
    .pipe(gulp.dest(path.doc));
});

gulp.task('doc', ['doc-generate'], function(){
  tools.transformAPIModel(path.doc);
});

gulp.task('bump-version', function(){
  return gulp.src(['./package.json'])
    .pipe(bump({type:'patch'})) //major|minor|patch|prerelease
    .pipe(gulp.dest('./'));
});

gulp.task('changelog', function () {
  var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

  return changelog({
    repository: pkg.repository.url,
    version: pkg.version,
    file: path.doc + '/CHANGELOG.md'
  }, function (err, log) {
    fs.writeFileSync(path.doc + '/CHANGELOG.md', log);
  });
});

gulp.task('build', function (callback) {
  return runSequence(
    'clean',
    ['build-common', 'build-system', 'build-html'],
    callback
  );
});

gulp.task('update-own-deps', function(){
  tools.updateOwnDependenciesFromLocalRepositories();
});

gulp.task('serve', ['build'], function (done) {
  browserSync({
    open: false,
    port: 5600,
    server: {
      baseDir: ['.'],
      middleware: function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
      }
    }
  }, done);
});

function reportChange (event) {
  console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
}

gulp.task('watch', ['serve'], function () {
  clearTimeout(exit);
  watch = true;
  // gulp.watch(path.common, ['build-common', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.source, ['build-system', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.html, ['build-html', browserSync.reload]).on('change', reportChange);
  gulp.watch(path.style, browserSync.reload).on('change', reportChange);
});

gulp.task('prepare-release', function (callback){
  return runSequence(
    'build',
    'lint',
    'bump-version',
    'doc',
    'changelog',
    callback
  );
});
