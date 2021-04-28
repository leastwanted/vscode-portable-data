"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InsertColumnCommand = void 0;
const TableCellCommandBase_1 = require("./TableCellCommandBase");
const MarkdownTableContent_1 = require("../impls/MarkdownTableContent");
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class InsertColumnCommand extends CommandBaseClasses_1.InsertCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        for (const row of cellInfo.table) {
            if (row.hasCell(cellInfo.columnIndex)) {
                const factory = row instanceof MarkdownTableContent_1.MarkdownTableAlignments ?
                    () => MarkdownTableContent_1.TableAlignmentCell.createCellFromWAlignWord('---') :
                    () => new MarkdownTableContent_1.TableCell('');
                const ba = cellInfo.tablePosition.add(this.getInsertColumnDirection(this.isBefore)).columnIndex;
                TableCellCommandBase_1.CellInfoHelper.insertCell(row, ba, factory);
            }
        }
        focus.format();
        const f = (_a = cellInfo.newCellInfo()) === null || _a === void 0 ? void 0 : _a.getForcus();
        focus.setFocusedCellInfo(f);
    }
}
exports.InsertColumnCommand = InsertColumnCommand;
//# sourceMappingURL=InsertColumnCommand.js.map