"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellInfoHelper = exports.TableCellCommandBase = void 0;
const MarkdownTableContent_1 = require("../impls/MarkdownTableContent");
const MarkdownTableConverter_1 = require("../impls/MarkdownTableConverter");
const TablePosition_1 = require("../interfaces/TablePosition");
const TableCommandBase_1 = require("./TableCommandBase");
class FormattableParameter {
    constructor(table, context) {
        this.table = table;
        this.context = context;
        this._focus = [];
        this._formatted = false;
    }
    get focus() {
        return this._focus;
    }
    get isUpdated() {
        return !!this._focus || this._formatted;
    }
    // #region IFormattableParameter の実装
    setFocusedCellInfo(...focus) {
        this._focus = (focus || []).filter(_ => !!_);
    }
    format() {
        this.context.formatter.format(this.table);
        this._formatted = true;
    }
    // #endregion IFormattableParameter の実装終わり
    exec() {
        const table = this.table;
        const txt = this.context.renderer.toDataType(table);
        this.context.methods.replace(table.range, txt);
        if (this.focus.length) {
            this.context.methods.select(...this.focus);
        }
    }
}
/**
 * セル上で成り立つコマンドの基底クラスを表します。
 * move系、insert系などはセル上にカーソルがあることが前提で実行するコマンドです。
 * 逆に、フォーマット系などはセル上にある必要はありません。例えばfirstCell/lastCell上でも実行できるタイプのコマンドです。
 */
class TableCellCommandBase extends TableCommandBase_1.TableCommandBase {
    constructor(commandContext) {
        super(commandContext);
        this.commandContext = commandContext;
    }
    getCellInfo() {
        const pos = this.appContext.getCursor();
        const table = this.commandContext.getTable();
        if (table && pos) {
            return table.getCellInfo(pos);
        }
    }
    // final
    canExecuteGeneric(parameter) {
        const cellInfo = this.getCellInfo();
        if (cellInfo) {
            if (this.checkIsRowOnly(cellInfo)) {
                return this.canExecuteOverride(cellInfo, parameter);
            }
        }
        return false;
    }
    // final
    executeGeneric(parameter) {
        const cellInfo = this.getCellInfo();
        if (cellInfo) {
            const formatContext = this.commandContext.getFormatterContext();
            const focusParameter = new FormattableParameter(cellInfo.table, formatContext);
            this.executeOverride(cellInfo, parameter, focusParameter);
            focusParameter.exec();
        }
    }
    /**
     * この実行条件がヘッダを覗く行のみを対象とする場合にtrueを返します。
     * 行の移動や追加などでtrueを返します。
     */
    isRowOnly() {
        return false;
    }
    checkIsRowOnly(cellInfo) {
        return !this.isRowOnly() || cellInfo.isRow();
    }
    get defaultRenderMode() {
        return MarkdownTableConverter_1.MarkdownTableRenderMode.Beautiful;
    }
    getInsertColumnDirection(isBefore) {
        return new TablePosition_1.TablePosition(0, isBefore ? 0 : 1);
    }
    getInsertRowDirection(isBefore) {
        return new TablePosition_1.TablePosition(isBefore ? 0 : 1, 0);
    }
    getMoveColumnDirection(isBefore) {
        return new TablePosition_1.TablePosition(0, isBefore ? -1 : 1);
    }
    getMoveRowDirection(isBefore) {
        return new TablePosition_1.TablePosition(isBefore ? -1 : 1, 0);
    }
    getColumnCell(cellInfo, isBefore) {
        return cellInfo.getCellFromRelative(this.getInsertColumnDirection(isBefore));
    }
    getRowCell(cellInfo, isBefore) {
        return cellInfo.getCellFromRelative(this.getInsertRowDirection(isBefore));
    }
    getInsertLine(isBefore) {
        return isBefore ? MarkdownTableContent_1.TablePositionDirections.before : MarkdownTableContent_1.TablePositionDirections.after;
    }
}
exports.TableCellCommandBase = TableCellCommandBase;
class CellInfoHelper {
    static getColumn(cellInfo) {
        const table = cellInfo.table;
        const columnIndex = cellInfo.columnIndex;
        const infos = [];
        for (let i = 0; i < table.rowLength; i++) {
            infos.push(MarkdownTableContent_1.TableCellInfo.createInstanceFromTablePosition(table, new TablePosition_1.TablePosition(i, columnIndex)));
        }
        return {
            cellInfos: infos,
            hasAll: infos.some(_ => _ === undefined),
        };
    }
    static createRow(constructor, length, cellFactory) {
        const firstCell = new MarkdownTableContent_1.TableCell('');
        const lastCell = new MarkdownTableContent_1.TableCell('');
        const cells = 'a'.repeat(length).split('').map(_ => cellFactory());
        return new constructor(cells, firstCell, lastCell);
    }
    static fillCells(row, pos, cellFactory) {
        while (row.cells.length < pos) {
            row.cells.push(cellFactory());
        }
    }
    static insertCell(row, pos, cellFactory) {
        row.cells.splice(pos, 0, cellFactory());
    }
}
exports.CellInfoHelper = CellInfoHelper;
//# sourceMappingURL=TableCellCommandBase.js.map