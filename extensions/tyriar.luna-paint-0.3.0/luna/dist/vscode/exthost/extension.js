"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const paintEditorProvider_1 = require("./paintEditorProvider");
function activate(context) {
    const retainContextWhenHidden = vscode.workspace.getConfiguration('luna').get('retainContextWhenHidden');
    context.subscriptions.push(vscode.window.registerCustomEditorProvider(paintEditorProvider_1.PaintEditorProvider.viewType, new paintEditorProvider_1.PaintEditorProvider(context), {
        webviewOptions: { retainContextWhenHidden }
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map