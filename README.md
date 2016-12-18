minify-sample
================

JavaScriptとCSSのコメント除去/ソース圧縮するサンプルです。

セットアップ
----
1. ローカルにNode.js が入ってなければインストールしてください。
2. このリポジトリをcloneしてください。
3. 依存ライブラリを取得するため、このディレクトリで以下のコマンドを実行してください。

```bash
$ npm update
```

サンプルの動かし方
----

gulpでdefaultタスクを実行すると、sample-srcのファイルが圧縮されdistにコピーされます。

```bash
$ ./node_modules/gulp/bin/gulp.js
```

サンプルのgulpfile.jsの説明
----

```js
const gulp = require('gulp');
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
```

- defaultタスク
  - メイン処理です。「サンプルの動かし方」に従って実行すると実行されます。
  - `clean`, `copy`, `minify-css`, `minify-js` の順にタスクを呼び出します。
- cleanタスク
  - 出力先フォルダを削除します。
- copyタスク
  - htmlや画像ファイルなど、js/css以外のファイルもあるので一旦全てコピーしておきます。
- minify-cssタスク
  - 入力フォルダのcssファイルを圧縮して出力先に格納します。コメントと改行が削除されます。
- minify-jsタスク
  - 入力フォルダのjsファイルを圧縮して出力先に格納します（libフォルダは除外する指定をしているので圧縮されません）
  - デフォルトでは未使用変数の除去など、ソースの最適化も行われますので[こちらで](http://lisperator.net/uglifyjs/compress)オプションをご確認ください。
  - デバッグ用にSource Mapを出力していますが本番リリースのビルドでは外すと思います。
- comment-del-jsタスク（おまけ）
  - コメント除去だけしたい場合にminify-jsの代わりにお使いください。
  - 一度Astに変換してからソースコードに戻すため、単純にコメント除去されるだけではないことに注意してください。
    - （ダブルクォートがシングルクォートに置き変わる、ソースが整形される、改行コードはLF固定など）
 
制限事項
----
- 入力ファイルの文字コードはUTF-8であること
- jsの文法エラーがある場合minify-jsタスクでエラーになります

ビルドへの組み込み
----
- antからはbuild.xmlから下記のようにgulpタスクを呼び出しています。参考まで。

```xml:build.xml
<exec executable="node">
  <arg value="node_modules/gulp/bin/gulp.js" />
</exec>
```
