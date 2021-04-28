"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownLineParser = void 0;
const MarkdownLineContent_1 = require("./MarkdownLineContent");
class MarkdownLineParser {
    parse(textReader) {
        if (textReader.moveNext()) {
            return new MarkdownLineContent_1.MarkdownLineContent(textReader.current);
        }
    }
    adjust(textReader) {
    }
}
exports.MarkdownLineParser = MarkdownLineParser;
//# sourceMappingURL=MarkdownLineParser.js.map