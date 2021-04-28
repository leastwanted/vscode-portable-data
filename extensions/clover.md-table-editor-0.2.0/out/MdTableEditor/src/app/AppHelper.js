"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppHelper = void 0;
const MarkdownParser_1 = require("./MarkdownParser");
const MarkdownTableContent_1 = require("../impls/MarkdownTableContent");
const MarkdownTableConverter_1 = require("../impls/MarkdownTableConverter");
const TextReader_1 = require("../interfaces/TextReader");
class AppHelper {
    constructor(appContext) {
        this.appContext = appContext;
    }
    getTable(pos) {
        const ts = this.appContext.getTextSource();
        pos = pos || this.appContext.getCursor();
        if (ts && pos) {
            const parser = new MarkdownParser_1.MarkdownParser();
            const content = parser.findContent(ts, pos.docIndex);
            if (content instanceof MarkdownTableContent_1.MarkdownTableContent) {
                return content;
            }
        }
    }
    getTableContents() {
        const ts = this.appContext.getTextSource();
        if (ts) {
            const parser = new MarkdownParser_1.MarkdownParser();
            return [...parser.parse(ts)].filter(_ => _ instanceof MarkdownTableContent_1.MarkdownTableContent);
        }
        return [];
    }
    formatTable(table) {
        return MarkdownTableConverter_1.MarkdownTableConverter.format(table);
    }
    getDocumentText(range) {
        const ts = this.appContext.getTextSource();
        if (ts) {
            const tr = new TextReader_1.TextReader(ts);
            return tr.getText(range.begin, range.end).join(this.appContext.getAppConfig().returnKey());
        }
    }
}
exports.AppHelper = AppHelper;
//# sourceMappingURL=AppHelper.js.map