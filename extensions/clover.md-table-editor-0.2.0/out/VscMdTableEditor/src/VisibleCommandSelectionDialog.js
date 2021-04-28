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
exports.CommandView = void 0;
const vscode_1 = require("vscode");
class CommandView extends vscode_1.Disposable {
    constructor(config) {
        super(() => { vscode_1.Disposable.from(...this.disp).dispose(); });
        this.config = config;
        this.disp = [];
        this.disp.push(config.configChanged(c => {
        }), vscode_1.commands.registerCommand('MdTableEditor.setToolbarCommandVisibility', () => __awaiter(this, void 0, void 0, function* () {
            yield this.openDialog('toolbar');
        })), vscode_1.commands.registerCommand('MdTableEditor.setContextCommandVisibility', () => __awaiter(this, void 0, void 0, function* () {
            yield this.openDialog('context');
        })));
    }
    openDialog(target) {
        return __awaiter(this, void 0, void 0, function* () {
            const quick = vscode_1.window.createQuickPick();
            quick.canSelectMany = true;
            const commandList = this.config.getCommandViews(target);
            quick.onDidChangeActive(e => {
                console.log('active');
            });
            quick.onDidChangeSelection(e => {
                console.log('select');
            });
            quick.onDidAccept(e => {
                console.log('accept');
            });
            quick.onDidHide(() => quick.dispose());
        });
    }
}
exports.CommandView = CommandView;
CommandView.tree = {
    "format": ["MdTableEditor.beautifulFormat", "MdTableEditor.naturalFormat", "MdTableEditor.deleteComment", "MdTableEditor.fillCells"],
    "alignments": ["MdTableEditor.changeAlignRight", "MdTableEditor.changeAlignCenter", "MdTableEditor.changeAlignLeft"],
    "insert": ["MdTableEditor.insertTop", "MdTableEditor.insertBottom", "MdTableEditor.insertLeft", "MdTableEditor.insertRight"],
    "remove": ["MdTableEditor.removeColumn", "MdTableEditor.removeRow"],
    "move": ["MdTableEditor.moveTop", "MdTableEditor.moveBottom", "MdTableEditor.moveLeft", "MdTableEditor.moveRight"],
    "focus": ["MdTableEditor.focusLeft", "MdTableEditor.focusTop", "MdTableEditor.focusBottom", "MdTableEditor.focusRight"],
    "selection": ["MdTableEditor.columnSelect", "MdTableEditor.columnSelectAll", "MdTableEditor.columnSelectEmpty"],
    "sort": ["MdTableEditor.sortNumberAsc", "MdTableEditor.sortNumberDesc", "MdTableEditor.sortTextAsc", "MdTableEditor.sortTextDesc", "MdTableEditor.sortTextAsc.ignore", "MdTableEditor.sortTextDesc.ignore"]
};
class VisibilityQuickItem {
    constructor(commandName) {
        this.commandName = commandName;
        this.children = [];
        this.commandLabel = commandName;
    }
    get label() {
        return '';
    }
}
//# sourceMappingURL=VisibleCommandSelectionDialog.js.map