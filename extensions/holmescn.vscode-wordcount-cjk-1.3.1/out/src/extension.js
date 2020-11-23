'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require("vscode");
const WordCounter_1 = require("./WordCounter");
const WordCountController_1 = require("./WordCountController");
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
function activate(context) {
    const configuration = vscode.workspace.getConfiguration("wordcount_cjk");
    let counter = new WordCounter_1.WordCounter(configuration);
    let controller = new WordCountController_1.WordCountController(configuration, counter);
    let command1 = vscode.commands.registerCommand('extension.wordcount', () => {
        // This command is used to activate the extension when
        // edit non-standard type files.
        controller.update(/* force = */ true);
    });
    let command2 = vscode.commands.registerCommand('extension.wordcountActivate', () => {
        // This command is used to activate the extension when
        // edit non-standard type files.
        controller.activate();
    });
    let command3 = vscode.commands.registerCommand('extension.wordcountDeactivate', () => {
        // This command is used to deactivate the extension
        controller.deactivate();
    });
    context.subscriptions.push(command1);
    context.subscriptions.push(command2);
    context.subscriptions.push(command3);
    context.subscriptions.push(controller);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map