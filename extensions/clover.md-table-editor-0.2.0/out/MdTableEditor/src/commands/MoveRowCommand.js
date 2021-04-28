"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveRowCommand = void 0;
const ICollectionMovable_1 = require("../interfaces/ICollectionMovable");
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class MoveRowCommand extends CommandBaseClasses_1.MoveCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return this.getTargetRowIndex(cellInfo) !== undefined;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        const itemRowIndex = cellInfo.rowIndex;
        const targetRowIndex = this.getTargetRowIndex(cellInfo);
        const ba = this.getInsertLine(this.isBefore);
        new ICollectionMovable_1.MovableArray(cellInfo.table.rows).move(targetRowIndex, [itemRowIndex], ba);
        const f = (_a = cellInfo.newCellInfo()) === null || _a === void 0 ? void 0 : _a.getForcus();
        focus.setFocusedCellInfo(f);
    }
    getTargetRowIndex(cellInfo) {
        const targetRowIndex = cellInfo.tablePosition.add(this.getMoveRowDirection(this.isBefore)).rowIndex;
        if (cellInfo.table.isRow(targetRowIndex)) {
            return targetRowIndex;
        }
    }
    isRowOnly() {
        return true;
    }
}
exports.MoveRowCommand = MoveRowCommand;
//# sourceMappingURL=MoveRowCommand.js.map