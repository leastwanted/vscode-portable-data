"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeAlignmentCommand = void 0;
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class ChangeAlignmentCommand extends CommandBaseClasses_1.ChangeAlignmentCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return !!this.getAlignmentCell(cellInfo);
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        const ac = this.getAlignmentCell(cellInfo);
        if (ac) {
            ac.updateAlign(this.align);
            const rp = cellInfo.relativeCursorInnerPosition;
            focus.format();
            const f = (_a = cellInfo.newCellInfo(rp)) === null || _a === void 0 ? void 0 : _a.getForcus();
            focus.setFocusedCellInfo(f);
        }
    }
    getAlignmentCell(cellInfo) {
        return cellInfo.table.alignments.cells[cellInfo.columnIndex];
    }
}
exports.ChangeAlignmentCommand = ChangeAlignmentCommand;
//# sourceMappingURL=ChangeAlignmentCommand.js.map