"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertRowCommand = void 0;
const TableCellCommandBase_1 = require("./TableCellCommandBase");
const MarkdownTableContent_1 = require("../impls/MarkdownTableContent");
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class InsertRowCommand extends CommandBaseClasses_1.InsertCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        const table = cellInfo.table;
        const insertRowIndex = cellInfo.tablePosition.add(this.getInsertRowDirection(this.isBefore)).rowIndex;
        const insertRow = TableCellCommandBase_1.CellInfoHelper.createRow(MarkdownTableContent_1.MarkdownTableRows, table.columnLength, () => new MarkdownTableContent_1.TableCell(''));
        table.rows.splice(insertRowIndex, 0, insertRow);
        // フォーマット
        focus.format();
        // フォーカスは自身
        const f = (_a = cellInfo.newCellInfo()) === null || _a === void 0 ? void 0 : _a.getForcus();
        focus.setFocusedCellInfo(f);
    }
    isRowOnly() {
        return true;
    }
}
exports.InsertRowCommand = InsertRowCommand;
//# sourceMappingURL=InsertRowCommand.js.map