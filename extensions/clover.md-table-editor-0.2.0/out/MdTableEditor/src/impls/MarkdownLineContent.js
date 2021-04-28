"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownLineContent = void 0;
const MarkdownContentBase_1 = require("../interfaces/MarkdownContentBase");
class MarkdownLineContent extends MarkdownContentBase_1.MarkdownContentBase {
    constructor(text) {
        super();
        this.text = text;
    }
    toString() {
        return this.text;
    }
}
exports.MarkdownLineContent = MarkdownLineContent;
//# sourceMappingURL=MarkdownLineContent.js.map