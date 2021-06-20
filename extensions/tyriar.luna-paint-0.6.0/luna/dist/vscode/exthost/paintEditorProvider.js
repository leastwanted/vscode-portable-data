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
exports.setVscodeContext = exports.BuiltInCommands = exports.PaintEditorProvider = void 0;
const path_1 = require("path");
const vscode_1 = require("vscode");
const imageDocument_js_1 = require("./imageDocument.js");
const os_1 = require("os");
const fs_1 = require("fs");
const backup_js_1 = require("./backup.js");
const perf_hooks_1 = require("perf_hooks");
const supportedCommands = [
    "adjustments.invert",
    "edit.copy",
    "edit.cut",
    "edit.paste",
    "edit.redo",
    "edit.undo",
    "help.reportIssue",
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
    "image.addNewImage",
    "image.deleteImage",
    "image.goToTopImage",
    "image.goToImageAbove",
    "image.goToImageBelow",
    "image.goToBottomImage",
    "image.moveImageToTop",
    "image.moveImageUp",
    "image.moveImageDown",
    "image.moveImageToBottom",
    "layer.addNewLayer",
    "layer.deleteLayer",
    "layer.duplicateLayer",
    "layer.mergeLayerDown",
    "layer.renameLayer",
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
    "tool.crop",
    "tool.eraser",
    "tool.fill",
    "tool.hand",
    "tool.handUntilRelease",
    "tool.pencil",
    "tool.selection",
    "tool.zoom",
    "tool.line",
    "tool.rectangle",
    "tool.toggleShapeTool",
    "tool.movePixels",
    "tool.moveSelection",
    "tool.toggleMoveTool",
    "view.focusCanvas",
    "view.zoomIn",
    "view.zoomOut",
    "view.actualSize",
    "view.fitToWindow",
    "view.fitLayerToWindow",
    "history.toggleHistoryWindow",
    "image.toggleImagesWindow",
    "layer.toggleLayersWindow",
    "minimap.toggleMinimapWindow",
    "palette.togglePaletteWindow",
    "tool.toggleToolsWindow"
];
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';
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
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.file.new', (args) => __awaiter(this, void 0, void 0, function* () {
            const config = vscode_1.workspace.getConfiguration("luna.defaultImageSize", this._lastActiveResource);
            const defaultDimensions = {
                width: config.get('width', 800),
                height: config.get('height', 600)
            };
            const dimensions = yield this._requestNewImageDimensions(defaultDimensions, args);
            if (!dimensions) {
                return;
            }
            const newImageUri = this._getNewImageUri();
            this._newImageRequest.set(newImageUri.path, {
                width: dimensions.width,
                height: dimensions.height
            });
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        vscode_1.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('luna.mouseWheelBehavior')) {
                for (const ipcClient of this._webviewIpcClients.values()) {
                    ipcClient.request("updateConfig", this._getLunaConfig());
                }
            }
        });
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.file.newIcon', (args) => __awaiter(this, void 0, void 0, function* () {
            const defaultDimensions = {
                width: 256,
                height: 256
            };
            const dimensions = yield this._requestNewImageDimensions(defaultDimensions, args);
            if (!dimensions) {
                return;
            }
            const newImageUri = this._getNewImageUri("image/x-ico");
            this._newImageRequest.set(newImageUri.path, {
                width: dimensions.width,
                height: dimensions.height,
                extName: '.ico',
            });
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.file.importFromClipboard', () => __awaiter(this, void 0, void 0, function* () {
            const newImageUri = this._getNewImageUri();
            this._newImageRequest.set(newImageUri.path, 'clipboard');
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.file.newDefaultSize', () => __awaiter(this, void 0, void 0, function* () {
            const newImageUri = this._getNewImageUri();
            this._newImageRequest.set(newImageUri.path, this._getDefaultImageSize(newImageUri));
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.help.openDocumentation', () => __awaiter(this, void 0, void 0, function* () {
            vscode_1.commands.executeCommand('workbench.action.openWalkthrough', 'Tyriar.luna-paint#exampleProject', true);
        })));
        this._context.subscriptions.push(vscode_1.window.onDidChangeWindowState(state => {
            if (!state.focused) {
                for (const ipcClient of this._webviewIpcClients.values()) {
                    ipcClient.request("pauseanimations", void 0);
                }
            }
        }));
        this._context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(() => {
            this._mimeTypeStatusBarItem.hide();
        }));
        this._mimeTypeStatusBarItem = vscode_1.window.createStatusBarItem(vscode_1.StatusBarAlignment.Right);
    }
    saveCustomDocument(document, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const ipcClient = this._webviewIpcClients.get(document.uri.toString());
            if (!ipcClient) {
                return Promise.reject('No matching webview');
            }
            return document.save(ipcClient, cancellation);
        });
    }
    saveCustomDocumentAs(document, destination, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const ipcClient = this._webviewIpcClients.get(document.uri.toString());
            if (!ipcClient) {
                return Promise.reject('No matching webview');
            }
            yield document.saveAs(ipcClient, destination, cancellation);
        });
    }
    revertCustomDocument(document, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const ipcClient = this._webviewIpcClients.get(document.uri.toString());
            if (!ipcClient) {
                return Promise.reject('No matching webview');
            }
            const data = yield vscode_1.workspace.fs.readFile(document.uri);
            document.revert();
            yield ipcClient.request("open", {
                data,
                extName: path_1.extname(document.uri.path)
            });
        });
    }
    backupCustomDocument(document, context, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const ipcClient = this._webviewIpcClients.get(document.uri.toString());
            if (!ipcClient) {
                return Promise.reject('No matching webview');
            }
            try {
                return yield document.backup(ipcClient, context, cancellation);
            }
            catch (e) {
                console.error('Backup failed', e);
                throw e;
            }
        });
    }
    openCustomDocument(uri, openContext, token) {
        return __awaiter(this, void 0, void 0, function* () {
            let doc;
            doc = this._documents.get(uri.toString());
            if (doc) {
                return doc;
            }
            if (openContext.backupId) {
                const dataFileUri = vscode_1.Uri.parse(openContext.backupId);
                try {
                    const { state, workbenchState } = yield backup_js_1.getBackupData(dataFileUri);
                    if (state) {
                        doc = new imageDocument_js_1.ImageDocument(this._context, uri, {
                            type: 'restore',
                            config: this._getLunaConfig(),
                            state,
                            workbenchState,
                            restoreHistory: false
                        });
                    }
                    else {
                        vscode_1.window.showWarningMessage('The extension was updated, could not restore the image from backup');
                        doc = yield this._createOpenImageDocument(uri);
                    }
                }
                catch (_a) {
                    doc = yield this._createOpenImageDocument(uri);
                }
            }
            else {
                const newImageRequest = this._newImageRequest.get(uri.path);
                if (newImageRequest) {
                    if (newImageRequest === 'clipboard') {
                        doc = new imageDocument_js_1.ImageDocument(this._context, uri, {
                            type: 'newFromClipboard',
                            config: this._getLunaConfig(),
                            workbenchState: undefined,
                            fallbackDimensions: this._getDefaultImageSize(uri)
                        });
                    }
                    else {
                        doc = new imageDocument_js_1.ImageDocument(this._context, uri, {
                            type: 'new',
                            config: this._getLunaConfig(),
                            workbenchState: undefined,
                            dimensions: {
                                width: newImageRequest.width,
                                height: newImageRequest.height
                            },
                            extName: newImageRequest.extName
                        });
                    }
                    this._newImageRequest.delete(uri.path);
                }
                else {
                    doc = yield this._createOpenImageDocument(uri);
                }
            }
            doc.onDidChange(e => this._onDidChangeCustomDocument.fire(e));
            doc.onSetMimeType(e => {
                this._mimeTypeStatusBarItem.text = getMimeTypeLabel(e);
                this._mimeTypeStatusBarItem.tooltip = e;
                this._mimeTypeStatusBarItem.show();
            });
            this._documents.set(uri.toString(), doc);
            doc.onDisposed(() => this._documents.delete(uri.toString()));
            return doc;
        });
    }
    _getNewImageUri(mimeType = "image/png") {
        const workspaceFolders = vscode_1.workspace.workspaceFolders;
        let activeFolderUri;
        if (workspaceFolders && workspaceFolders.length > 0) {
            activeFolderUri = workspaceFolders[0].uri;
        }
        else {
            let candidateFolder;
            if (isWindows && process.env.USERPROFILE) {
                candidateFolder = path_1.join(process.env.USERPROFILE, 'Pictures');
            }
            else if (isMac || isLinux) {
                candidateFolder = path_1.join(os_1.homedir(), 'Pictures');
            }
            if (candidateFolder) {
                const exists = fs_1.existsSync(candidateFolder);
                if (!exists) {
                    candidateFolder = undefined;
                }
            }
            activeFolderUri = vscode_1.Uri.file(candidateFolder || os_1.homedir());
        }
        const ext = mimeType === "image/x-ico" ? 'ico' : 'png';
        return vscode_1.Uri.joinPath(activeFolderUri, `NewImage-${this._getUnusedNewImageId()}.${ext}`)
            .with({ scheme: 'untitled' });
    }
    _getUnusedNewImageId() {
        const uris = Array.from(this._documents.values()).map(e => e.uri);
        const untitledImageIds = uris
            .map(e => path_1.parse(e.path).name)
            .filter(e => e.match(/^NewImage-\d+$/))
            .map(e => parseInt(e.substr(9)));
        let numberCandidate = 1;
        while (untitledImageIds.includes(numberCandidate)) {
            numberCandidate++;
        }
        return numberCandidate;
    }
    _requestNewImageDimensions(defaultDimensions, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const width = (args === null || args === void 0 ? void 0 : args.width) || (yield vscode_1.window.showInputBox({
                prompt: 'Enter the width of the image',
                value: defaultDimensions.width.toString(),
                validateInput: validateNumberInput
            }));
            if (!width) {
                return;
            }
            const height = (args === null || args === void 0 ? void 0 : args.height) || (yield vscode_1.window.showInputBox({
                prompt: 'Enter the height of the image',
                value: defaultDimensions.height.toString(),
                validateInput: validateNumberInput
            }));
            if (!height) {
                return;
            }
            return {
                width: typeof width === 'number' ? width : parseInt(width),
                height: typeof height === 'number' ? height : parseInt(height)
            };
        });
    }
    _createOpenImageDocument(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const startTime = perf_hooks_1.performance.now();
                const data = yield vscode_1.workspace.fs.readFile(uri);
                if (data.length > 0) {
                    return new imageDocument_js_1.ImageDocument(this._context, uri, {
                        type: 'open',
                        config: this._getLunaConfig(),
                        workbenchState: undefined,
                        data,
                        extName: path_1.extname(uri.path),
                        isReadonly: !vscode_1.workspace.fs.isWritableFileSystem(uri.scheme)
                    }, startTime);
                }
            }
            catch (_a) {
            }
            return new imageDocument_js_1.ImageDocument(this._context, uri, {
                type: 'new',
                config: this._getLunaConfig(),
                workbenchState: undefined,
                dimensions: this._getDefaultImageSize(uri)
            });
        });
    }
    _getDefaultImageSize(uri) {
        const config = vscode_1.workspace.getConfiguration("luna.defaultImageSize", uri);
        return {
            width: config.get('width', 800),
            height: config.get('height', 600)
        };
    }
    resolveCustomEditor(document, webviewPanel, token) {
        const oldWebview = this._webviewPanels.get(document.uri.toString());
        oldWebview === null || oldWebview === void 0 ? void 0 : oldWebview.dispose();
        this._webviewPanels.set(document.uri.toString(), webviewPanel);
        const webview = webviewPanel.webview;
        webview.options = {
            enableScripts: true
        };
        webview.html = this._getHtml(webview);
        const ipcClient = document.setupIpc(webview);
        this._webviewIpcClients.set(document.uri.toString(), ipcClient);
        document.onRequestReload(() => __awaiter(this, void 0, void 0, function* () {
            const data = yield vscode_1.workspace.fs.readFile(document.uri);
            yield ipcClient.request("open", {
                data,
                extName: path_1.extname(document.uri.path)
            });
        }));
        webviewPanel.onDidChangeViewState(() => this._refreshActiveState(document, webviewPanel));
        webviewPanel.onDidDispose(() => this._handleWebviewBlur(document));
        this._refreshActiveState(document, webviewPanel);
    }
    _refreshActiveState(document, changedWebviewPanel) {
        if (changedWebviewPanel.active) {
            this._lastActiveResource = document.uri;
            this._mimeTypeStatusBarItem.show();
            setVscodeContext("luna:focused", changedWebviewPanel.active);
        }
        else {
            this._handleWebviewBlur(document);
        }
        document.isActive = changedWebviewPanel.active;
    }
    _getLunaConfig() {
        const config = {
            mouseWheelBehavior: vscode_1.workspace.getConfiguration(undefined, this._lastActiveResource).get("luna.mouseWheelBehavior") || 'scroll'
        };
        return config;
    }
    _handleWebviewBlur(document) {
        if (this._lastActiveResource === document.uri) {
            this._mimeTypeStatusBarItem.hide();
            setVscodeContext("luna:focused", false);
        }
    }
    _getHtml(webview) {
        const scriptUri = webview.asWebviewUri(vscode_1.Uri.file(path_1.join(this._context.extensionPath, 'luna/dist/vscode.main.js')));
        const mainStyleUri = webview.asWebviewUri(vscode_1.Uri.file(path_1.join(this._context.extensionPath, 'luna/dist/vscode.main.css')));
        const cspSource = webview.cspSource;
        return `
<!doctype html>
<html lang="en-US">
  <head>
    <title>Luna Paint</title>
    <meta http-equiv="Content-Security-Policy" content="script-src 'self' ${cspSource}; style-src-elem 'self' ${cspSource}; worker-src ${cspSource};">
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
function getMimeTypeLabel(mimeType) {
    switch (mimeType) {
        case "image/bmp": return 'BMP';
        case "image/x-ico": return 'ICO';
        case "image/jpeg": return 'JPEG';
        case "image/png": return 'PNG';
        case "image/webp": return 'WEBP';
    }
}
//# sourceMappingURL=paintEditorProvider.js.map