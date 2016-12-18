// 日本語のコメント
/**
 * hoge
 */
function hoge() {
    // a
    // b
    // c
    var s = "hello";
    if (s == "hello") {
        s = s += "world";  // world add
    } else {
        s = "hello japan";
    }
    console.log(/* output s */s);
}

hoge();
