const uglify = require('gulp-uglify');
const cleanCSS = require('gulp-clean-css');
const runSequence = require('run-sequence');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const ast = require('gulp-ast');
const pump = require('pump');

const inputDir = 'sample-src';
const outputDir = 'dist';

/**
 * default
 */
gulp.task('default', callback => {
    // gulpではタスクが並列に実行されるため、run-sequenceプラグインを使って順次実行
    runSequence('clean', 'copy', 'minify-css', 'minify-js', callback);
});

/**
 * clean
 */
gulp.task('clean', callback => {
    return del(outputDir, callback);
});

/**
 * コピー
 *
 * inputDirの内容を丸ごとoutputDirへコピーする
 */
gulp.task('copy', () => {
    return gulp.src(`${inputDir}/**/*`)
        .pipe(gulp.dest(outputDir));
});

/**
 * CSSコード圧縮
 *
 * gulp-clean-cssのオプションは下記を参照
 * https://github.com/scniro/gulp-clean-css
 */
gulp.task('minify-css', () => {
    return gulp.src([`${inputDir}/**/*.css`])
        .pipe(cleanCSS())
        .pipe(gulp.dest(outputDir));
});

/**
 * jsコード圧縮
 *
 * gulp-uglifyにオプションは下記を参照
 * https://github.com/terinjokes/gulp-uglify
 */
gulp.task('minify-js', callback => {
    pump([
        gulp.src([`${inputDir}/**/*.js`, `!${inputDir}/js/lib/*.js`]),
        sourcemaps.init(),
        uglify(),
        sourcemaps.write('.'), // Source Mapを同じフォルダに出力
        gulp.dest(outputDir),
      ],
      callback
    );
});

/**
 * jsコードコメント除去だけ
 */
gulp.task('comment-del-js', callback => {
    pump([
        gulp.src([`${inputDir}/**/*.js`, `!${inputDir}/js/lib/*.js`]),
        ast.parse(),        // コメント除去するため一度astに変換して
        ast.render(),       // ソースコードの形に戻す
        gulp.dest(outputDir)
      ],
      callback
    );
});
