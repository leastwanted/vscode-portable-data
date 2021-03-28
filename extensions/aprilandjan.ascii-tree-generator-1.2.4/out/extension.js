"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const path = require("path");
// import * as fs from 'fs';
const directory_1 = require("./lib/directory");
const generator_1 = require("./lib/generator");
const utils_1 = require("./utils");
const text_1 = require("./lib/text");
function activate(context) {
    function registerCommand(cmd, callback) {
        context.subscriptions.push(vscode.commands.registerCommand(cmd, callback));
    }
    registerCommand('extension.asciiTreeGenerator', (resource) => __awaiter(this, void 0, void 0, function* () {
        const workspaces = vscode.workspace.workspaceFolders;
        const rootWorkspace = workspaces ? workspaces[0] : undefined;
        if (!rootWorkspace) {
            vscode.window.showWarningMessage('Ascii Tree Generator need to be used with valid workspace folder!');
            return;
        }
        //	if no selected resource found, then try to get workspace root path
        const target = resource || rootWorkspace.uri;
        const root = path.relative(rootWorkspace.uri.fsPath, target.fsPath) || '.';
        // Todo: read plugin configuration
        const items = yield directory_1.formatFileTreeItemsFromDirectory(target.fsPath, {
            maxDepth: Number.MAX_VALUE,
            sort: true,
            ignore: [],
        });
        const text = generator_1.generate(items, {
            eol: utils_1.getUserEOL(),
            root,
        });
        utils_1.createWebview(context, text);
    }));
    //	create ascii tree from directory
    registerCommand('extension.asciiTreeGeneratorFromDirectory', (resource) => __awaiter(this, void 0, void 0, function* () {
        const workspaces = vscode.workspace.workspaceFolders;
        const rootWorkspace = workspaces ? workspaces[0] : undefined;
        if (!rootWorkspace) {
            vscode.window.showWarningMessage('Ascii Tree Generator need to be used with valid workspace folder!');
            return;
        }
        //	if no selected resource found, then try to get workspace root path
        const target = resource || rootWorkspace.uri;
        const root = path.relative(rootWorkspace.uri.fsPath, target.fsPath) || '.';
        // Todo: read plugin configuration
        const items = yield directory_1.formatFileTreeItemsFromDirectory(target.fsPath, {
            maxDepth: Number.MAX_VALUE,
            sort: true,
            ignore: [],
        });
        const text = generator_1.generate(items, {
            eol: utils_1.getUserEOL(),
            root,
        });
        utils_1.createWebview(context, text);
    }));
    registerCommand('extension.asciiTreeGeneratorFromText', (resource) => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor || editor.selection.isEmpty) {
            vscode.window.showWarningMessage('No text selected. Please select text in editor before generating Tree String!');
            return;
        }
        //	find and select lines where current selection range locates
        const start = editor.selection.start.line;
        const end = editor.selection.end.line;
        const endLineSize = editor.document.lineAt(end).text.length;
        const range = editor.document.validateRange(new vscode.Range(new vscode.Position(start, 0), new vscode.Position(end, endLineSize)));
        editor.selection = new vscode.Selection(range.start, range.end);
        //	generate text and replace...
        const rawText = editor.document.getText(range);
        const items = text_1.formatFileTreeItemsFromText(rawText);
        const text = generator_1.generate(items, {
            eol: editor.document.eol === vscode.EndOfLine.CRLF ? '\r\n' : '\n',
        });
        editor.edit((edit) => {
            edit.replace(editor.selection, text);
        });
    }));
    registerCommand('extension.asciiTreeGeneratorRevertToText', () => __awaiter(this, void 0, void 0, function* () {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('Please open the file you want to revert!');
            return;
        }
        const text = editor.document.getText();
        const reverted = utils_1.revertTreeString(text);
        const firstLine = editor.document.lineAt(0);
        const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
        const range = new vscode.Range(0, firstLine.range.start.character, editor.document.lineCount - 1, lastLine.range.end.character);
        editor.edit((edit) => {
            edit.replace(range, reverted);
        });
    }));
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map