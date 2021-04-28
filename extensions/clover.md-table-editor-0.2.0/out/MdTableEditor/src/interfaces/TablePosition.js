"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TablePosition = void 0;
class TablePosition {
    constructor(rowIndex, columnIndex) {
        this.rowIndex = rowIndex;
        this.columnIndex = columnIndex;
    }
    equals(tablePosition) {
        return this.rowIndex === tablePosition.rowIndex && this.columnIndex === tablePosition.columnIndex;
    }
    add(vector) {
        return new TablePosition(this.rowIndex + vector.rowIndex, this.columnIndex + vector.columnIndex);
    }
    addRowIndex(rowIndex) {
        return this.add(new TablePosition(rowIndex, 0));
    }
    addColumnIndex(columnIndex) {
        return this.add(new TablePosition(0, columnIndex));
    }
    setRowIndex(rowIndex) {
        return new TablePosition(rowIndex, this.columnIndex);
    }
    setColumnIndex(columnIndex) {
        return new TablePosition(this.rowIndex, columnIndex);
    }
}
exports.TablePosition = TablePosition;
//# sourceMappingURL=TablePosition.js.map