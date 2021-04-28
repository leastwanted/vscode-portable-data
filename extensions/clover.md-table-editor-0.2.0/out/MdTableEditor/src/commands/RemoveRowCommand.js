"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveRowCommand = void 0;
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class RemoveRowCommand extends CommandBaseClasses_1.RemoveCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return this.getInfo(cellInfo) !== undefined;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        const removeRowIndex = this.getInfo(cellInfo);
        cellInfo.table.rows.splice(removeRowIndex, 1);
        focus.format();
        const bef = cellInfo.befCellInfo();
        if (bef) {
            focus.setFocusedCellInfo(((_a = bef.newCellInfo(0)) === null || _a === void 0 ? void 0 : _a.getForcus()) || (bef === null || bef === void 0 ? void 0 : bef.getForcus()));
        }
    }
    getInfo(cellInfo) {
        if (cellInfo.table.isRow(cellInfo.rowIndex)) {
            return cellInfo.rowIndex;
        }
    }
}
exports.RemoveRowCommand = RemoveRowCommand;
//# sourceMappingURL=RemoveRowCommand.js.map