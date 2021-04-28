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
const locale_1 = require("./locale");
class VisibilityTreeFactory {
    constructor(list, tree = VisibilityTreeFactory.tree) {
        this.list = list;
        this.tree = tree;
        this.groups = Object.entries(tree).map(([groupName, commandNames]) => {
            const p = new VisibilityGroupQuickItem(groupName, list.includes(groupName));
            const children = commandNames.map(_ => new VisibilityQuickItem(_, list.includes(_)));
            p.children.push(...children);
            return p;
        });
    }
    get allChildren() {
        return [].concat(this.groups.map(_ => _.children));
    }
    get allItems() {
        return [].concat(...this.groups.map(_ => [_, ..._.children]));
    }
}
VisibilityTreeFactory.tree = {
    "format": ["MdTableEditor.beautifulFormat", "MdTableEditor.naturalFormat", "MdTableEditor.deleteComment", "MdTableEditor.fillCells"],
    "alignments": ["MdTableEditor.changeAlignRight", "MdTableEditor.changeAlignCenter", "MdTableEditor.changeAlignLeft"],
    "insert": ["MdTableEditor.insertTop", "MdTableEditor.insertBottom", "MdTableEditor.insertLeft", "MdTableEditor.insertRight"],
    "remove": ["MdTableEditor.removeColumn", "MdTableEditor.removeRow"],
    "move": ["MdTableEditor.moveTop", "MdTableEditor.moveBottom", "MdTableEditor.moveLeft", "MdTableEditor.moveRight"],
    "focus": ["MdTableEditor.focusLeft", "MdTableEditor.focusTop", "MdTableEditor.focusBottom", "MdTableEditor.focusRight"],
    "selection": ["MdTableEditor.columnSelect", "MdTableEditor.columnSelectAll", "MdTableEditor.columnSelectEmpty"],
    "sort": ["MdTableEditor.sortNumberAsc", "MdTableEditor.sortNumberDesc", "MdTableEditor.sortTextAsc", "MdTableEditor.sortTextDesc", "MdTableEditor.sortTextAsc.ignore", "MdTableEditor.sortTextDesc.ignore"]
};
class CommandView extends vscode_1.Disposable {
    constructor(config) {
        super(() => { vscode_1.Disposable.from(...this.disp).dispose(); });
        this.config = config;
        this.disp = [];
        this.contextChange();
        this.disp.push(config.configChanged((c) => __awaiter(this, void 0, void 0, function* () {
            yield this.contextChange();
        })), vscode_1.commands.registerCommand('MdTableEditor.setToolbarCommandVisibility', () => __awaiter(this, void 0, void 0, function* () {
            yield this.openDialog('toolbar');
        })), vscode_1.commands.registerCommand('MdTableEditor.setContextCommandVisibility', () => __awaiter(this, void 0, void 0, function* () {
            yield this.openDialog('context');
        })));
    }
    contextChange() {
        return __awaiter(this, void 0, void 0, function* () {
            const cvs = this.config.getCommandViews();
            for (const target of ['toolbar', 'context']) {
                const commandList = cvs[target];
                const groups = new VisibilityTreeFactory(commandList).groups;
                for (const g of groups) {
                    for (const c of g.children) {
                        vscode_1.commands.executeCommand('setContext', `${c.commandName}-${target}`, g.picked || c.picked);
                    }
                }
            }
        });
    }
    openDialog(target) {
        return __awaiter(this, void 0, void 0, function* () {
            const quick = vscode_1.window.createQuickPick();
            quick.canSelectMany = true;
            const cvs = this.config.getCommandViews();
            const commandList = (cvs === null || cvs === void 0 ? void 0 : cvs[target]) || [];
            const fac = new VisibilityTreeFactory(commandList);
            const treeItems = fac.allItems;
            quick.items = treeItems;
            quick.selectedItems = treeItems.filter(_ => commandList.includes(_.commandName));
            quick.onDidChangeSelection((e) => __awaiter(this, void 0, void 0, function* () {
                const arr = e.map(_ => _.commandName);
                if (arr.sort().join(',') !== commandList.sort().join(',') || true) {
                    cvs[target] = arr;
                    yield this.config.setCommandViews(cvs);
                }
            }));
            quick.onDidAccept(() => quick.hide());
            quick.onDidHide(() => quick.dispose());
            quick.show();
        });
    }
}
exports.CommandView = CommandView;
class VisibilityDialog {
}
class VisibilityQuickItem {
    constructor(commandName, picked) {
        this.commandName = commandName;
        this.label = this.createLabel();
        this.picked = picked;
    }
    createLabel() {
        return `  ${locale_1.locale(this.commandName)}`;
    }
}
class VisibilityGroupQuickItem extends VisibilityQuickItem {
    constructor() {
        super(...arguments);
        this.children = [];
    }
    getEnabledChildren() {
        return this.picked ? this.children : this.children.filter(_ => _.picked);
    }
    createLabel() {
        return locale_1.locale(this.commandName);
    }
}
//# sourceMappingURL=CommandView.js.map