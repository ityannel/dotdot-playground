"use strict";

const assert = require("node:assert/strict");
const { errorLine, localizeError } = require("./poppop-localization.js");

assert.equal(
  localizeError("NameError: Variable 'missing' is not defined."),
  "名前エラー: 変数「missing」は定義されていません。",
);
assert.equal(
  localizeError("SyntaxError: Unexpected character '!' on line 2"),
  "文法エラー: 使用できない文字 '!' があります。（2行目）",
);
assert.equal(
  localizeError("EvaluatorError: Filter block must return Bool"),
  "評価エラー: Filter のブロックは Bool を返す必要があります。",
);
assert.equal(errorLine("ParseError: something at line 14"), 14);

console.log("Playground Japanese localization tests passed.");
