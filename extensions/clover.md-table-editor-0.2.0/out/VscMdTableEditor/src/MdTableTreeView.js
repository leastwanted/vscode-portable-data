"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdTableExplorer = exports.MdTableTreeDataProvider = exports.MdTableTreeItem = void 0;
const vscode_1 = require("vscode");
class MdTableTreeItem extends vscode_1.TreeItem {
    constructor(tableContent, index) {
        super('');
        this.tableContent = tableContent;
        this.label = this.getLabel();
        this.command = this.getCommand(index);
    }
    getLabel() {
        const table = this.tableContent;
        const headers = table.headers.cells.map(_ => _.word.trim() || '*').join(' | ');
        return `Table(${table.columnLength}x${table.rowLength}): ${headers}`;
    }
    getCommand(index) {
        return {
            title: "実験",
            tooltip: "つーるちっぷ",
            command: "MdTableEditor.scroll",
            arguments: [index]
        };
    }
}
exports.MdTableTreeItem = MdTableTreeItem;
class MdTableTreeDataProvider {
    constructor(tables) {
        this.tables = tables;
        this._onDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh(tables) {
        this.tables = tables || [];
        this._onDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            return this.tables.map((_, index) => this.createTableItem(_, index));
        }
        return [];
    }
    createTableItem(table, index) {
        return new MdTableTreeItem(table, index);
    }
}
exports.MdTableTreeDataProvider = MdTableTreeDataProvider;
class MdTableExplorer {
    constructor(context) {
        this.context = context;
        this.dataProvider = new MdTableTreeDataProvider([]);
        context.subscriptions.push(this.treeView = vscode_1.window.createTreeView("MdTableEditor.tableExplorer", {
            treeDataProvider: this.dataProvider
        }));
    }
    refresh(tables) {
        this.dataProvider.refresh(tables);
    }
}
exports.MdTableExplorer = MdTableExplorer;
//# sourceMappingURL=MdTableTreeView.js.map