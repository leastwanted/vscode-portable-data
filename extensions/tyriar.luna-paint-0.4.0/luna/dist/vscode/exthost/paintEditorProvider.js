"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVscodeContext = exports.BuiltInCommands = exports.PaintEditorProvider = void 0;
const path_1 = require("path");
const v8_1 = require("v8");
const vscode_1 = require("vscode");
const imageDocument_js_1 = require("./imageDocument.js");
const supportedCommands = [
    "adjustments.invert",
    "edit.copy",
    "edit.cut",
    "edit.paste",
    "edit.redo",
    "edit.undo",
    "image.cropToSelection",
    "image.expandCanvasToSelection",
    "image.resize",
    "image.canvasSize",
    "image.flipHorizontal",
    "image.flipVertical",
    "image.rotate180",
    "image.rotate90Clockwise",
    "image.rotate90CounterClockwise",
    "image.flattenLayers",
    "image.finishActiveAction",
    "layer.addNewLayer",
    "layer.deleteLayer",
    "layer.mergeLayerDown",
    "layer.flipHorizontal",
    "layer.flipVertical",
    "layer.rotate180",
    "layer.goToTopLayer",
    "layer.goToLayerAbove",
    "layer.goToLayerBelow",
    "layer.goToBottomLayer",
    "layer.moveLayerToTop",
    "layer.moveLayerUp",
    "layer.moveLayerDown",
    "layer.moveLayerToBottom",
    "palette.swapColors",
    "selection.deselect",
    "selection.selectAll",
    "selection.erase",
    "tool.colorPicker",
    "tool.eraser",
    "tool.fill",
    "tool.movePixels",
    "tool.moveSelection",
    "tool.toggleMoveTool",
    "tool.pencil",
    "tool.rectangle",
    "tool.selection",
    "tool.zoom",
    "view.focusCanvas",
    "view.zoomIn",
    "view.zoomOut",
    "view.actualSize",
    "view.fitToWindow",
    "history.toggleHistoryWindow",
    "image.toggleImagesWindow",
    "layer.toggleLayersWindow",
    "minimap.toggleMinimapWindow",
    "palette.togglePaletteWindow",
    "tool.toggleToolsWindow"
];
class PaintEditorProvider {
    constructor(_context) {
        this._context = _context;
        this._onDidChangeCustomDocument = new vscode_1.EventEmitter();
        this.onDidChangeCustomDocument = this._onDidChangeCustomDocument.event;
        this._documents = new Map();
        this._webviewPanels = new Map();
        this._webviewIpcClients = new Map();
        this._newImageRequest = new Map();
        for (const commandId of supportedCommands) {
            this._context.subscriptions.push(vscode_1.commands.registerCommand(`luna.${commandId}`, () => {
                if (!this._lastActiveResource) {
                    return;
                }
                const ipcClient = this._webviewIpcClients.get(this._lastActiveResource.toString());
                if (!ipcClient) {
                    return;
                }
                return ipcClient.request("luna.executeCommand", commandId);
            }));
        }
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.file.new', async (args) => {
            const workspaceFolders = vscode_1.workspace.workspaceFolders;
            if (!workspaceFolders) {
                vscode_1.window.showErrorMessage('Creating new files currently requires opening a workspace');
                return;
            }
            const uri = vscode_1.Uri.joinPath(workspaceFolders[0].uri, `NewImage-${PaintEditorProvider._nextUntitledId++}.png`)
                .with({ scheme: 'untitled' });
            const config = vscode_1.workspace.getConfiguration('luna.defaultImageSize', this._lastActiveResource);
            const width = args?.width || await vscode_1.window.showInputBox({
                prompt: 'Enter the width of the image',
                value: config.get('width', 800).toString(),
                validateInput: validateNumberInput
            });
            if (!width) {
                return;
            }
            const height = args?.height || await vscode_1.window.showInputBox({
                prompt: 'Enter the height of the image',
                value: config.get('height', 600).toString(),
                validateInput: validateNumberInput
            });
            if (!height) {
                return;
            }
            this._newImageRequest.set(uri.path, {
                width: typeof width === 'number' ? width : parseInt(width),
                height: typeof height === 'number' ? height : parseInt(height)
            });
            vscode_1.commands.executeCommand('vscode.openWith', uri, PaintEditorProvider.viewType);
        }));
        this._context.subscriptions.push(vscode_1.window.onDidChangeWindowState(state => {
            if (!state.focused) {
                for (const ipcClient of this._webviewIpcClients.values()) {
                    ipcClient.request("pauseanimations", void 0);
                }
            }
        }));
    }
    async saveCustomDocument(document, cancellation) {
        const ipcClient = this._webviewIpcClients.get(document.uri.toString());
        if (!ipcClient) {
            return Promise.reject('No matching webview');
        }
        return document.save(ipcClient, cancellation);
    }
    async saveCustomDocumentAs(document, destination, cancellation) {
        const ipcClient = this._webviewIpcClients.get(document.uri.toString());
        if (!ipcClient) {
            return Promise.reject('No matching webview');
        }
        await document.saveAs(ipcClient, destination, cancellation);
    }
    async revertCustomDocument(document, cancellation) {
        const ipcClient = this._webviewIpcClients.get(document.uri.toString());
        if (!ipcClient) {
            return Promise.reject('No matching webview');
        }
        const data = await vscode_1.workspace.fs.readFile(document.uri);
        document.revert();
        await ipcClient.request("open", {
            data,
            extName: path_1.extname(document.uri.path)
        });
    }
    async backupCustomDocument(document, context, cancellation) {
        const ipcClient = this._webviewIpcClients.get(document.uri.toString());
        if (!ipcClient) {
            return Promise.reject('No matching webview');
        }
        return document.backup(ipcClient, context, cancellation);
    }
    async openCustomDocument(uri, openContext, token) {
        let doc;
        doc = this._documents.get(uri.toString());
        if (doc) {
            return doc;
        }
        if (openContext.backupId) {
            const dataFileUri = vscode_1.Uri.parse(openContext.backupId);
            try {
                const serializedData = await vscode_1.workspace.fs.readFile(dataFileUri);
                const deserializer = new v8_1.Deserializer(serializedData);
                const state = deserializer.readValue();
                if (state.version === 4) {
                    doc = new imageDocument_js_1.ImageDocument(this._context, uri, { type: 'restore', state, restoreHistory: false });
                }
                else {
                    vscode_1.window.showWarningMessage('The extension was updated, could not restore the image from backup');
                    doc = await this._createOpenImageDocument(uri);
                }
            }
            catch {
                doc = await this._createOpenImageDocument(uri);
            }
        }
        else {
            const newImageRequest = this._newImageRequest.get(uri.path);
            if (newImageRequest) {
                doc = new imageDocument_js_1.ImageDocument(this._context, uri, { type: 'new', dimensions: newImageRequest });
            }
            else {
                doc = await this._createOpenImageDocument(uri);
            }
        }
        doc.onDidChange(e => this._onDidChangeCustomDocument.fire(e));
        this._documents.set(uri.toString(), doc);
        return doc;
    }
    async _createOpenImageDocument(uri) {
        const data = await vscode_1.workspace.fs.readFile(uri);
        if (data.length === 0) {
            const config = vscode_1.workspace.getConfiguration('luna.defaultImageSize', uri);
            return new imageDocument_js_1.ImageDocument(this._context, uri, {
                type: 'new',
                dimensions: {
                    width: config.get('width', 800),
                    height: config.get('height', 600)
                }
            });
        }
        return new imageDocument_js_1.ImageDocument(this._context, uri, { type: 'open', data, extName: path_1.extname(uri.path) });
    }
    resolveCustomEditor(document, webviewPanel, token) {
        const oldWebview = this._webviewPanels.get(document.uri.toString());
        oldWebview?.dispose();
        this._webviewPanels.set(document.uri.toString(), webviewPanel);
        const webview = webviewPanel.webview;
        webview.options = {
            enableScripts: true
        };
        webview.html = this._getHtml(webview);
        const ipcClient = document.setupIpc(webview);
        this._webviewIpcClients.set(document.uri.toString(), ipcClient);
        document.onRequestReload(async () => {
            const data = await vscode_1.workspace.fs.readFile(document.uri);
            await ipcClient.request("open", {
                data,
                extName: path_1.extname(document.uri.path)
            });
        });
        webviewPanel.onDidChangeViewState(() => this._refreshActiveState(document, webviewPanel));
        this._refreshActiveState(document, webviewPanel);
    }
    _refreshActiveState(document, changedWebviewPanel) {
        if (changedWebviewPanel.active) {
            this._lastActiveResource = document.uri;
            setVscodeContext("luna:focused", changedWebviewPanel.active);
        }
        else {
            if (this._lastActiveResource === document.uri) {
                setVscodeContext("luna:focused", changedWebviewPanel.active);
            }
        }
        document.isActive = changedWebviewPanel.active;
    }
    _getHtml(webview) {
        const scriptUri = webview.asWebviewUri(vscode_1.Uri.file(path_1.join(this._context.extensionPath, 'luna/dist/vscode.main.js')));
        const baseStyleUri = webview.asWebviewUri(vscode_1.Uri.file(path_1.join(this._context.extensionPath, 'luna/assets/base.css')));
        const mainStyleUri = webview.asWebviewUri(vscode_1.Uri.file(path_1.join(this._context.extensionPath, 'luna/dist/vscode.main.css')));
        const cspSource = webview.cspSource;
        return `
<!doctype html>
<html lang="en-US">
  <head>
    <title>Luna Paint</title>
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' ${cspSource}; style-src-elem 'self' ${cspSource}; worker-src ${cspSource};">
    <link rel="stylesheet" href="${baseStyleUri}">
    <link rel="stylesheet" href="${mainStyleUri}">
  </head>
  <body>
    <div id="top"></div>
    <div id="middle">
      <div id="canvas"></div>
      <div id="gui"></div>
    </div>
    <div id="bottom"></div>
    <script type="module" src="${scriptUri}" defer></script>
  </body>
</html>`;
    }
}
exports.PaintEditorProvider = PaintEditorProvider;
PaintEditorProvider.viewType = 'luna.editor';
PaintEditorProvider._nextUntitledId = 1;
var BuiltInCommands;
(function (BuiltInCommands) {
    BuiltInCommands["SetContext"] = "setContext";
})(BuiltInCommands = exports.BuiltInCommands || (exports.BuiltInCommands = {}));
function setVscodeContext(key, value) {
    return vscode_1.commands.executeCommand(BuiltInCommands.SetContext, key, value);
}
exports.setVscodeContext = setVscodeContext;
function validateNumberInput(value, minValue, maxValue) {
    if (!value.match(/^[0-9]+$/)) {
        return 'Enter a valid number';
    }
    if (minValue !== undefined && parseInt(value) < minValue) {
        return `Enter a number greater than or equal to ${minValue}`;
    }
    if (maxValue !== undefined && parseInt(value) > maxValue) {
        return `Enter a number less than or equal to ${maxValue}`;
    }
    return undefined;
}
//# sourceMappingURL=paintEditorProvider.js.map