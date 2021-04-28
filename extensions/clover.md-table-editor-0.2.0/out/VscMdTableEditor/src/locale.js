"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.locale = void 0;
const vscode = require("vscode");
const ps = {
    'ja': '../../../package.nls.ja.json'
}[vscode.env.language] || '';
let loc = {}, ori = {};
try {
    loc = require(ps);
}
catch (err) {
    console.log(err);
}
try {
    ori = require('../../../package.nls.json');
}
catch (err) {
    console.log(err);
}
function locale(name, ...args) {
    const msg = loc[name] || ori[name] || name;
    let cnt = 0;
    return msg.replace(/%s/g, () => args[cnt++] || '');
}
exports.locale = locale;
//# sourceMappingURL=locale.js.map