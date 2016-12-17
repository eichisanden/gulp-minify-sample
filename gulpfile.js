var gulp = require('gulp');
var ast = require('gulp-ast');
var through2 = require('through2');
var uglify = require('gulp-uglify');
var esprima = require('esprima');

/**
 * コメント除去
 *
 * AST変換後にソースに戻すことでコメント除去
 * 足りないセミコロンが補われたりコードも整形される
 */
gulp.task('del-comment', function() {
  gulp.src(['sample-src/**/*.js', '!sample-src/lib/*.js'])
    .pipe(ast.parse())
    .pipe(ast.render())
    .pipe(gulp.dest('./del-comment/'))
});

/**
 * コード圧縮
 */
gulp.task('uglify', () => {
  gulp.src(['sample-src/**/*.js', '!sample-src/lib/*.js'])
    .pipe(uglify())
    .pipe(gulp.dest('./dest/'))
});

/**
 * AST変換（esprima.tokenize）
 */
gulp.task('src-tokenize', function() {
  gulp.src(['sample-src/**/*.js', '!sample-src/lib/*.js'])
    .pipe(tokenize())
    .pipe(render())
    .pipe(gulp.dest('./src-tokenize/'))
});

/**
 * AST変換（esprima.parse）
 */
gulp.task('src-parse', function() {
  gulp.src(['sample-src/**/*.js', '!sample-src/lib/*.js'])
    .pipe(ast.parse())
    .pipe(render())
    .pipe(gulp.dest('./src-parse/'))
});

/**
 * AST変換（esprima.tokenize）
 */
gulp.task('dest-tokenize', function() {
  gulp.src(['dest/**/*.js'])
    .pipe(tokenize())
    .pipe(render())
    .pipe(gulp.dest('./dest-tokenize/'))
});

/**
 * AST変換（esprima.parse）
 */
gulp.task('dest-parse', function() {
  gulp.src(['dest/**/*.js'])
    .pipe(ast.parse())
    .pipe(render())
    .pipe(gulp.dest('./dest-parse/'))
});

function tokenize() {
  return through2.obj(function(file, encoding, cb) {
    var err;
    try {
      file.ast = esprima.tokenize(String(file.contents));
      this.push(file);
    } catch (_error) {
      err = _error;
      this.emit('error', new Error(err));
    }
    return cb();
  });
}

function render() {
  return through2.obj(function(file, encoding, cb) {
    var err;
    try {
      file.contents = new Buffer(JSON.stringify(file.ast, null, 2));
      delete file.ast;
      this.push(file);
    } catch (_error) {
      err = _error;
      this.emit(err);
    }
    return cb();
  });
};
