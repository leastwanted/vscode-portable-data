"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSortCommand = void 0;
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class TextSortCommand extends CommandBaseClasses_1.TextSortCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        this.sortText(cellInfo);
        focus.format();
        focus.setFocusedCellInfo((_a = cellInfo.newCellInfo()) === null || _a === void 0 ? void 0 : _a.getForcus());
    }
    sortText(cellInfo) {
        const columnIndex = cellInfo.columnIndex;
        const arr = cellInfo.table.rows;
        const nanVals = [];
        for (let i = arr.length - 1; i >= 0; i--) {
            const nbr = this.getStr(arr[i], columnIndex);
            if (nbr === undefined) {
                nanVals.push([i, arr[i]]);
                arr.splice(i, 1);
            }
        }
        arr.sort((a, b) => this.compare(a, b, columnIndex));
        nanVals.reverse().forEach(_ => arr.splice(_[0], 0, _[1]));
    }
    compare(a, b, ci) {
        const ob = this.isAsc ? -1 : 1;
        let sa = this.getStr(a, ci);
        let sb = this.getStr(b, ci);
        if (this.ignoreCase) {
            sa = sa.toUpperCase();
            sb = sb.toUpperCase();
        }
        return sa < sb ? ob : sa > sb ? -ob : 0;
    }
    getStr(r, ci) {
        const c = r.getCell(ci);
        if (c) {
            return c.word.trim();
        }
        return "";
    }
}
exports.TextSortCommand = TextSortCommand;
//# sourceMappingURL=TextSortCommand.js.map