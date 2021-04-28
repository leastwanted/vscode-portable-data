"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatterContext = void 0;
const MarkdownTableConverter_1 = require("../impls/MarkdownTableConverter");
class FormatterContext {
    constructor() {
        this.formatter = MarkdownTableConverter_1.MarkdownTableFormatter.createInstance();
        this.renderer = new MarkdownTableConverter_1.MarkdownTableConverter(MarkdownTableConverter_1.MarkdownTableRenderMode.Beautiful);
    }
}
exports.FormatterContext = FormatterContext;
//# sourceMappingURL=FormatterContext.js.map