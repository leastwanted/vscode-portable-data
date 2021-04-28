"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormatCommand = void 0;
const CommandBaseClasses_1 = require("./CommandBaseClasses");
class FormatCommand extends CommandBaseClasses_1.FormatCommandBase {
    canExecuteOverride(cellInfo, parameter) {
        return true;
    }
    executeOverride(cellInfo, parameter, focus) {
        const rp = cellInfo.relativeCursorInnerPosition;
        focus.format();
        const cp = cellInfo.newCellInfo(rp);
        const f = cp === null || cp === void 0 ? void 0 : cp.getForcus();
        focus.setFocusedCellInfo(f);
    }
    put(cp, tag) {
        if (cp) {
            const pos = this.commandContext.appContext.getCursor() || {
                docIndex: -1,
                charIndex: -1
            };
            const tx = `wordPos=${cp.wordInnerPosition}, cursor(${pos.docIndex}, ${pos.charIndex})`;
            const line = `|${cp.row.cells.map(_ => _.word).join('|')}|`;
            console.log(`${line} [${tag}]relPos = ${cp.relativeCursorInnerPosition}, fcs(${cp.docPosition.docIndex}, ${cp.docPosition.charIndex}) ... tx(${tx}), ${cp.serial}`);
        }
        else {
            console.log(`undefined [${tag}]`);
        }
    }
}
exports.FormatCommand = FormatCommand;
//# sourceMappingURL=FormatCommand.js.map