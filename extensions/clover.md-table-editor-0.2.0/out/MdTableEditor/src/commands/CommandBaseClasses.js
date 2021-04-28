"use strict";
/**
 * コンストラクタによる初期化を行う基底クラスです。
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextSortCommandBase = exports.SortCommandBase = exports.FocusCommandBase = exports.FormatCommandBase = exports.ChangeAlignmentCommandBase = exports.RemoveCommandBase = exports.InsertCommandBase = exports.MoveCommandBase = void 0;
const TableCellCommandBase_1 = require("./TableCellCommandBase");
class MoveCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, isBefore) {
        super(commandContext);
        this.isBefore = isBefore;
    }
}
exports.MoveCommandBase = MoveCommandBase;
class InsertCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, isBefore) {
        super(commandContext);
        this.isBefore = isBefore;
    }
}
exports.InsertCommandBase = InsertCommandBase;
class RemoveCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext) {
        super(commandContext);
    }
}
exports.RemoveCommandBase = RemoveCommandBase;
class ChangeAlignmentCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, align) {
        super(commandContext);
        this.align = align;
    }
}
exports.ChangeAlignmentCommandBase = ChangeAlignmentCommandBase;
class FormatCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, renderMode) {
        super(commandContext);
        this.renderMode = renderMode;
    }
}
exports.FormatCommandBase = FormatCommandBase;
class FocusCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, direction) {
        super(commandContext);
        this.direction = direction;
    }
}
exports.FocusCommandBase = FocusCommandBase;
class SortCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, isAsc) {
        super(commandContext);
        this.isAsc = isAsc;
    }
}
exports.SortCommandBase = SortCommandBase;
class TextSortCommandBase extends TableCellCommandBase_1.TableCellCommandBase {
    constructor(commandContext, isAsc, ignoreCase) {
        super(commandContext);
        this.isAsc = isAsc;
        this.ignoreCase = ignoreCase;
    }
}
exports.TextSortCommandBase = TextSortCommandBase;
//# sourceMappingURL=CommandBaseClasses.js.map