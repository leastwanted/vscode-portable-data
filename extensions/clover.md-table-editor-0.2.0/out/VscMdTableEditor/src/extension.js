"use strict";
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
const vscode_1 = require("vscode");
const MdTableEditor_1 = require("./MdTableEditor");
let mdTableEditor;
function activate(context) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            mdTableEditor = new MdTableEditor_1.MdTableEditor(context);
            yield mdTableEditor.initialize();
        }
        catch (err) {
            console.log(err);
        }
        // TODO: 緊急追加、いづれ適切な場所に移す。
        context.subscriptions.push(vscode_1.languages.registerCompletionItemProvider('markdown', {
            provideCompletionItems: (doc, pos) => {
                if (pos.character === 2) {
                    const txt = doc.lineAt(pos.line).text.substr(0, 2);
                    const nbr = Number(txt.charAt(0));
                    if (!isNaN(nbr) && txt.charAt(1) === 'x') {
                        return [...Array(9).keys()].map(_ => {
                            const len = _ + 1;
                            const line = '|' + 'x'.repeat(nbr).split('').join('|') + '|';
                            const row = line.replace(/x/g, '   ');
                            const alignment = line.replace(/x/g, '---');
                            const table = [
                                row,
                                alignment,
                                ...[...Array(len).keys()].map(_ => row)
                            ]
                                // TODO: 改行コードってそのまま挿入するのまずそう、フォーマッターもそうだけど、検証が必要。
                                .join("\n");
                            const doc = table.replace(/   /g, ' A ');
                            return {
                                label: `${nbr}x${len}`,
                                detail: `Create a new table.`,
                                documentation: doc,
                                insertText: table
                            };
                        });
                    }
                }
                return [];
            }
        }, 'x'));
    });
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
    if (mdTableEditor) {
        mdTableEditor.dispose();
    }
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map