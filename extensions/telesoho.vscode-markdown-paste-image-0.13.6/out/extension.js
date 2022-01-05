'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode = require("vscode");
const latex_1 = require("./latex");
const paster_1 = require("./paster");
class LatexSymbol {
    constructor() {
        this.latexItems = [];
    }
    getItems() {
        return this.latexItems;
    }
    load(latexSymbols) {
        this.latexItems = [];
        for (let name in latexSymbols) {
            this.latexItems.push({
                description: latexSymbols[name],
                label: name,
            });
        }
    }
    insertToEditor(item) {
        if (!item) {
            return;
        }
        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }
        editor.edit((editBuilder) => {
            editBuilder.delete(editor.selection);
        }).then(() => {
            editor.edit((editBuilder) => {
                editBuilder.insert(editor.selection.start, item.description);
            });
        });
    }
}
function activate(context) {
    console.log('"vscode-markdown-paste" is now active!');
    let LatexMathSymbol = new LatexSymbol();
    LatexMathSymbol.load(latex_1.latexSymbols);
    vscode.commands.registerCommand('telesoho.insertMathSymbol', () => {
        vscode.window.showQuickPick(LatexMathSymbol.getItems(), {
            ignoreFocusOut: true,
        }).then(LatexMathSymbol.insertToEditor);
    });
    context.subscriptions.push(vscode.commands.registerCommand('telesoho.MarkdownDownload', () => {
        paster_1.Paster.pasteDownload();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('telesoho.MarkdownPaste', () => {
        paster_1.Paster.pasteText();
    }));
    context.subscriptions.push(vscode.commands.registerCommand('telesoho.MarkdownRuby', () => {
        paster_1.Paster.Ruby();
    }));
}
exports.activate = activate;
function deactivate() {
    console.log('"vscode-markdown-paste" is now inactive!');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map