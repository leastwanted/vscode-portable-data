"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteCommentCommand = void 0;
const TableCellCommandBase_1 = require("./TableCellCommandBase");
class DeleteCommentCommand extends TableCellCommandBase_1.TableCellCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return !!this.getCommentRows(cellInfo).length;
    }
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        const rows = this.getCommentRows(cellInfo);
        rows.forEach(_ => _.lastCell ? _.lastCell.word = '' : '');
        focus.format();
        const f = (_a = cellInfo.newCellInfo()) === null || _a === void 0 ? void 0 : _a.getForcus();
        focus.setFocusedCellInfo(f);
    }
    getCommentRows(cellInfo) {
        return cellInfo.table.rows.filter(row => !!row.lastCell);
    }
}
exports.DeleteCommentCommand = DeleteCommentCommand;
//# sourceMappingURL=DeleteCommetCommand.js.map