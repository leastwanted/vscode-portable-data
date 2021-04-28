"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusDecorator = exports.VscHelper = exports.MyStopWatch = void 0;
const vscode_1 = require("vscode");
const StringCounter_1 = require("../../MdTableEditor/src/StringCounter");
class MyStopWatch {
    constructor() {
        this.tm = Date.now();
    }
    step() {
        const [tm, ntm] = [this.tm, Date.now()];
        this.tm = ntm;
        return ntm - tm;
    }
}
exports.MyStopWatch = MyStopWatch;
MyStopWatch.current = new MyStopWatch();
class VscHelper {
    static insertCursor(text, char) {
        let arr = text.split('');
        arr.splice(char, 0, '|');
        return arr.join('');
    }
    static getCursorPosition() {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            // TODO: selection.isEmptyである必要は無い仕様にした。
            if (selection) {
                return selection.active;
            }
        }
    }
    static setCursorPosition(...selections) {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            if (selection) {
                editor.selections = selections;
            }
        }
    }
    // TODO: 後で範囲チェック。
    static replace(start, end, text, cursorPos) {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document && !document.isDirty) {
                const s = document.lineAt(start).range.start;
                const e = document.lineAt(end - 1).range.end;
                editor.edit(_ => _.replace(new vscode_1.Range(s, e), text)).then(v => {
                    if (v) {
                        this.setCursorPosition(new vscode_1.Selection(cursorPos, cursorPos));
                    }
                    else {
                        console.log("error-------------");
                    }
                });
                /*
                editor.edit(_ => {
                    const s = document.lineAt(start).range.start;
                    const e = document.lineAt(end-1).range.end;
                    _.replace(new Range(s, e), text);
                    this.setCursorPosition(cursorPos);
                });
                */
                return true;
            }
        }
        return false;
    }
    static adjustCursorPosition(replace) {
        const position = this.getCursorPosition();
        const editor = vscode_1.window.activeTextEditor;
        if (position && editor) {
            replace();
            const currentPosition = this.getCursorPosition();
            if (currentPosition) {
                const newLine = Math.min(Math.max(0, editor.document.lineCount - 1), position.line);
                const newLineLastChar = editor.document.lineAt(newLine).range.end.character;
                const newChar = Math.min(newLineLastChar, position.character);
                const newPosition = new vscode_1.Position(newLine, newChar);
                editor.selection = new vscode_1.Selection(newPosition, newPosition);
            }
        }
    }
    /*
        public static getTableData(): ITableData | undefined
        {
            const ed = window.activeTextEditor;
            const cp = VscHelper.getCursorPosition();
    
            if(ed && cp)
            {
                const ts = new VSCodeTextSource(ed.document);
                const line = cp.line;
                const table = new MarkdownParser().findContent(ts, line);
                if(table)
                {
                    return {
                        table: table,
                        docIndex: cp.line,
                        charIndex: cp.character
                    };
                }
            }
        }
    
    */
    static scroll(docIndex) {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            const range = new vscode_1.Range(new vscode_1.Position(docIndex, 0), new vscode_1.Position(docIndex, 0));
            editor.revealRange(range, vscode_1.TextEditorRevealType.InCenter);
        }
    }
    static selectLine() {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            if (selection && selection.isEmpty) {
                const position = selection.active;
                const end = editor.document.lineAt(position.line).range.end.character;
                const zeroPosition = position.with(position.line, 0);
                const lastPosition = position.with(position.line, end);
                const range = new vscode_1.Range(zeroPosition, lastPosition);
                // editor.selection = newSelection;
                editor.setDecorations(VscHelper.dec, [range]);
            }
        }
    }
    static posChange() {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            const selection = editor.selection;
            if (selection && selection.isEmpty) {
                const position = selection.active;
                const newPosition = position.with(position.line, 0);
                const newSelection = new vscode_1.Selection(newPosition, newPosition);
                editor.selection = newSelection;
            }
        }
    }
}
exports.VscHelper = VscHelper;
VscHelper.dec = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'dotted solid',
    light: {
        borderColor: 'red'
    },
    dark: {
        borderColor: 'green',
        opacity: '0.5'
    }
});
class FocusDecorator {
    getRowDecorator() {
        return FocusDecorator.rowDecorator;
    }
    getRowLeftDecorator() {
        return FocusDecorator.rowLeftDecorator;
    }
    getRowRightDecorator() {
        return FocusDecorator.rowRightDecorator;
    }
    getColumnDecorator() {
        return FocusDecorator.columnDecorator;
    }
    getColumnTopDecorator() {
        return FocusDecorator.columnTopDecorator;
    }
    getColumnBottomDecorator() {
        return FocusDecorator.columnBottomDecorator;
    }
    getCellDecorator() {
        return FocusDecorator.cellDecorator;
    }
    getAllTypes() {
        return [
            this.getCellDecorator(),
            this.getColumnBottomDecorator(),
            this.getColumnDecorator(),
            this.getColumnTopDecorator(),
            this.getRowDecorator(),
            this.getRowLeftDecorator(),
            this.getRowRightDecorator()
        ];
    }
    hide(editor) {
        this.getAllTypes().forEach(_ => editor.setDecorations(_, []));
    }
    decorate(editor, tableData) {
        const table = tableData.table;
        const info = table.getCellInfo({ docIndex: tableData.docIndex, charIndex: tableData.charIndex });
        const rowRanges = [];
        const columnRanges = [];
        if (info) {
            for (const range of info.row.getCellRanges(str => StringCounter_1.StringCounter.stringCount(str))) {
                if (!info.row.isFirstOrLast(range.cell)) {
                    if (range.cell === info.cellInfo.cell) {
                    }
                    rowRanges.push(new vscode_1.Range(new vscode_1.Position(tableData.docIndex, range.range.begin), new vscode_1.Position(tableData.docIndex, range.range.end)));
                }
            }
            for (const [index, row] of [...table.rows].entries()) {
                const cell = row.getCell(info.columnIndex);
                if (cell) {
                    const range = row.getCellRangeFromCell(cell);
                    if (range) {
                        columnRanges.push(new vscode_1.Range(new vscode_1.Position(table.range.begin + index + 2, range.begin), new vscode_1.Position(table.range.begin + index + 2, range.end)));
                    }
                }
            }
            this.decorateRow(editor, rowRanges);
            this.decorateColumn(editor, columnRanges);
            const cell = info.row.getCellRangeFromCharacterIndex(tableData.charIndex);
            if (cell) {
                const range = new vscode_1.Range(new vscode_1.Position(tableData.docIndex, cell.range.begin), new vscode_1.Position(tableData.docIndex, cell.range.end));
                this.decorationCell(editor, range);
            }
        }
    }
    decorateRow(editor, rowRanges) {
        if (rowRanges.length) {
            const first = rowRanges[0];
            const last = rowRanges[rowRanges.length - 1];
            const newRange = first.union(last);
            editor.setDecorations(this.getRowDecorator(), [newRange]);
        }
    }
    decorateColumn(editor, columnRanges) {
        if (columnRanges.length >= 2) {
            editor.setDecorations(this.getColumnTopDecorator(), [columnRanges.shift()]);
            editor.setDecorations(this.getColumnBottomDecorator(), [columnRanges.pop()]);
        }
        if (columnRanges.length) {
            editor.setDecorations(this.getColumnDecorator(), columnRanges);
        }
    }
    decorationCell(editor, range) {
        editor.setDecorations(this.getCellDecorator(), [range]);
    }
}
exports.FocusDecorator = FocusDecorator;
FocusDecorator.current = new FocusDecorator();
FocusDecorator.defaultBackgroundColor = 'rgba(128, 128, 128, 0.2)';
FocusDecorator.rowDecorator = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    //borderStyle: 'solid none',
    borderStyle: 'solid',
    borderColor: 'green',
    backgroundColor: FocusDecorator.defaultBackgroundColor
});
FocusDecorator.rowLeftDecorator = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid none solid solid',
    borderColor: 'green',
    backgroundColor: FocusDecorator.defaultBackgroundColor
});
FocusDecorator.rowRightDecorator = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid solid solid none',
    borderColor: 'green',
    backgroundColor: FocusDecorator.defaultBackgroundColor
});
FocusDecorator.columnDecorator = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'none solid',
    borderColor: 'green',
    backgroundColor: FocusDecorator.defaultBackgroundColor
});
FocusDecorator.columnTopDecorator = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid solid none',
    borderColor: 'green',
    backgroundColor: FocusDecorator.defaultBackgroundColor
});
FocusDecorator.columnBottomDecorator = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'none solid solid',
    borderColor: 'green',
    backgroundColor: FocusDecorator.defaultBackgroundColor
});
FocusDecorator.cellDecorator = vscode_1.window.createTextEditorDecorationType({
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'green',
    backgroundColor: FocusDecorator.defaultBackgroundColor
});
//# sourceMappingURL=vsc-helper.js.map