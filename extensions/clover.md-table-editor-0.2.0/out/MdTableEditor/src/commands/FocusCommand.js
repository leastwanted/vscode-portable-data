"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusCommand = void 0;
const CommandBaseClasses_1 = require("./CommandBaseClasses");
const Direction_1 = require("../interfaces/Direction");
const TablePosition_1 = require("../interfaces/TablePosition");
class FocusCommand extends CommandBaseClasses_1.FocusCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
        // TODO: メニューバーとの問題がありどうするか検討中。
        const nextCellInfo = this.getNextCellInfo(cellInfo);
        return !!nextCellInfo;
    }
    executeOverride(cellInfo, parameter, focus) {
        let targetCellInfo = this.getNextCellInfo(cellInfo);
        if (targetCellInfo) {
            targetCellInfo = targetCellInfo.newCellInfo(0);
            const f = targetCellInfo === null || targetCellInfo === void 0 ? void 0 : targetCellInfo.getWordSelection();
            focus.setFocusedCellInfo(f);
        }
    }
    getNextCellInfo(cellInfo) {
        const colIndex = cellInfo.columnIndex;
        const rowIndex = cellInfo.rowIndex;
        let currentCell = cellInfo;
        // 左移動(ワープ)
        if (this.direction === Direction_1.Direction.Left) {
            if (colIndex > 0) {
                return currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Left);
            }
            currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Top);
            if (rowIndex === 0) {
                currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Top);
            }
            const lastColIndex = Math.max(0, ((currentCell === null || currentCell === void 0 ? void 0 : currentCell.rowCellsLength) || 0) - 1);
            return currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromRelative(new TablePosition_1.TablePosition(0, lastColIndex));
        }
        // 右移動(ワープ)
        if (this.direction === Direction_1.Direction.Right) {
            const lastColIndex = cellInfo.rowCellsLength - 1 || 0;
            if (colIndex < lastColIndex) {
                return currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Right);
            }
            currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromAbsolute(cellInfo.tablePosition.setColumnIndex(0));
            currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Bottom);
            if (rowIndex === -2) {
                currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Bottom);
            }
            return currentCell;
        }
        if (this.direction === Direction_1.Direction.Top) {
            currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Top);
            if (rowIndex === 0) {
                currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Top);
            }
            return currentCell;
        }
        if (this.direction === Direction_1.Direction.Bottom) {
            currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Bottom);
            if (rowIndex === -2) {
                currentCell = currentCell === null || currentCell === void 0 ? void 0 : currentCell.getCellFromDirection(Direction_1.Direction.Bottom);
            }
            return currentCell;
        }
    }
    isRowOnly() {
        return false;
    }
}
exports.FocusCommand = FocusCommand;
//# sourceMappingURL=FocusCommand.js.map