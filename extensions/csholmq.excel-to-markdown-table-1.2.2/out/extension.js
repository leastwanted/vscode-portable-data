'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const excel_markdown_tables_1 = require("./excel-markdown-tables");
/**
 * Registers the extension with VS Code
 * This extension will run when the editor's language is set to 'markdown'.
 * The extension can be called through Ctrl-Shift-P and selecting the XXX Option,
 * or by using the shortcut Shift-Alt-V
 * @param context
 */
function activate(context) {
    var disposable = vscode.commands.registerCommand('extension.excelToMarkdown', () => {
        let clipboard = require('copy-paste');
        clipboard.paste(function (err, val) {
            pasteText(val);
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
/**
 * Converts the clipboard contents to a markdown table and pastes into the document
 * @param rawData The raw clipboard contents containing the excel table to convert
 */
function pasteText(rawData) {
    let clipboard = require('copy-paste');
    let paste = excel_markdown_tables_1.excelToMarkdown(rawData);
    let editor = vscode.window.activeTextEditor;
    editor.edit(_ => _.replace(editor.selection, paste));
}
//# sourceMappingURL=extension.js.map