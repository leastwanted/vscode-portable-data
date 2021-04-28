"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortCommand = void 0;
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class SortCommand extends CommandBaseClasses_1.SortCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        this.sortNumber(cellInfo, this.isAsc);
        focus.format();
        const f = (_a = cellInfo.newCellInfo()) === null || _a === void 0 ? void 0 : _a.getForcus();
        focus.setFocusedCellInfo(f);
    }
    sortNumber(cellInfo, isAsk) {
        const columnIndex = cellInfo.columnIndex;
        const arr = cellInfo.table.rows;
        const nanVals = [];
        for (let i = arr.length - 1; i >= 0; i--) {
            const nbr = this.toNumber(arr[i], columnIndex);
            if (isNaN(nbr)) {
                nanVals.push([i, arr[i]]);
                arr.splice(i, 1);
            }
        }
        arr.sort((a, b) => this.compare(a, b, columnIndex, isAsk));
        nanVals.reverse().forEach(_ => arr.splice(_[0], 0, _[1]));
    }
    compare(a, b, ci, isAsk) {
        const an = this.toNumber(a, ci);
        const bn = this.toNumber(b, ci);
        // TODO: 後で変更。
        return isAsk ? an - bn : bn - an;
    }
    toNumber(row, columnIndex) {
        const cell = row.getCell(columnIndex);
        if (cell) {
            return parseFloat(cell.word);
        }
        return Number.NaN;
    }
}
exports.SortCommand = SortCommand;
//# sourceMappingURL=SortCommand.js.map