"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarkdownTableAlignments = exports.MarkdownTableRows = exports.TableRowBase = exports.CellRangeInfo = exports.TableAlignmentCell = exports.TableCell = exports.TableCellInfo = exports.MarkdownTableContent = exports.TablePositionDirections = void 0;
const MarkdownContentBase_1 = require("../interfaces/MarkdownContentBase");
const MarkdownRange_1 = require("../interfaces/MarkdownRange");
const MarkdownAlignments_1 = require("../interfaces/MarkdownAlignments");
const Direction_1 = require("../interfaces/Direction");
const TablePosition_1 = require("../interfaces/TablePosition");
class TablePositionDirections {
    static getPositionFromDirection(direction) {
        switch (direction) {
            case Direction_1.Direction.Top: return this.top;
            case Direction_1.Direction.Bottom: return this.bottom;
            case Direction_1.Direction.Right: return this.right;
            case Direction_1.Direction.Left: return this.left;
        }
    }
}
exports.TablePositionDirections = TablePositionDirections;
TablePositionDirections.top = new TablePosition_1.TablePosition(-1, 0);
TablePositionDirections.bottom = new TablePosition_1.TablePosition(1, 0);
TablePositionDirections.left = new TablePosition_1.TablePosition(0, -1);
TablePositionDirections.right = new TablePosition_1.TablePosition(0, 1);
TablePositionDirections.before = 0;
TablePositionDirections.after = 1;
class MarkdownTableContent extends MarkdownContentBase_1.MarkdownContentBase {
    constructor(headers, alignments, rows) {
        super();
        this.headers = headers;
        this.alignments = alignments;
        this.rows = rows;
    }
    get columnLength() {
        return this.headers.cellLength;
    }
    get rowLength() {
        return this.rows.length;
    }
    get tableRowLength() {
        return this.rows.length + 2;
    }
    *[Symbol.iterator]() {
        yield this.headers;
        yield this.alignments;
        yield* this.rows;
    }
    /**
     * ヘッダを含まない行であるかをチェックします。
     * @param rowIndex
     */
    isRow(rowIndex) {
        return rowIndex >= 0 && this.isTableRow(rowIndex);
    }
    /**
     * ヘッダ含む行であるかをチェックします。
     * @param tableRowIndex -2からrowLength未満の値。
     */
    isTableRow(tableRowIndex) {
        return new MarkdownRange_1.MarkdownRange(-2, this.rows.length).internal(tableRowIndex);
    }
    /**
     * ヘッダを含む行番号に変換して取得します。
     * ヘッダ行は-2, アライメント行は-1になります。
     * 範囲を超える値も変換されるので使用する際は範囲のチェックが必要です。
     * @param docIndex ドキュメント上の行番号
     */
    getTableRowIndex(docIndex) {
        return super.contentIndexFromDocumentIndex(docIndex) - 2;
    }
    /**
     * ドキュメントレベルのポジションをテーブルレベルのポジションに変換します。
     * @param docPosition
     */
    toTablePosition(docPosition) {
        const tableRowIndex = this.getTableRowIndex(docPosition.docIndex);
        const tableRow = this.getTableRow(tableRowIndex);
        if (tableRow) {
            const cellInfo = tableRow.getCellRangeFromCharacterIndex(docPosition.charIndex);
            if (cellInfo) {
                return new TablePosition_1.TablePosition(tableRowIndex, cellInfo.columnIndex);
            }
        }
    }
    toDocumentPosition(tablePosition) {
        const row = this.getTableRow(tablePosition.rowIndex);
        if (row) {
            const cellInfo = row.getCellRangeFromColumnIndex(tablePosition.columnIndex);
            if (cellInfo) {
                return {
                    docIndex: this.documentIndexFromContentIndex(tablePosition.rowIndex + 2),
                    charIndex: cellInfo.range.begin
                };
            }
        }
    }
    /**
     * 行を安全に取得します。取得できない場合はundefinedが返ります。
     * @param tableRowIndex
     */
    getTableRow(tableRowIndex) {
        if (this.isTableRow(tableRowIndex)) {
            return [...this][tableRowIndex + 2];
        }
    }
    /**
     * セル(及び行)を安全に取得します。
     * 厳密に見つからなければundefinedを返します。
     */
    getCell(tableRowIndex, columnIndex) {
        const tableRow = this.getTableRow(tableRowIndex);
        if (tableRow) {
            const cell = tableRow.getCell(columnIndex);
            if (cell) {
                return {
                    row: tableRow,
                    cell: cell
                };
            }
        }
    }
    /**
     * セル(ヘッダも含む)からポジションを取得します。
     * @param cell
     */
    getTablePosition(cell) {
        for (const [index, row] of [...this].entries()) {
            const clmIndex = row.cells.indexOf(cell);
            if (clmIndex !== -1) {
                return new TablePosition_1.TablePosition(index - 2, clmIndex);
            }
        }
    }
    *getVerticalTableRows(columnIndex, all = true) {
        if (new MarkdownRange_1.MarkdownRange(0, this.columnLength).internal(columnIndex)) {
            for (const row of this.rows) {
                if (row.cellLength > columnIndex) {
                    yield {
                        row: row,
                        cell: row.cells[columnIndex]
                    };
                }
                else {
                    if (all) {
                        yield undefined;
                    }
                }
            }
        }
    }
    *getVerticalOnlyTableRows(column) {
        yield* this.getVerticalTableRows(column, false);
    }
    /**
     * 安全にセル情報を取得します。
     */
    getCellInfo(docPosition) {
        return TableCellInfo.createInstance(this, docPosition);
    }
}
exports.MarkdownTableContent = MarkdownTableContent;
class TableCellInfo {
    constructor(table, row, docPosition, tablePosition, cellInfo) {
        this.table = table;
        this.row = row;
        this.docPosition = docPosition;
        this.tablePosition = tablePosition;
        this.cellInfo = cellInfo;
        TableCellInfo.count();
        this.serial = TableCellInfo.cnt;
    }
    static count() {
        this.cnt++;
    }
    isRow() {
        return this.table.isRow(this.rowIndex);
    }
    get docIndex() {
        return this.docPosition.docIndex;
    }
    get charIndex() {
        return this.docPosition.charIndex;
    }
    get rowIndex() {
        return this.tablePosition.rowIndex;
    }
    get columnIndex() {
        return this.tablePosition.columnIndex;
    }
    get cellRange() {
        return this.cellInfo.range;
    }
    get cell() {
        return this.cellInfo.cell;
    }
    /**
     * 空白を含む文字列からの、トリミング文字列先頭位置。
     * '   abc  ' = 3
     */
    get wordInnerPosition() {
        const word = this.cellInfo.cell.word;
        // TODO: strCount
        return word.indexOf(word.trim());
    }
    /**
     * 空白を含む文字列先頭からの選択位置。
     * '   ab|c' = 5
     */
    get cursorInnerPosition() {
        return this.docPosition.charIndex - this.cellRange.begin;
    }
    /**
     * トリミング文字列先頭からの相対的な選択位置。
     *
     * '   ab|c' = 2
     */
    get relativeCursorInnerPosition() {
        return this.cursorInnerPosition - this.wordInnerPosition;
    }
    /**
     * 相対位置を元に文字列先頭からの位置を取得します。範囲を超えていた場合は調整されます。
     * @param relativeCursorInnerPosition
     */
    getPosFromRelativeCursorPosition(relativeCursorInnerPosition) {
        return new MarkdownRange_1.MarkdownRange(0, this.cellRange.length).adjust(relativeCursorInnerPosition + this.wordInnerPosition);
    }
    /**
     * 相対位置からのDocIndexを取得します。
     * @param relativeCursorInnerPosition
     */
    getDocCharIndex(relativeCursorInnerPosition) {
        const rp = this.getPosFromRelativeCursorPosition(relativeCursorInnerPosition);
        return this.cellRange.begin + rp;
    }
    /**
     * 行のセル数を返します。table.columnLengthはヘッダのセル数であることに注意してください。
     */
    get rowCellsLength() {
        return this.row.cellLength;
    }
    static createInstance(table, docPosition) {
        const tableRowIndex = table.getTableRowIndex(docPosition.docIndex);
        const tableRow = table.getTableRow(tableRowIndex);
        if (tableRow) {
            const cellInfo = tableRow.getCellRangeFromCharacterIndex(docPosition.charIndex);
            if (cellInfo) {
                const tablePosition = new TablePosition_1.TablePosition(tableRowIndex, cellInfo.columnIndex);
                return new TableCellInfo(table, tableRow, docPosition, tablePosition, cellInfo);
            }
        }
    }
    /**
     * tablePositionからTableCellInfoを作成しますが、カーソル位置は捨てられて０になります。
     * 理由は、tablePositionをdocPositionに変換後、docPosition.charIndexにカーソル分を足してcreateInstance()を呼び出すと、tablePositionの範囲を超える(他のセルを取得してしまう)可能性があるからです。
     * カーソル分が必要な場合はcreateInstanceFromTablePositionAndCursor()を使用してください。
     * @param table
     * @param tablePosition
     */
    static createInstanceFromTablePosition(table, tablePosition) {
        const row = table.getTableRow(tablePosition.rowIndex);
        if (row) {
            const cellInfo = row.getCellRangeFromColumnIndex(tablePosition.columnIndex);
            if (cellInfo) {
                const docPosition = {
                    docIndex: table.documentIndexFromContentIndex(tablePosition.rowIndex + 2),
                    charIndex: cellInfo.range.begin
                };
                return this.createInstance(table, docPosition);
            }
        }
    }
    /**
     * relativeCursorPosition
     * @param table
     * @param tablePosition
     * @param relativeCursorPosition
     */
    static createInstanceFromTablePositionAndCursor(table, tablePosition, relativeCursorPosition) {
        const ci = this.createInstanceFromTablePosition(table, tablePosition);
        if (ci) {
            const rp = ci.getDocCharIndex(relativeCursorPosition);
            const docPos = { docIndex: ci.docIndex, charIndex: rp };
            return new TableCellInfo(table, ci.row, docPos, ci.tablePosition, ci.cellInfo);
        }
    }
    /**
     * 現在のセルのインスタンスから新たなセル情報を取得します。
     * セルの状態が変更した時などに再取得します。
     * @param newRelativeCursorPosition 相対カーソル位置を更新する場合は指定します。
     */
    newCellInfo(newRelativeCursorPosition = this.relativeCursorInnerPosition) {
        const pos = this.table.getTablePosition(this.cell);
        if (pos) {
            return TableCellInfo.createInstanceFromTablePositionAndCursor(this.table, pos, newRelativeCursorPosition);
        }
    }
    /**
     * セル情報は取得した時点でのもので、テーブルに変更が加わった場合情報が古くなる場合があります。
     * 例えば現在のセルの位置が変わると、tablePositionは嘘の情報になります。
     * その元のポジションには別のセル、あるいは何もない可能性があり、このメソッドでは元のポジションにあるセルから新たなセル情報(後釜)を取得します。
     * もしセルが同じであれば相対カーソル情報を保持したまま(newCellInfo())を返します。
     * @param cellInfo
     */
    befCellInfo() {
        const pos = this.tablePosition;
        if (pos) {
            const posCell = this.table.getCell(pos.rowIndex, pos.columnIndex);
            // 元のポジションのセルと現在のセルが同じなら相対カーソル位置を保持したまま返す。
            if (posCell && this.cell === posCell.cell) {
                return this.newCellInfo();
            }
            else {
                return TableCellInfo.createInstanceFromTablePosition(this.table, pos);
            }
        }
    }
    /**
     * 現在のセル情報から相対的な位置にあるセル情報を取得します
     * @param nextPosition TablePositionDirectionsで上下左右を指定することも出来ます。
     */
    getCellFromRelative(nextPosition) {
        return TableCellInfo.createInstanceFromTablePosition(this.table, this.tablePosition.add(nextPosition));
    }
    /**
     * 現在のセル情報のテーブルを元に、絶対的な位置にあるセル情報を取得します。
     * @param tablePosition
     */
    getCellFromAbsolute(tablePosition) {
        return TableCellInfo.createInstanceFromTablePosition(this.table, tablePosition);
    }
    /**
     * セルから、指定した方角にある一番最初に見つかるセル情報を取得します。
     */
    getCellFromDirection(direction) {
        const dirPos = TablePositionDirections.getPositionFromDirection(direction);
        let nextPos = this.tablePosition;
        while (this.isTableArea(nextPos = nextPos.add(dirPos))) {
            const nextCellInfo = this.getCellFromAbsolute(nextPos);
            if (nextCellInfo) {
                return nextCellInfo;
            }
        }
    }
    /**
     * FillFormat後の通常テーブルの範囲内かどうかをチェックします。
     * のこぎり型でも、通常テーブル内としてみなしたうえでチェックします。
     * @param tablePosition
     */
    isTableArea(tablePosition) {
        const r = this.table.rowLength;
        const c = this.table.columnLength;
        return new MarkdownRange_1.MarkdownRange(-2, r).internal(tablePosition.rowIndex) && new MarkdownRange_1.MarkdownRange(0, c).internal(tablePosition.columnIndex);
    }
    getForcus() {
        return {
            sPos: this.docPosition
        };
    }
    getWordSelection() {
        return {
            sPos: {
                charIndex: this.cellRange.begin + this.wordInnerPosition,
                docIndex: this.docIndex
            },
            ePos: {
                charIndex: this.cellRange.begin + this.wordInnerPosition + this.cell.word.trim().length,
                docIndex: this.docIndex
            }
        };
    }
}
exports.TableCellInfo = TableCellInfo;
TableCellInfo.cnt = 10;
class TableCell {
    constructor(word) {
        this._word = word;
    }
    get empty() {
        return this._word.trim() === '';
    }
    get word() {
        return this._word;
    }
    set word(value) {
        this._word = value;
    }
}
exports.TableCell = TableCell;
class TableAlignmentCell extends TableCell {
    constructor(word = '---') {
        super(word);
        this._align = MarkdownAlignments_1.MarkdownAlignments.Left;
        this._alignWord = '---';
        if (!this.updateProperties(word)) {
            throw new Error('インスタンスの初期化に失敗しました。');
        }
    }
    get align() {
        return this._align;
    }
    get alignWord() {
        return this._alignWord;
    }
    updateProperties(word) {
        const alignWord = TableAlignmentCell.convertAlignWord(word);
        if (alignWord) {
            super.word = word;
            this._align = TableAlignmentCell.toAlignments(alignWord);
            this._alignWord = alignWord;
            return true;
        }
        return false;
    }
    updateAlign(align) {
        const alignWord = TableAlignmentCell.toAlignWord(align);
        this.updateProperties(alignWord);
    }
    static createInstance(word) {
        const instance = new TableAlignmentCell();
        if (instance.updateProperties(word)) {
            return instance;
        }
    }
    static createCellFromAlignments(align) {
        const instance = new TableAlignmentCell();
        instance.updateAlign(align);
        return instance;
    }
    static createCellFromWAlignWord(alignWord) {
        return new TableAlignmentCell(alignWord);
    }
    static toAlignCell(cell) {
        return this.createInstance(cell.word);
    }
    static convertAlignWord(word) {
        word = word.trim();
        if (word.match(/^:-{2,}$/)) {
            return ':--';
        }
        if (word.match(/^-{3,}$/)) {
            return '---';
        }
        if (word.match(/^-{2,}:$/)) {
            return '--:';
        }
        if (word.match(/^:-{1,}:$/)) {
            return ':-:';
        }
    }
    static toAlignments(alignWord) {
        switch (alignWord) {
            case '---': return MarkdownAlignments_1.MarkdownAlignments.Left;
            case ':--': return MarkdownAlignments_1.MarkdownAlignments.Left;
            case '--:': return MarkdownAlignments_1.MarkdownAlignments.Right;
            case ':-:': return MarkdownAlignments_1.MarkdownAlignments.Center;
        }
    }
    static toAlignWord(align) {
        switch (align) {
            case MarkdownAlignments_1.MarkdownAlignments.Right: return '--:';
            case MarkdownAlignments_1.MarkdownAlignments.Center: return ':-:';
            default: return '---';
        }
    }
}
exports.TableAlignmentCell = TableAlignmentCell;
class CellRangeInfo {
    constructor(row, cell, range) {
        this.row = row;
        this.cell = cell;
        this.range = range;
    }
    /**
     * firstCell/lastCellの場合、或いはすでに行からセルが無い場合は-1が返ります。
     */
    get columnIndex() {
        return this.row.cells.indexOf(this.cell);
    }
}
exports.CellRangeInfo = CellRangeInfo;
class TableRowBase {
    constructor(cells, firstCell, lastCell) {
        this.cells = cells;
        this.firstCell = firstCell;
        this.lastCell = lastCell;
    }
    *[Symbol.iterator]() {
        if (this.firstCell) {
            yield this.firstCell;
        }
        yield* this.cells;
        if (this.lastCell) {
            yield this.lastCell;
        }
    }
    get hasFirstSpritter() {
        return !!this.firstCell;
    }
    get hasLastSplitter() {
        return !!this.lastCell;
    }
    get cellLength() {
        return this.cells.length;
    }
    /**
     * セルを安全に取得します。
     * @param columnIndex
     */
    getCell(columnIndex) {
        if (this.hasCell(columnIndex)) {
            return this.cells[columnIndex];
        }
    }
    hasCell(columnIndex) {
        return new MarkdownRange_1.MarkdownRange(0, this.cellLength).internal(columnIndex);
    }
    getCellRangeFromCell(cell, strCounter) {
        for (const r of this.getCellRanges(strCounter)) {
            if (cell === r.cell) {
                return r.range;
            }
        }
        return null;
    }
    /**
     * charIndexにあるセル及びその範囲を取得します。
     * セルはfirstCell/lastCellを含みます。
     * カラム番号はrows.indexOf()から取得してください。
     * @param charIndex
     * @param strCount
     */
    getCellRangeFromCharacterIndex(charIndex, strCounter) {
        for (const r of this.getCellRanges(strCounter)) {
            if (r.range.internalOrZero(charIndex)) {
                return r;
            }
        }
    }
    getCellRangeFromColumnIndex(columnIndex, strCounter) {
        for (const r of this.getCellRanges(strCounter)) {
            const ci = r.columnIndex;
            if (ci !== -1 && ci === columnIndex) {
                return r;
            }
        }
    }
    *getCellRanges(strCounter = str => str.length) {
        let cp = 0;
        for (const cell of this) {
            let len = strCounter(cell.word);
            yield new CellRangeInfo(this, cell, MarkdownRange_1.MarkdownRange.fromLength(cp, len));
            cp++;
            cp += len;
        }
    }
    isFirstOrLast(cell) {
        return cell === this.firstCell || cell === this.lastCell;
    }
    //#region internal methods
    /**
     * TODO: 単純なsplitではエスケープ等が分割できない。
     */
    static split(line, splitter = '|') {
        return this.jpSplit(line).map(_ => new TableCell(_));
    }
    static jpSplit(str) {
        //return str.split(/(?<=[^\\]|[^\\]\\\\)\|/).map(_ => _.replace(/\\/g, "\\"));
        return `@${str}`.split(/(?<=[^\\]|[^\\](?:\\\\)+)\|/g).map(_ => _.replace(/\\/g, "\\")).map((_, idx) => idx === 0 ? _.substr(1) : _);
    }
    /**
     * TODO: 複雑すぎるためリファクタ必須。
     * @param items
     * @param limit
     */
    static adjust(items, limit = Number.MAX_SAFE_INTEGER) {
        // 分割されてない
        if (items.length === 1) {
            return;
        }
        // "  |  " の状態で成立しない。
        if (items.length == 2) {
            if (items[0].empty && items[1].empty) {
                return;
            }
        }
        // "|...|...|" 左側にスプリッタが存在する場合は抜き取る
        const first = items[0].empty ? items.shift() : undefined;
        // 最後のセルをいったん取り出す。
        let plast = items.pop();
        // 最後のセルが空なら暫定的な最終セルが決定、空でなければ元に戻す(itemsの最後は空では無いことが確定)
        if (plast && !plast.empty) {
            items.push(plast);
            plast = undefined;
        }
        // 安全な非空アイテムから、limit個のセルと残りのアイテム(lastCell)に分割する。
        const cells = items.splice(0, limit);
        //plastが存在すればitemsに統合
        if (plast) {
            items.push(plast);
        }
        // 最後は一つに結合される。
        const last = this.joinTableCells(items);
        return new MarkdownTableRows(cells, first, last);
    }
    // 範囲を残した状態で結合します。
    static joinTableCells(cells) {
        if (cells.length > 0) {
            const txt = cells.map(p => p.word).join('|');
            return new TableCell(txt);
        }
    }
}
exports.TableRowBase = TableRowBase;
class MarkdownTableRows extends TableRowBase {
    static createInstance(line, limit = Number.MAX_SAFE_INTEGER) {
        const lines = this.split(line);
        return this.adjust(lines, limit);
    }
}
exports.MarkdownTableRows = MarkdownTableRows;
class MarkdownTableAlignments extends TableRowBase {
    static createInstance(line) {
        const row = MarkdownTableRows.createInstance(line);
        if (row) {
            const cells = row.cells.map(_ => TableAlignmentCell.toAlignCell(_));
            // TODO: この手のチェックが効かない
            if (!cells.some(_ => _ === undefined)) {
                return new MarkdownTableAlignments(cells, row.firstCell, row.lastCell);
            }
        }
    }
}
exports.MarkdownTableAlignments = MarkdownTableAlignments;
//# sourceMappingURL=MarkdownTableContent.js.map