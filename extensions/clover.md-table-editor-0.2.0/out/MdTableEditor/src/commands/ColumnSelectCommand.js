"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColumnSelectCommand = exports.SelectType = void 0;
const MarkdownTableContent_1 = require("../impls/MarkdownTableContent");
const TablePosition_1 = require("../interfaces/TablePosition");
const TableCellCommandBase_1 = require("./TableCellCommandBase");
var SelectType;
(function (SelectType) {
    SelectType[SelectType["None"] = 0] = "None";
    SelectType[SelectType["Empty"] = 1] = "Empty";
    SelectType[SelectType["Full"] = 2] = "Full";
})(SelectType = exports.SelectType || (exports.SelectType = {}));
class ColumnSelectCommand extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, type) {
        super(commandContext);
        this.type = type;
    }
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        const columnIndex = cellInfo.columnIndex;
        const check = (info) => {
            const st = info.cell.empty ? SelectType.Empty : SelectType.Full;
            return (this.type & st) !== 0;
        };
        const selections = cellInfo.table.rows
            .map((v, idx) => MarkdownTableContent_1.TableCellInfo.createInstanceFromTablePosition(cellInfo.table, new TablePosition_1.TablePosition(idx, columnIndex)))
            .filter(_ => !!_ && check(_))
            .map(_ => _.getWordSelection());
        focus.setFocusedCellInfo(...selections);
    }
}
exports.ColumnSelectCommand = ColumnSelectCommand;
//# sourceMappingURL=ColumnSelectCommand.js.map