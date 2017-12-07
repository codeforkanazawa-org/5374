/*
 * 5374 setting
 *
*/

var SVGLabel = true; // SVGイメージを使用するときは、true。用意できない場合はfalse。

var MaxDescription = 9; // ごみの最大種類、９を超えない場合は変更の必要はありません。

var MaxMonth = 3;

var WeekShift = true; // 休止期間なら週をずらすときは、true。金沢の仕様は、true。

var SkipSuspend = true; // 休止期間を除去するときは、true。奈良の仕様は、true。


/**
 * 実行環境がNodeJSかどうかを判定します
 */
var isNode =
  typeof global === 'object' && 
  typeof module === 'object' &&
  typeof require === 'function'

// Node.js環境で5374を使用する時のモジュール設定です
if (isNode) {
  module.exports = {
    SVGLabel,
    MaxDescription,
    MaxMonth,
    WeekShift,
    SkipSuspend
  }
}
