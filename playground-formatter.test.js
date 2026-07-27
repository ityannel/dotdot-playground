"use strict";

const assert = require("assert");
const { formatDocument: formatInExtension } = require("./vscode-poppop/language-features");
const { formatDocument: formatInPlayground } = require("./poppop-formatter");

const cases = [
  "1>>value.\n[1]>>Map(item):\nitem>>Display.\n..",
  '"a>>b"   >> Display. // >> inside a comment\n',
  "1>>Check(value):\nis value > 0:\n\"yes\".\nelse:\n\"no\".\n..",
  "[1, 2]\r\n    >>Map(value):\r\nvalue*2.\r\n..",
];

for (const source of cases) {
  assert.strictEqual(
    formatInPlayground(source),
    formatInExtension(source),
    `Playground formatter diverged for:\n${source}`,
  );
}

console.log("Playground formatter parity tests passed.");
