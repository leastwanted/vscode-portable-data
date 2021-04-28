"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MoveColumnCommand = void 0;
const TableCellCommandBase_1 = require("./TableCellCommandBase");
const MarkdownTableContent_1 = require("../impls/MarkdownTableContent");
const ICollectionMovable_1 = require("../interfaces/ICollectionMovable");
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class MoveColumnCommand extends CommandBaseClasses_1.MoveCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return !!this.getTargetHeaderCell(cellInfo);
    }
    /**
     * |A|B|C|   .1
     * |A|B|     .2
     * |A|       .3
     *
     * index 1を左右に移動した場合のパターン。
     *
     * .2   left 1         〇                 |A|B|   -> |B|A|
     * .2   right 1        addCell(2) -> 〇   |A|B| | -> |A| |B|
     * .1   left 1         addCell(1) -> 〇   |A| |   -> | |A|
     * .1   right 1        ×
     *
     * addCell(セルを埋める位置)でセル埋めし、そのうえで移動を実行する。
     *
     * @param cellInfo
     * @param parameter
     */
    executeOverride(cellInfo, parameter, focus) {
        var _a;
        const targetHeaderPos = this.getTargetHeaderCell(cellInfo);
        const itemColumnIndex = cellInfo.columnIndex;
        const targetColumnIndex = targetHeaderPos.columnIndex;
        for (const row of cellInfo.table) {
            const itemCell = row.getCell(itemColumnIndex);
            const targetCell = row.getCell(targetColumnIndex);
            // 対象位置までセルを埋める。
            if (!(itemCell || targetCell)) {
                const fillIndex = Math.max(itemColumnIndex, targetColumnIndex);
                TableCellCommandBase_1.CellInfoHelper.fillCells(row, fillIndex, () => new MarkdownTableContent_1.TableCell(''));
            }
            // 移動させます。
            const ba = this.getInsertLine(this.isBefore);
            const movable = new ICollectionMovable_1.MovableArray(row.cells);
            movable.move(targetColumnIndex, [itemColumnIndex], ba);
        }
        focus.setFocusedCellInfo((_a = cellInfo.newCellInfo()) === null || _a === void 0 ? void 0 : _a.getForcus());
    }
    getTargetHeaderCell(cellInfo) {
        const cellPos = cellInfo.tablePosition;
        const targetHeaderPos = cellPos.add(this.getMoveColumnDirection(this.isBefore)).setRowIndex(-2);
        return cellInfo.getCellFromAbsolute(targetHeaderPos);
    }
}
exports.MoveColumnCommand = MoveColumnCommand;
//# sourceMappingURL=MoveColumnCommand.js.map