/*
 * 5374 setting
 *
*/

var SVGLabel = false; // SVGイメージを使用するときは、true。用意できない場合はfalse。

var MaxDescription = 9; // ごみの最大種類、９を超えない場合は変更の必要はありません。

var MaxMonth = 2;

var WeekShift = true; // 休止期間なら週をずらすときは、true。金沢の仕様は、true。

// テストのために日を指定して実行
var TestDate = null;
//var TestDate = Date.UTC(2015, 12 - 1, 31);

var IsUseArea = false; //収集地区を使うかどうか

// ゴミの分別を index.html に直接書き込みたい場合に設定
// var TargetSettings = null;
var TargetSettings = {
    "燃やせるごみ": "target0",
    "燃やせないごみ": "target1",
    "プラスチック製容器包装": "target2",
    "缶・びん・ペットボトル": "target3",
    "新聞紙": "target4",
    "雑誌・ダンボール・紙パック": "target5"
}


