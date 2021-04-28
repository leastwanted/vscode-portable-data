"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollCommand = void 0;
const MarkdownRange_1 = require("../interfaces/MarkdownRange");
const TableCommandBase_1 = require("./TableCommandBase");
/**
 * isIndexがtrueの時、テーブルがparameter個目(0から数えて)へ、falseの時はドキュメントインデックスにあるテーブルへ移動します。
 */
class ScrollCommand extends TableCommandBase_1.TableCommandBase {
    constructor(commandContext, isIndex = true) {
        super(commandContext);
        this.isIndex = isIndex;
    }
    executeGeneric(parameter) {
        const table = this.getTargetTable(parameter);
        if (table) {
            const pos = Math.floor((table.range.begin + table.range.end) / 2);
            this.commandContext.appContext.scroll(pos);
            this.commandContext.getFormatterContext().methods.select({
                sPos: {
                    docIndex: table.range.begin,
                    charIndex: 0
                }
            });
        }
    }
    canExecuteGeneric(parameter) {
        return !!this.getTargetTable(parameter);
    }
    getTargetTable(parameter) {
        let tables = undefined;
        if (this.isIndex) {
            tables = this.appHelper.getTableContents();
            if (new MarkdownRange_1.MarkdownRange(0, tables.length).internal(parameter)) {
                return tables[parameter];
            }
        }
        else {
            tables = tables || this.appHelper.getTableContents();
            return tables.find(_ => _.range.internal(parameter));
        }
    }
}
exports.ScrollCommand = ScrollCommand;
//# sourceMappingURL=ScrollCommand.js.map