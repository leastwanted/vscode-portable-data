"use strict";
var vscode = require("vscode");
var opn = require('opn');
/**
 * Activates the extension.
 */
function activate(context) {
    var controller = new OpenController();
    context.subscriptions.push(controller);
}
exports.activate = activate;
/**
 * Controller for handling file opens.
 */
var OpenController = (function () {
    function OpenController() {
        var _this = this;
        var subscriptions = [];
        var disposable = vscode.commands.registerCommand('extension.open', function (uri) {
            _this.open(uri);
        });
        subscriptions.push(disposable);
        this._disposable = (_a = vscode.Disposable).from.apply(_a, subscriptions);
        var _a;
    }
    OpenController.prototype.dispose = function () {
        this._disposable.dispose();
    };
    OpenController.prototype.open = function (uri) {
        if (uri && uri.scheme) {
            this.openFile(uri.toString());
            return;
        }
        var editor = vscode.window.activeTextEditor;
        if (editor && editor.document.uri) {
            this.openFile(editor.document.uri.toString());
            return;
        }
        vscode.window.showInformationMessage('No editor is active.');
    };
    OpenController.prototype.openFile = function (uri) {
        try {
            opn(decodeURIComponent(uri));
        }
        catch (error) {
            vscode.window.showInformationMessage('Couldn\'t open file.');
            console.error(error.stack);
        }
    };
    return OpenController;
}());
//# sourceMappingURL=extension.js.map