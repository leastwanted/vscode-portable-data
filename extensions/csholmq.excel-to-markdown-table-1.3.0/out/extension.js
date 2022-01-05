'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
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
    var disposable = vscode.commands.registerCommand('extension.excelToMarkdown', () => __awaiter(this, void 0, void 0, function* () {
        const text = yield vscode.env.clipboard.readText();
        pasteText(text);
    }));
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
    let paste = excel_markdown_tables_1.excelToMarkdown(rawData);
    let editor = vscode.window.activeTextEditor;
    editor.edit(_ => _.replace(editor.selection, paste));
}
//# sourceMappingURL=extension.js.map