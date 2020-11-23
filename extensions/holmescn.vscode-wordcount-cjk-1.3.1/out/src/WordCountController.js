"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Import the module and reference it with the alias vscode in your code below
const vscode_1 = require("vscode");
/**
 * The controller of word count
 */
class WordCountController {
    constructor(configuration, wordCounter) {
        this._isActive = false;
        this._wordCounter = wordCounter;
        this._statusBarTextTemplate = configuration.get("statusBarTextTemplate");
        this._statusBarTooltipTemplate = configuration.get("statusBarTooltipTemplate").replace(/\\n/g, '\n').replace(/\\t/g, '\t');
        this._activateLanguages = configuration.get("activateLanguages");
        this._statusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Left);
        // subscribe to selection change and editor activation events
        let subscriptions = [];
        vscode_1.window.onDidChangeTextEditorSelection(this._onEvent, this, subscriptions);
        vscode_1.window.onDidChangeActiveTextEditor(this._onEvent, this, subscriptions);
        // create a combined disposable from both event subscriptions
        this._disposable = vscode_1.Disposable.from(...subscriptions);
    }
    update(force = false) {
        let editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            this._statusBarItem.hide();
            return;
        }
        let doc = editor.document;
        if (force || this.shouldActivate(doc.languageId) || this._isActive) {
            // Update word count.
            if (editor.selection.isEmpty) {
                let text = doc.getText();
                this._wordCounter.count(text);
            }
            else {
                const text = editor.document.getText(editor.selection);
                this._wordCounter.count(text);
            }
            // Update the status bar
            try {
                this._statusBarItem.text = this._wordCounter.format(this._statusBarTextTemplate);
                this._statusBarItem.tooltip = this._wordCounter.format(this._statusBarTooltipTemplate);
                this._statusBarItem.show();
            }
            catch (e) {
                vscode_1.window.showErrorMessage('Something is wrong when update status bar');
            }
        }
        else {
            this._statusBarItem.hide();
        }
    }
    shouldActivate(languageId) {
        for (var l of this._activateLanguages) {
            if (l === languageId) {
                return true;
            }
        }
        return false;
    }
    _onEvent() {
        this.update();
        if (this._delayUpdateTimer) {
            clearTimeout(this._delayUpdateTimer);
        }
        this._delayUpdateTimer = setTimeout(() => {
            this._delayUpdateTimer = null;
            this.update();
        }, 500);
    }
    /**
     * This makes the class disposable.
     */
    dispose() {
        this._statusBarItem.dispose();
        this._disposable.dispose();
    }
    activate() {
        this._isActive = true;
        this.update();
    }
    deactivate() {
        this._isActive = false;
        this._statusBarItem.hide();
    }
}
exports.WordCountController = WordCountController;
//# sourceMappingURL=WordCountController.js.map