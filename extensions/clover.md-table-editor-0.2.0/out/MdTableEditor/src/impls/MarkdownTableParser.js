"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownTableParser = void 0;
const MarkdownTableContent_1 = require("./MarkdownTableContent");
class MarkdownTableParser {
    parse(textReader) {
        if (textReader.moveNext()) {
            const header = MarkdownTableContent_1.MarkdownTableRows.createInstance(textReader.current);
            if (header && textReader.moveNext()) {
                const alignment = MarkdownTableContent_1.MarkdownTableAlignments.createInstance(textReader.current);
                if (alignment && (header.cells.length <= alignment.cells.length)) {
                    const rows = [...this.getRow(textReader, header.cells.length)];
                    return new MarkdownTableContent_1.MarkdownTableContent(header, alignment, rows);
                }
            }
        }
    }
    adjust(textReader) {
        textReader.moveBack();
    }
    *getRow(textReader, limit) {
        while (textReader.moveNext()) {
            const row = MarkdownTableContent_1.MarkdownTableRows.createInstance(textReader.current, limit);
            if (!row) {
                break;
            }
            yield row;
        }
    }
}
exports.MarkdownTableParser = MarkdownTableParser;
//# sourceMappingURL=MarkdownTableParser.js.map