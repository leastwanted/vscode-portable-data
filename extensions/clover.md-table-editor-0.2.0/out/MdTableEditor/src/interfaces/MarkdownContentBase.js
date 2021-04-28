"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownContentBase = void 0;
const MarkdownRange_1 = require("./MarkdownRange");
class MarkdownContentBase {
    constructor() {
        this._range = MarkdownRange_1.MarkdownRange.empty;
    }
    get range() {
        return this._range;
    }
    get lineLength() {
        return this._range.length;
    }
    decision(range) {
        this._range = range;
    }
    documentIndexFromContentIndex(contentIndex) {
        return contentIndex + this._range.begin;
    }
    contentIndexFromDocumentIndex(documentIndex) {
        return documentIndex - this._range.begin;
    }
    isContentIndex(contentIndex) {
        return new MarkdownRange_1.MarkdownRange(0, this.lineLength).internal(contentIndex);
    }
}
exports.MarkdownContentBase = MarkdownContentBase;
//# sourceMappingURL=MarkdownContentBase.js.map