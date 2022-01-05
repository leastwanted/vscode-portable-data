"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const languageCompletion_1 = require("../plantuml/intellisense/languageCompletion");
const macroCompletion_1 = require("../plantuml/intellisense/macroCompletion");
const tools_1 = require("../plantuml/diagram/tools");
const variableCompletion_1 = require("../plantuml/intellisense/variableCompletion");
const common_1 = require("../plantuml/common");
class Completion extends vscode.Disposable {
    constructor() {
        super(() => this.dispose());
        this._disposables = [];
        let sel = [
            { scheme: 'file', language: common_1.languageid },
            { scheme: 'untitled', language: common_1.languageid },
        ];
        this._disposables.push(vscode.languages.registerCompletionItemProvider(sel, this));
    }
    dispose() {
        this._disposables && this._disposables.length && this._disposables.map(d => d.dispose());
    }
    provideCompletionItems(document, position, token) {
        let diagram = tools_1.diagramAt(document, position);
        return Promise.all([
            macroCompletion_1.MacroCompletionItems(diagram, position, token),
            languageCompletion_1.LanguageCompletionItems(),
            variableCompletion_1.VariableCompletionItems(diagram, position, token),
        ]).then(results => [].concat(...results));
    }
    resolveCompletionItem(item, token) {
        // TODO: add item.documentation
        return null;
    }
}
exports.Completion = Completion;
//# sourceMappingURL=completion.js.map