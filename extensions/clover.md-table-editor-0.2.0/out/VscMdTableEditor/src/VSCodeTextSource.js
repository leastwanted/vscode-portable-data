"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VSCodeTextSource = void 0;
class VSCodeTextSource {
    constructor(document) {
        this.document = document;
    }
    lineAt(index) {
        const range = this.document.lineAt(index).range;
        return this.document.getText(range);
    }
    hasLine(index) {
        return index >= 0 && index < this.document.lineCount;
    }
}
exports.VSCodeTextSource = VSCodeTextSource;
//# sourceMappingURL=VSCodeTextSource.js.map