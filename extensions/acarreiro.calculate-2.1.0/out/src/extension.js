"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const math = require("mathjs");
const vscode = require("vscode");
const erroralert_1 = require("./erroralert");
/**
 * Initialization code
 */
function activate(context) {
    context.subscriptions.push(vscode.commands.registerCommand('extension.calculate', runCalculate(insertResult)));
    context.subscriptions.push(vscode.commands.registerCommand('extension.calculateReplace', runCalculate(overwriteResult)));
}
exports.activate = activate;
/**
 * Runs the calculation with a given edit strategy
 */
function runCalculate(editMaker) {
    return () => {
        var win = vscode.window;
        let erroralert = new erroralert_1.default();
        var activeTextEditor = win.activeTextEditor;
        if (activeTextEditor === undefined) {
            erroralert.throwSingleErrorImmediately("NO_FOCUS");
            return false;
        }
        activeTextEditor.edit((textEditorEdit) => {
            activeTextEditor.selections.forEach((selection, index) => {
                var selectedText = activeTextEditor.document.getText(selection).replace(/\$i/g, String(index + 1));
                if (selectedText === "") {
                    erroralert.saveError("NO_SELECT");
                    return;
                }
                try {
                    var evaluatedMath = math.eval(selectedText.toString().replace(/,/g, '.'));
                    editMaker(textEditorEdit, selection, evaluatedMath);
                }
                catch (e) {
                    erroralert.saveError("CALC_ERR", selectedText.toString());
                }
            });
            erroralert.throwSavedErrorIfNecessary();
        });
    };
}
let insertResult = function (edit, selection, result) {
    edit.insert(selection.end, "=" + round(result));
};
let overwriteResult = function (edit, selection, result) {
    edit.replace(selection, String(round(result)));
};
function round(n) {
    // Round to 5 decimal places
    return Math.round(n * 1000000) / 1000000;
}
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
// exports.activate = activate;
// exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map