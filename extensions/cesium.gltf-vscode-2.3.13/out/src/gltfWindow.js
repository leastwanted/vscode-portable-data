"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GltfWindow = void 0;
const vscode = require("vscode");
const gltfPreview_1 = require("./gltfPreview");
const gltfInspectData_1 = require("./gltfInspectData");
const gltfOutline_1 = require("./gltfOutline");
function isGltfFile(editor) {
    return editor && editor.document.fileName.toLowerCase().endsWith('.gltf');
}
class GltfWindow {
    constructor(context) {
        this._onDidChangeActiveTextEditor = new vscode.EventEmitter();
        /**
         * Event that is fired when the active glTF editor has changed.
         */
        this.onDidChangeActiveTextEditor = this._onDidChangeActiveTextEditor.event;
        this._gltfPreview = new gltfPreview_1.GltfPreview(context);
        this._gltfOutline = new gltfOutline_1.GltfOutline(context, this);
        vscode.window.registerTreeDataProvider('gltfOutline', this._gltfOutline);
        this._gltfInspectData = new gltfInspectData_1.GltfInspectData(context, this);
        this._gltfInspectData.setTreeView(vscode.window.createTreeView('gltfInspectData', { treeDataProvider: this._gltfInspectData }));
        vscode.window.onDidChangeActiveTextEditor(() => {
            // Wait a frame before updating to ensure all window states are updated.
            setImmediate(() => this.update());
        });
        this._gltfPreview.onDidChangeActivePanel(() => {
            // Wait a frame before updating to ensure all window states are updated.
            setImmediate(() => this.update());
        });
        this.update();
    }
    /**
     * The active text editor of the vscode window editing a glTF or the text editor of the active glTF preview panel.
     */
    get activeTextEditor() {
        return this._activeTextEditor;
    }
    get preview() {
        return this._gltfPreview;
    }
    get inspectData() {
        return this._gltfInspectData;
    }
    get outline() {
        return this._gltfOutline;
    }
    update() {
        let gltfPreviewActive = false;
        let gltfFileActive = false;
        let activeTextEditor = this._gltfPreview.activePanel && this._gltfPreview.activePanel.textEditor;
        if (activeTextEditor) {
            gltfPreviewActive = true;
        }
        else if (isGltfFile(vscode.window.activeTextEditor)) {
            activeTextEditor = vscode.window.activeTextEditor;
            gltfFileActive = true;
        }
        vscode.commands.executeCommand('setContext', 'gltfPreviewActive', gltfPreviewActive);
        vscode.commands.executeCommand('setContext', 'gltfFileActive', gltfFileActive);
        vscode.commands.executeCommand('setContext', 'gltfActive', gltfPreviewActive || gltfFileActive);
        if (this._activeTextEditor !== activeTextEditor) {
            this._activeTextEditor = activeTextEditor;
            this._onDidChangeActiveTextEditor.fire(activeTextEditor);
        }
    }
}
exports.GltfWindow = GltfWindow;
//# sourceMappingURL=gltfWindow.js.map