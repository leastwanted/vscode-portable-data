"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("../utils");
exports.defaultCharset = {
    root: String.fromCharCode(46),
    child: String.fromCharCode(9500),
    last: String.fromCharCode(9492),
    parent: String.fromCharCode(9474),
    dash: String.fromCharCode(9472),
    blank: String.fromCharCode(32),
};
function createTreeString(start, fill, size = 3) {
    let result = '';
    for (let i = 0; i < size; i++) {
        if (i === 0) {
            result += start;
        }
        else {
            result += fill;
        }
    }
    return result + ' ';
}
/** generate tree string */
function generate(items, options = {}) {
    const { eol = utils_1.getUserEOL(), charset = utils_1.getCharCodesFromConfig(), fillLeft = true, } = options;
    let leftSpace = '';
    if (fillLeft) {
        const minLeft = items.length ? Math.min(...items.map(item => item.left || 0)) : 0;
        leftSpace = Array(minLeft).fill(' ').join('');
    }
    const lines = items.map(item => {
        const texts = [];
        texts.push(createTreeString(item.isLast ? charset.last : charset.child, charset.dash));
        let parent = item.parent;
        while (parent) {
            texts.unshift(createTreeString(parent.isLast ? charset.blank : charset.parent, charset.blank));
            parent = parent.parent;
        }
        return leftSpace + texts.join('') + item.name;
    });
    if (charset.root !== '') {
        lines.unshift(leftSpace + charset.root);
    }
    return lines.join(eol);
}
exports.generate = generate;
//# sourceMappingURL=generator.js.map