"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FillCellsCommand = void 0;
const TableCellCommandBase_1 = require("./TableCellCommandBase");
const MarkdownTableContent_1 = require("../impls/MarkdownTableContent");
// fillCells()のパラメータを取得するよう変更。
class FillCellsCommand extends TableCellCommandBase_1.TableCellCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        FillCellsCommand.fillCells(cellInfo.table);
        focus.setFocusedCellInfo(cellInfo === null || cellInfo === void 0 ? void 0 : cellInfo.getForcus());
        focus.format();
    }
    /**
     * 穴あき状態のセルを埋めます。
     * @param insertCellWords
     * @param
     */
    static fillCells(table, insertCellWords = (r, c) => '') {
        const width = table.columnLength;
        for (const [idx, row] of table.rows.entries()) {
            while (row.cells.length < width) {
                row.cells.push(new MarkdownTableContent_1.TableCell(insertCellWords(idx, row.cells.length)));
            }
        }
    }
}
exports.FillCellsCommand = FillCellsCommand;
//# sourceMappingURL=FillCellsCommand.js.map