"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class Erroralert {
    constructor() {
        this.ERRTYPES = {
            "NO_FOCUS": (selText) => { return "Open a file and select an expression to evaluate it"; },
            "NO_SELECT": (selText) => { return "Please make a selection before calculating"; },
            "CALC_ERR": (selText) => { return "Could not calculate: '" + selText + "'"; }
        };
        this.savedError = "";
        this.errCount = 0;
    }
    /**
     * Multiple editors should not trigger many errors, just a single one at the end.
     */
    saveError(errtype, selText = "") {
        this.errCount++;
        this.savedError = this.ERRTYPES[errtype](selText);
    }
    throwSavedErrorIfNecessary() {
        if (this.savedError !== "") {
            let extraErrorText = this.errCount > 1 ? ". Additionally, there were " + (this.errCount - 1) + " other issues" : "";
            vscode.window.showErrorMessage(this.savedError + extraErrorText);
            this.savedError = "";
        }
    }
    throwSingleErrorImmediately(errtype, selText = "") {
        vscode.window.showErrorMessage(this.ERRTYPES[errtype](selText));
    }
}
exports.default = Erroralert;
//# sourceMappingURL=erroralert.js.map