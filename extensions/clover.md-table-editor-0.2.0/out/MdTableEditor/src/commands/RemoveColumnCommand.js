"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveColumnCommand = void 0;
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class RemoveColumnCommand extends CommandBaseClasses_1.RemoveCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        for (const row of cellInfo.table) {
            row.cells.splice(cellInfo.columnIndex, 1);
        }
        focus.format();
        const bef = cellInfo.befCellInfo();
        if (bef) {
            focus.setFocusedCellInfo(((_a = bef.newCellInfo(0)) === null || _a === void 0 ? void 0 : _a.getForcus()) || (bef === null || bef === void 0 ? void 0 : bef.getForcus()));
        }
    }
}
exports.RemoveColumnCommand = RemoveColumnCommand;
//# sourceMappingURL=RemoveColumnCommand.js.map