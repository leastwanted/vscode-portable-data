"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReaderHelper = exports.MarkdownParser = void 0;
const TextReader_1 = require("../interfaces/TextReader");
const MarkdownLineParser_1 = require("../impls/MarkdownLineParser");
const MarkdownTableParser_1 = require("../impls/MarkdownTableParser");
const MarkdownRange_1 = require("../interfaces/MarkdownRange");
class MarkdownParser {
    constructor() {
        this.parsers = this.createParsers();
        this.defaultLineParser = this.createDefaultLineParser();
    }
    createParsers() {
        return [
            new MarkdownTableParser_1.MarkdownTableParser()
        ];
    }
    createDefaultLineParser() {
        return new MarkdownLineParser_1.MarkdownLineParser();
    }
    createTextReader(textSource) {
        return new TextReader_1.TextReader(textSource);
    }
    *parse(textSource) {
        let result;
        const textReader = this.createTextReader(textSource);
        while (result = this.nextParse(textReader)) {
            yield result;
        }
    }
    nextParse(textReader) {
        for (let reader of [...this.parsers, this.defaultLineParser]) {
            const rb = textReader.createRollbackable();
            const rf = TextReaderHelper.createRangeFactory(textReader);
            // 解析
            const result = reader.parse(textReader);
            if (result) {
                reader.adjust(textReader);
                const range = rf.create(1);
                if (range.isNext) {
                    result.decision(range);
                    return result;
                }
            }
            rb.rollback();
        }
    }
    findContent(textSource, line) {
        for (let content of this.parse(textSource)) {
            if (content.range.internal(line)) {
                return content;
            }
        }
        return null;
    }
    *findContents(textSource, lines) {
        for (let content of this.parse(textSource)) {
            if (lines.findIndex(t => content.range.internal(t)) !== -1) {
                yield content;
            }
        }
    }
}
exports.MarkdownParser = MarkdownParser;
class TextReaderHelper {
    static createRangeFactory(textReader) {
        const beginPosition = textReader.position;
        return {
            create(s = 0) {
                return new MarkdownRange_1.MarkdownRange(beginPosition + s, textReader.position + s);
            }
        };
    }
}
exports.TextReaderHelper = TextReaderHelper;
//# sourceMappingURL=MarkdownParser.js.map