"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandContext = void 0;
class CommandContext {
    constructor(appContext, formatterContext, cache) {
        this.appContext = appContext;
        this.formatterContext = formatterContext;
        this.cache = cache;
    }
    getFormatterContext() {
        return this.formatterContext;
    }
    getCellInfoFromTable() {
        const pos = this.appContext.getCursor();
        const table = this.cache.cachedItem;
        if (table && pos) {
            return table.getCellInfo(pos);
        }
    }
}
exports.CommandContext = CommandContext;
//# sourceMappingURL=CommandContext.js.map