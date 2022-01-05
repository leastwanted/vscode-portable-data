(function(e, a) { for(var i in a) e[i] = a[i]; if(a.__esModule) Object.defineProperty(e, "__esModule", { value: true }); }(exports,
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ([
/* 0 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const extension_1 = __webpack_require__(1);
function activate(context) {
    (0, extension_1.activate)(context);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map

/***/ }),
/* 1 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deactivate = exports.activate = void 0;
const vscode = __webpack_require__(2);
const paintEditorProvider_1 = __webpack_require__(3);
function activate(context) {
    const retainContextWhenHidden = vscode.workspace.getConfiguration('luna').get('retainContextWhenHidden');
    context.subscriptions.push(vscode.window.registerCustomEditorProvider(paintEditorProvider_1.PaintEditorProvider.viewType, new paintEditorProvider_1.PaintEditorProvider(context), {
        webviewOptions: { retainContextWhenHidden }
    }));
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map

/***/ }),
/* 2 */
/***/ ((module) => {

"use strict";
module.exports = require("vscode");;

/***/ }),
/* 3 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setVscodeContext = exports.BuiltInCommands = exports.PaintEditorProvider = void 0;
const path_1 = __webpack_require__(4);
const vscode_1 = __webpack_require__(2);
const imageDocument_js_1 = __webpack_require__(5);
const os_1 = __webpack_require__(15);
const backup_js_1 = __webpack_require__(6);
const platform_js_1 = __webpack_require__(7);
const state_js_1 = __webpack_require__(8);
const performance_js_1 = __webpack_require__(13);
const supportedCommands = [
    "adjustments.invert",
    "color.swapColors",
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
    "image.customizePointerColorStatusBarItem",
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
    "selection.deselect",
    "selection.selectAll",
    "selection.erase",
    "selection.eraseKeepSelection",
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
    "tool.shape",
    "tool.text",
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
    "color.toggleColorsWindow",
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
            const newImageUri = yield this._getNewImageUri();
            this._newImageRequest.set(newImageUri.path, {
                width: dimensions.width,
                height: dimensions.height
            });
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        vscode_1.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('luna')) {
                const config = this._getLunaConfig();
                for (const ipcClient of this._webviewIpcClients.values()) {
                    ipcClient.request("updateConfig", config);
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
            const newImageUri = yield this._getNewImageUri("image/x-ico");
            this._newImageRequest.set(newImageUri.path, {
                width: dimensions.width,
                height: dimensions.height,
                extName: '.ico',
            });
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.file.importFromClipboard', () => __awaiter(this, void 0, void 0, function* () {
            const newImageUri = yield this._getNewImageUri();
            this._newImageRequest.set(newImageUri.path, 'clipboard');
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.file.newDefaultSize', () => __awaiter(this, void 0, void 0, function* () {
            const newImageUri = yield this._getNewImageUri();
            this._newImageRequest.set(newImageUri.path, this._getDefaultImageSize(newImageUri));
            vscode_1.commands.executeCommand('vscode.openWith', newImageUri, PaintEditorProvider.viewType);
        })));
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.help.openDocumentation', () => __awaiter(this, void 0, void 0, function* () {
            vscode_1.commands.executeCommand('workbench.action.openWalkthrough', 'Tyriar.luna-paint#exampleProject', true);
        })));
        this._context.subscriptions.push(vscode_1.commands.registerCommand('luna.help.hideAutoSaveWarning', () => __awaiter(this, void 0, void 0, function* () {
            var _a;
            (_a = this._autoSaveWarningStatusBarItem) === null || _a === void 0 ? void 0 : _a.dispose();
            this._autoSaveWarningStatusBarItem = undefined;
        })));
        this._context.subscriptions.push(vscode_1.window.onDidChangeWindowState(state => {
            if (!state.focused) {
                for (const ipcClient of this._webviewIpcClients.values()) {
                    ipcClient.request("pauseanimations", void 0);
                }
            }
        }));
        this._context.subscriptions.push(vscode_1.window.onDidChangeActiveTextEditor(() => {
            var _a;
            this._mimeTypeStatusBarItem.hide();
            (_a = this._autoSaveWarningStatusBarItem) === null || _a === void 0 ? void 0 : _a.hide();
        }));
        this._mimeTypeStatusBarItem = vscode_1.window.createStatusBarItem('luna-paint.mimeType', vscode_1.StatusBarAlignment.Right);
        this._mimeTypeStatusBarItem.name = 'Luna Paint - Mime Type';
        this._autoSaveWarningStatusBarItem = vscode_1.window.createStatusBarItem('luna-paint.autoSaveWarning', vscode_1.StatusBarAlignment.Right);
        this._autoSaveWarningStatusBarItem.name = 'Luna Paint - Auto Save Warning';
        this._autoSaveWarningStatusBarItem.text = '$(warning) Auto Save is On';
        this._autoSaveWarningStatusBarItem.backgroundColor = new vscode_1.ThemeColor('statusBarItem.warningBackground');
        this._autoSaveWarningStatusBarItem.color = new vscode_1.ThemeColor('statusBarItem.warningForeground');
        this._autoSaveWarningStatusBarItem.tooltip = 'Auto save after delay is enabled which may cause performance issues while editing the image. Click to dismiss this warning for this session, right click to hide it permanently.';
        this._autoSaveWarningStatusBarItem.command = 'luna.help.hideAutoSaveWarning';
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
                extName: (0, path_1.extname)(document.uri.path)
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
                    const { state, workbenchState } = yield (0, backup_js_1.getBackupData)(this._context, dataFileUri);
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
                            workbenchState: (0, state_js_1.getGlobalState)(this._context),
                            fallbackDimensions: this._getDefaultImageSize(uri)
                        });
                    }
                    else {
                        doc = new imageDocument_js_1.ImageDocument(this._context, uri, {
                            type: 'new',
                            config: this._getLunaConfig(),
                            workbenchState: (0, state_js_1.getGlobalState)(this._context),
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
            const thisDoc = doc;
            doc.onDidUpdateGlobalState(e => this._syncGlobalState(e, thisDoc));
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
    _syncGlobalState(globalState, sourceDocument) {
        if (this._documents.size === 1) {
            return;
        }
        for (const doc of this._documents.values()) {
            if (doc === sourceDocument) {
                continue;
            }
            const ipcClient = this._webviewIpcClients.get(doc.uri.toString());
            if (!ipcClient) {
                return;
            }
            doc.syncGlobalState(ipcClient, globalState);
        }
    }
    _getNewImageUri(mimeType = "image/png") {
        return __awaiter(this, void 0, void 0, function* () {
            const workspaceFolders = vscode_1.workspace.workspaceFolders;
            let activeFolderUri;
            if (workspaceFolders && workspaceFolders.length > 0) {
                activeFolderUri = workspaceFolders[0].uri;
            }
            else {
                let candidateFolder;
                if (platform_js_1.isWindows && !platform_js_1.isWeb && process.env.USERPROFILE) {
                    candidateFolder = (0, path_1.join)(process.env.USERPROFILE, 'Pictures');
                }
                else if (platform_js_1.isMac || platform_js_1.isLinux) {
                    candidateFolder = (0, path_1.join)((0, os_1.homedir)(), 'Pictures');
                }
                if (candidateFolder) {
                    const uri = vscode_1.Uri.from({
                        scheme: this._context.extensionUri.scheme,
                        path: candidateFolder
                    });
                    try {
                        yield vscode_1.workspace.fs.stat(uri);
                    }
                    catch (_a) {
                        candidateFolder = undefined;
                    }
                }
                activeFolderUri = vscode_1.Uri.from({
                    scheme: this._context.extensionUri.scheme,
                    path: candidateFolder || (0, os_1.homedir)()
                });
            }
            const ext = mimeType === "image/x-ico" ? 'ico' : 'png';
            return vscode_1.Uri.joinPath(activeFolderUri, `NewImage-${this._getUnusedNewImageId()}.${ext}`)
                .with({ scheme: 'untitled' });
        });
    }
    _getUnusedNewImageId() {
        const uris = Array.from(this._documents.values()).map(e => e.uri);
        const untitledImageIds = uris
            .map(e => (0, path_1.parse)(e.path).name)
            .filter(e => e.match(/^NewImage-\d+$/))
            .map(e => parseInt(e.substring(9)));
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
                const startTime = performance_js_1.perf.now();
                const data = new Uint8Array(yield vscode_1.workspace.fs.readFile(uri));
                if (data.length > 0) {
                    return new imageDocument_js_1.ImageDocument(this._context, uri, {
                        type: 'open',
                        config: this._getLunaConfig(),
                        workbenchState: (0, state_js_1.getGlobalState)(this._context),
                        data,
                        extName: (0, path_1.extname)(uri.path),
                        isReadonly: !vscode_1.workspace.fs.isWritableFileSystem(uri.scheme)
                    }, startTime);
                }
            }
            catch (_a) {
            }
            return new imageDocument_js_1.ImageDocument(this._context, uri, {
                type: 'new',
                config: this._getLunaConfig(),
                workbenchState: (0, state_js_1.getGlobalState)(this._context),
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
                extName: (0, path_1.extname)(document.uri.path)
            });
        }));
        webviewPanel.onDidChangeViewState(() => this._refreshActiveState(document, webviewPanel));
        webviewPanel.onDidDispose(() => this._handleWebviewBlur(document));
        this._refreshActiveState(document, webviewPanel);
        webviewPanel.reveal();
    }
    _refreshActiveState(document, changedWebviewPanel) {
        var _a;
        if (changedWebviewPanel.active) {
            this._lastActiveResource = document.uri;
            this._mimeTypeStatusBarItem.show();
            if (vscode_1.workspace.getConfiguration('files', this._lastActiveResource).get('autoSave') === 'afterDelay') {
                (_a = this._autoSaveWarningStatusBarItem) === null || _a === void 0 ? void 0 : _a.show();
            }
            setVscodeContext("luna:focused", changedWebviewPanel.active);
        }
        else {
            this._handleWebviewBlur(document);
        }
        document.isActive = changedWebviewPanel.active;
    }
    _getLunaConfig() {
        var _a, _b, _c;
        const config = vscode_1.workspace.getConfiguration(undefined, this._lastActiveResource);
        return {
            mouseWheelBehavior: (_a = config.get("luna.mouseWheelBehavior")) !== null && _a !== void 0 ? _a : 'scroll',
            snapToPixelGrid: (_b = config.get("luna.snapToPixelGrid")) !== null && _b !== void 0 ? _b : true,
            statusBarPointerColor: (_c = config.get("luna.statusBar.pointerColor")) !== null && _c !== void 0 ? _c : 'currentLayer',
        };
    }
    _handleWebviewBlur(document) {
        var _a;
        if (this._lastActiveResource === document.uri) {
            this._mimeTypeStatusBarItem.hide();
            (_a = this._autoSaveWarningStatusBarItem) === null || _a === void 0 ? void 0 : _a.hide();
            setVscodeContext("luna:focused", false);
        }
    }
    _getHtml(webview) {
        const scriptUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._context.extensionUri, 'luna/dist/vscode.main.js'));
        const mainStyleUri = webview.asWebviewUri(vscode_1.Uri.joinPath(this._context.extensionUri, 'luna/dist/vscode.main.css'));
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
        case "image/webp":
        case "image/webplossless": return 'WEBP';
    }
}
//# sourceMappingURL=paintEditorProvider.js.map

/***/ }),
/* 4 */
/***/ ((module) => {

"use strict";
// 'path' module extracted from Node.js v8.11.1 (only the posix part)
// transplited with Babel

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



function assertPath(path) {
  if (typeof path !== 'string') {
    throw new TypeError('Path must be a string. Received ' + JSON.stringify(path));
  }
}

// Resolves . and .. elements in a path with directory names
function normalizeStringPosix(path, allowAboveRoot) {
  var res = '';
  var lastSegmentLength = 0;
  var lastSlash = -1;
  var dots = 0;
  var code;
  for (var i = 0; i <= path.length; ++i) {
    if (i < path.length)
      code = path.charCodeAt(i);
    else if (code === 47 /*/*/)
      break;
    else
      code = 47 /*/*/;
    if (code === 47 /*/*/) {
      if (lastSlash === i - 1 || dots === 1) {
        // NOOP
      } else if (lastSlash !== i - 1 && dots === 2) {
        if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 /*.*/ || res.charCodeAt(res.length - 2) !== 46 /*.*/) {
          if (res.length > 2) {
            var lastSlashIndex = res.lastIndexOf('/');
            if (lastSlashIndex !== res.length - 1) {
              if (lastSlashIndex === -1) {
                res = '';
                lastSegmentLength = 0;
              } else {
                res = res.slice(0, lastSlashIndex);
                lastSegmentLength = res.length - 1 - res.lastIndexOf('/');
              }
              lastSlash = i;
              dots = 0;
              continue;
            }
          } else if (res.length === 2 || res.length === 1) {
            res = '';
            lastSegmentLength = 0;
            lastSlash = i;
            dots = 0;
            continue;
          }
        }
        if (allowAboveRoot) {
          if (res.length > 0)
            res += '/..';
          else
            res = '..';
          lastSegmentLength = 2;
        }
      } else {
        if (res.length > 0)
          res += '/' + path.slice(lastSlash + 1, i);
        else
          res = path.slice(lastSlash + 1, i);
        lastSegmentLength = i - lastSlash - 1;
      }
      lastSlash = i;
      dots = 0;
    } else if (code === 46 /*.*/ && dots !== -1) {
      ++dots;
    } else {
      dots = -1;
    }
  }
  return res;
}

function _format(sep, pathObject) {
  var dir = pathObject.dir || pathObject.root;
  var base = pathObject.base || (pathObject.name || '') + (pathObject.ext || '');
  if (!dir) {
    return base;
  }
  if (dir === pathObject.root) {
    return dir + base;
  }
  return dir + sep + base;
}

var posix = {
  // path.resolve([from ...], to)
  resolve: function resolve() {
    var resolvedPath = '';
    var resolvedAbsolute = false;
    var cwd;

    for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
      var path;
      if (i >= 0)
        path = arguments[i];
      else {
        if (cwd === undefined)
          cwd = process.cwd();
        path = cwd;
      }

      assertPath(path);

      // Skip empty entries
      if (path.length === 0) {
        continue;
      }

      resolvedPath = path + '/' + resolvedPath;
      resolvedAbsolute = path.charCodeAt(0) === 47 /*/*/;
    }

    // At this point the path should be resolved to a full absolute path, but
    // handle relative paths to be safe (might happen when process.cwd() fails)

    // Normalize the path
    resolvedPath = normalizeStringPosix(resolvedPath, !resolvedAbsolute);

    if (resolvedAbsolute) {
      if (resolvedPath.length > 0)
        return '/' + resolvedPath;
      else
        return '/';
    } else if (resolvedPath.length > 0) {
      return resolvedPath;
    } else {
      return '.';
    }
  },

  normalize: function normalize(path) {
    assertPath(path);

    if (path.length === 0) return '.';

    var isAbsolute = path.charCodeAt(0) === 47 /*/*/;
    var trailingSeparator = path.charCodeAt(path.length - 1) === 47 /*/*/;

    // Normalize the path
    path = normalizeStringPosix(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += '/';

    if (isAbsolute) return '/' + path;
    return path;
  },

  isAbsolute: function isAbsolute(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47 /*/*/;
  },

  join: function join() {
    if (arguments.length === 0)
      return '.';
    var joined;
    for (var i = 0; i < arguments.length; ++i) {
      var arg = arguments[i];
      assertPath(arg);
      if (arg.length > 0) {
        if (joined === undefined)
          joined = arg;
        else
          joined += '/' + arg;
      }
    }
    if (joined === undefined)
      return '.';
    return posix.normalize(joined);
  },

  relative: function relative(from, to) {
    assertPath(from);
    assertPath(to);

    if (from === to) return '';

    from = posix.resolve(from);
    to = posix.resolve(to);

    if (from === to) return '';

    // Trim any leading backslashes
    var fromStart = 1;
    for (; fromStart < from.length; ++fromStart) {
      if (from.charCodeAt(fromStart) !== 47 /*/*/)
        break;
    }
    var fromEnd = from.length;
    var fromLen = fromEnd - fromStart;

    // Trim any leading backslashes
    var toStart = 1;
    for (; toStart < to.length; ++toStart) {
      if (to.charCodeAt(toStart) !== 47 /*/*/)
        break;
    }
    var toEnd = to.length;
    var toLen = toEnd - toStart;

    // Compare paths to find the longest common path from root
    var length = fromLen < toLen ? fromLen : toLen;
    var lastCommonSep = -1;
    var i = 0;
    for (; i <= length; ++i) {
      if (i === length) {
        if (toLen > length) {
          if (to.charCodeAt(toStart + i) === 47 /*/*/) {
            // We get here if `from` is the exact base path for `to`.
            // For example: from='/foo/bar'; to='/foo/bar/baz'
            return to.slice(toStart + i + 1);
          } else if (i === 0) {
            // We get here if `from` is the root
            // For example: from='/'; to='/foo'
            return to.slice(toStart + i);
          }
        } else if (fromLen > length) {
          if (from.charCodeAt(fromStart + i) === 47 /*/*/) {
            // We get here if `to` is the exact base path for `from`.
            // For example: from='/foo/bar/baz'; to='/foo/bar'
            lastCommonSep = i;
          } else if (i === 0) {
            // We get here if `to` is the root.
            // For example: from='/foo'; to='/'
            lastCommonSep = 0;
          }
        }
        break;
      }
      var fromCode = from.charCodeAt(fromStart + i);
      var toCode = to.charCodeAt(toStart + i);
      if (fromCode !== toCode)
        break;
      else if (fromCode === 47 /*/*/)
        lastCommonSep = i;
    }

    var out = '';
    // Generate the relative path based on the path difference between `to`
    // and `from`
    for (i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i) {
      if (i === fromEnd || from.charCodeAt(i) === 47 /*/*/) {
        if (out.length === 0)
          out += '..';
        else
          out += '/..';
      }
    }

    // Lastly, append the rest of the destination (`to`) path that comes after
    // the common path parts
    if (out.length > 0)
      return out + to.slice(toStart + lastCommonSep);
    else {
      toStart += lastCommonSep;
      if (to.charCodeAt(toStart) === 47 /*/*/)
        ++toStart;
      return to.slice(toStart);
    }
  },

  _makeLong: function _makeLong(path) {
    return path;
  },

  dirname: function dirname(path) {
    assertPath(path);
    if (path.length === 0) return '.';
    var code = path.charCodeAt(0);
    var hasRoot = code === 47 /*/*/;
    var end = -1;
    var matchedSlash = true;
    for (var i = path.length - 1; i >= 1; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          if (!matchedSlash) {
            end = i;
            break;
          }
        } else {
        // We saw the first non-path separator
        matchedSlash = false;
      }
    }

    if (end === -1) return hasRoot ? '/' : '.';
    if (hasRoot && end === 1) return '//';
    return path.slice(0, end);
  },

  basename: function basename(path, ext) {
    if (ext !== undefined && typeof ext !== 'string') throw new TypeError('"ext" argument must be a string');
    assertPath(path);

    var start = 0;
    var end = -1;
    var matchedSlash = true;
    var i;

    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
      if (ext.length === path.length && ext === path) return '';
      var extIdx = ext.length - 1;
      var firstNonSlashEnd = -1;
      for (i = path.length - 1; i >= 0; --i) {
        var code = path.charCodeAt(i);
        if (code === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else {
          if (firstNonSlashEnd === -1) {
            // We saw the first non-path separator, remember this index in case
            // we need it if the extension ends up not matching
            matchedSlash = false;
            firstNonSlashEnd = i + 1;
          }
          if (extIdx >= 0) {
            // Try to match the explicit extension
            if (code === ext.charCodeAt(extIdx)) {
              if (--extIdx === -1) {
                // We matched the extension, so mark this as the end of our path
                // component
                end = i;
              }
            } else {
              // Extension does not match, so our result is the entire path
              // component
              extIdx = -1;
              end = firstNonSlashEnd;
            }
          }
        }
      }

      if (start === end) end = firstNonSlashEnd;else if (end === -1) end = path.length;
      return path.slice(start, end);
    } else {
      for (i = path.length - 1; i >= 0; --i) {
        if (path.charCodeAt(i) === 47 /*/*/) {
            // If we reached a path separator that was not part of a set of path
            // separators at the end of the string, stop now
            if (!matchedSlash) {
              start = i + 1;
              break;
            }
          } else if (end === -1) {
          // We saw the first non-path separator, mark this as the end of our
          // path component
          matchedSlash = false;
          end = i + 1;
        }
      }

      if (end === -1) return '';
      return path.slice(start, end);
    }
  },

  extname: function extname(path) {
    assertPath(path);
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;
    for (var i = path.length - 1; i >= 0; --i) {
      var code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1)
            startDot = i;
          else if (preDotState !== 1)
            preDotState = 1;
      } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
        // We saw a non-dot character immediately before the dot
        preDotState === 0 ||
        // The (right-most) trimmed path component is exactly '..'
        preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      return '';
    }
    return path.slice(startDot, end);
  },

  format: function format(pathObject) {
    if (pathObject === null || typeof pathObject !== 'object') {
      throw new TypeError('The "pathObject" argument must be of type Object. Received type ' + typeof pathObject);
    }
    return _format('/', pathObject);
  },

  parse: function parse(path) {
    assertPath(path);

    var ret = { root: '', dir: '', base: '', ext: '', name: '' };
    if (path.length === 0) return ret;
    var code = path.charCodeAt(0);
    var isAbsolute = code === 47 /*/*/;
    var start;
    if (isAbsolute) {
      ret.root = '/';
      start = 1;
    } else {
      start = 0;
    }
    var startDot = -1;
    var startPart = 0;
    var end = -1;
    var matchedSlash = true;
    var i = path.length - 1;

    // Track the state of characters (if any) we see before our first dot and
    // after any path separator we find
    var preDotState = 0;

    // Get non-dir info
    for (; i >= start; --i) {
      code = path.charCodeAt(i);
      if (code === 47 /*/*/) {
          // If we reached a path separator that was not part of a set of path
          // separators at the end of the string, stop now
          if (!matchedSlash) {
            startPart = i + 1;
            break;
          }
          continue;
        }
      if (end === -1) {
        // We saw the first non-path separator, mark this as the end of our
        // extension
        matchedSlash = false;
        end = i + 1;
      }
      if (code === 46 /*.*/) {
          // If this is our first dot, mark it as the start of our extension
          if (startDot === -1) startDot = i;else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
        // We saw a non-dot and non-path separator before our dot, so we should
        // have a good chance at having a non-empty extension
        preDotState = -1;
      }
    }

    if (startDot === -1 || end === -1 ||
    // We saw a non-dot character immediately before the dot
    preDotState === 0 ||
    // The (right-most) trimmed path component is exactly '..'
    preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
      if (end !== -1) {
        if (startPart === 0 && isAbsolute) ret.base = ret.name = path.slice(1, end);else ret.base = ret.name = path.slice(startPart, end);
      }
    } else {
      if (startPart === 0 && isAbsolute) {
        ret.name = path.slice(1, startDot);
        ret.base = path.slice(1, end);
      } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
      }
      ret.ext = path.slice(startDot, end);
    }

    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);else if (isAbsolute) ret.dir = '/';

    return ret;
  },

  sep: '/',
  delimiter: ':',
  win32: null,
  posix: null
};

posix.posix = posix;

module.exports = posix;


/***/ }),
/* 5 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.setVscodeContext = exports.BuiltInCommands = exports.ImageDocument = void 0;
const path_1 = __webpack_require__(4);
const vscode_1 = __webpack_require__(2);
const backup_js_1 = __webpack_require__(6);
const ipcWebview_1 = __webpack_require__(10);
const lifecycle_js_1 = __webpack_require__(12);
const performance_js_1 = __webpack_require__(13);
const state_js_1 = __webpack_require__(8);
class ImageDocument extends lifecycle_js_1.Disposable {
    constructor(_context, uri, _initData, documentCreatedTime) {
        var _a;
        super();
        this._context = _context;
        this.uri = uri;
        this._initData = _initData;
        this._isInitialized = false;
        this._editIndex = 0;
        this._savedEditIndex = 0;
        this._hasContentChanged = false;
        this._fileWatcherDisposables = [];
        this._isActive = false;
        this._globalState = new Map();
        this._workbenchState = new Map();
        this._perfMetrics = {
            startEvent: 0,
            webviewReadyEvent: 0,
            dataReadyEvent: 0,
            finishEvent: 0,
            totalDuration: 0,
            parseDuration: 0,
            dataTransportDuration: 0,
        };
        this._onDisposed = new vscode_1.EventEmitter();
        this.onDisposed = this._onDisposed.event;
        this._onDidChange = new vscode_1.EventEmitter();
        this.onDidChange = this._onDidChange.event;
        this._onDidUpdateGlobalState = new vscode_1.EventEmitter();
        this.onDidUpdateGlobalState = this._onDidUpdateGlobalState.event;
        this._onRequestReload = new vscode_1.EventEmitter();
        this.onRequestReload = this._onRequestReload.event;
        this._onMimeTypeChange = new vscode_1.EventEmitter();
        this.onSetMimeType = this._onMimeTypeChange.event;
        if (((_a = this._initData.workbenchState) === null || _a === void 0 ? void 0 : _a.version) === 3) {
            for (const entry of this._initData.workbenchState.entries) {
                this._workbenchState.set(entry.id, entry.state);
            }
        }
        this._perfMetrics.startEvent = documentCreatedTime !== undefined ? documentCreatedTime : performance_js_1.perf.now();
        this._setupFileWatcher(uri);
    }
    get isActive() { return this._isActive; }
    set isActive(value) {
        this._isActive = value;
        if (this._isActive && this._hasContentChanged) {
            this._showContentChangedWarning();
        }
    }
    get _isDirty() { return this._editIndex !== this._savedEditIndex; }
    dispose() {
        const workspaceState = this._context.workspaceState.get('workbenchState');
        if (workspaceState && this.uri.toString() in workspaceState) {
            delete workspaceState[this.uri.toString()];
            this._context.workspaceState.update('workbenchState', workspaceState);
        }
        this._onDisposed.fire();
        super.dispose();
    }
    _setupFileWatcher(uri) {
        var _a;
        if (((_a = this._fileWatcherUri) === null || _a === void 0 ? void 0 : _a.toString()) === uri.toString()) {
            return;
        }
        this._fileWatcherUri = uri;
        (0, lifecycle_js_1.disposeArray)(this._fileWatcherDisposables);
        const watcher = vscode_1.workspace.createFileSystemWatcher(this._fileWatcherUri.fsPath);
        this._fileWatcherDisposables.push(watcher);
        this._fileWatcherDisposables.push(watcher.onDidChange(() => __awaiter(this, void 0, void 0, function* () { return this._handleFileChangeEvent(uri); })));
        this._fileWatcherDisposables.push(watcher.onDidCreate(() => __awaiter(this, void 0, void 0, function* () { return this._handleFileChangeEvent(uri); })));
    }
    _handleFileChangeEvent(uri) {
        return __awaiter(this, void 0, void 0, function* () {
            const stat = yield vscode_1.workspace.fs.stat(uri);
            if (!this._lastSaveStat || fileStatEquals(stat, yield this._lastSaveStat)) {
                return;
            }
            if (!this._isActive) {
                this._hasContentChanged = true;
                return;
            }
            if (this._isDirty) {
                yield this._showContentChangedWarning();
                return;
            }
            this._onRequestReload.fire();
        });
    }
    _showContentChangedWarning() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode_1.window.showWarningMessage('The image changed on disk, do you want to reload the file?', 'Reload');
            if (result === 'Reload') {
                yield vscode_1.commands.executeCommand("workbench.action.files.revert");
                this._onRequestReload.fire();
            }
        });
    }
    save(ipcClient, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this._isDirty) {
                console.warn(`Attempt to save when not dirty`);
                return;
            }
            yield this.saveAs(ipcClient, this.uri, cancellation);
        });
    }
    saveAs(ipcClient, destination, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const metrics = {
                startEvent: performance_js_1.perf.now(),
                writeStartEvent: 0,
                writeFinishEvent: 0,
                finishEvent: 0,
                encodeDuration: 0,
                dataTransportDuration: 0,
                totalDuration: 0
            };
            const isAutoSaveEnabled = vscode_1.workspace.getConfiguration('files').get('autoSave') !== 'off';
            const response = yield ipcClient.request("save", { isAutoSaveEnabled });
            if (cancellation.isCancellationRequested) {
                return undefined;
            }
            metrics.encodeDuration = response.encodeDuration;
            metrics.writeStartEvent = performance_js_1.perf.now();
            metrics.dataTransportDuration = metrics.writeStartEvent - metrics.startEvent - metrics.encodeDuration;
            const data = new Uint8Array(response.blobBuffer);
            yield vscode_1.workspace.fs.writeFile(destination, data);
            metrics.writeFinishEvent = performance_js_1.perf.now();
            this._lastSaveStat = vscode_1.workspace.fs.stat(destination);
            yield this._lastSaveStat;
            this._setupFileWatcher(destination);
            this._savedEditIndex = this._editIndex;
            if (this._latestBackupUri) {
                yield vscode_1.workspace.fs.delete(this._latestBackupUri);
                this._latestBackupUri = undefined;
                this._latestBackupContent = undefined;
            }
            metrics.finishEvent = performance_js_1.perf.now();
            metrics.totalDuration = metrics.finishEvent - metrics.startEvent;
            logPerformanceMetrics(`Save perf: ${this.uri.fsPath}`, metrics);
        });
    }
    revert() {
        this._latestBackupUri = undefined;
        this._lastSaveStat = undefined;
        this._editIndex = 0;
        this._savedEditIndex = 0;
        this._hasContentChanged = false;
        this._isInitialized = true;
    }
    backup(ipcClient, context, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotExitMaxPixels = vscode_1.workspace.getConfiguration().get("luna.hotExitMaxPixels", 0);
            const response = yield ipcClient.request("backup", { hotExitMaxPixels });
            if (cancellation.isCancellationRequested) {
                throw new Error('Backup canceled');
            }
            if (!response.success) {
                throw new Error('Could not backup file as it\'s too large');
            }
            yield (0, backup_js_1.saveBackupData)(context.destination, { state: response.state, workbenchState: response.workbenchState });
            this._latestBackupUri = context.destination;
            this._latestBackupContent = undefined;
            return {
                id: context.destination.toString(),
                delete: () => __awaiter(this, void 0, void 0, function* () {
                    if (this._latestBackupUri && this._latestBackupUri.toString() === context.destination.toString()) {
                        this._latestBackupContent = response.state;
                    }
                    try {
                        yield vscode_1.workspace.fs.delete(context.destination);
                    }
                    catch (_a) {
                    }
                })
            };
        });
    }
    setupIpc(webview) {
        const ipcClient = new ipcWebview_1.WebviewIpcClient(webview);
        ipcClient.registerRequestHandler("backupClipboardData", data => {
            if (this._initData.type === 'newFromClipboard') {
                this._initData.data = data;
            }
        });
        ipcClient.registerRequestHandler("historyNewEdit", args => {
            this._editIndex++;
            this._onDidChange.fire({
                document: this,
                label: args.label,
                redo: () => __awaiter(this, void 0, void 0, function* () {
                    this._editIndex++;
                    const result = yield ipcClient.request("luna.executeCommand", "edit.redo");
                    if (!result.success) {
                        throw new Error(`Could not redo entry "${args.label}"`);
                    }
                }),
                undo: () => __awaiter(this, void 0, void 0, function* () {
                    this._editIndex--;
                    const result = yield ipcClient.request("luna.executeCommand", "edit.undo");
                    if (!result.success) {
                        throw new Error(`Could not undo entry "${args.label}"`);
                    }
                }),
            });
        });
        ipcClient.registerRequestHandler("inputBoxNumber", (args) => __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode_1.window.showInputBox({
                prompt: args.prompt,
                value: args.defaultValue.toString(),
                validateInput: v => validateNumberInput(v, args.minValue, args.maxValue)
            });
            return result === undefined ? undefined : parseInt(result);
        }));
        ipcClient.registerRequestHandler("inputBoxNumberOrDimensionsShorthand", (args) => __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode_1.window.showInputBox({
                prompt: args.prompt,
                value: args.defaultValue.toString(),
                validateInput: v => {
                    if (validateDimensionsShorthand(v)) {
                        return undefined;
                    }
                    return validateNumberInput(v, args.minValue, args.maxValue);
                }
            });
            if (result === null || result === void 0 ? void 0 : result.includes('x')) {
                const dimensions = result.split('x');
                return {
                    width: parseInt(dimensions[0]),
                    height: parseInt(dimensions[1])
                };
            }
            return result === undefined ? undefined : parseInt(result);
        }));
        ipcClient.registerRequestHandler("inputBoxString", (args) => __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode_1.window.showInputBox({
                prompt: args.prompt,
                value: args.defaultValue
            });
            return result;
        }));
        ipcClient.registerRequestHandler("quickPick", (args) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            return (_a = (yield vscode_1.window.showQuickPick(args.items, args.options))) === null || _a === void 0 ? void 0 : _a.id;
        }));
        ipcClient.registerRequestHandler("vscode.executeCommand", (args) => __awaiter(this, void 0, void 0, function* () {
            return vscode_1.commands.executeCommand(args.command, args.args);
        }));
        ipcClient.registerRequestHandler("vscode.setContext", (args) => __awaiter(this, void 0, void 0, function* () {
            yield setVscodeContext(args.key, args.value);
        }));
        ipcClient.registerRequestHandler("ready", () => __awaiter(this, void 0, void 0, function* () {
            this._perfMetrics.webviewReadyEvent = performance_js_1.perf.now();
            let workbenchState = undefined;
            if (!workbenchState && this._workbenchState.size > 0) {
                workbenchState = {
                    version: 3,
                    entries: []
                };
                for (const [id, state] of this._workbenchState.entries()) {
                    workbenchState.entries.push({ id, state });
                }
                (0, state_js_1.mixinGlobalState)(this._context, workbenchState);
            }
            if (!workbenchState) {
                workbenchState = (0, state_js_1.getWorkbenchState)(this._context, this.uri);
            }
            if (this._latestBackupUri) {
                let state;
                if (this._latestBackupContent) {
                    state = this._latestBackupContent;
                }
                else {
                    const backup = yield (0, backup_js_1.getBackupData)(this._context, this._latestBackupUri);
                    state = backup.state;
                    workbenchState = backup.workbenchState;
                }
                if (!state || state.version < 8) {
                    vscode_1.window.showWarningMessage('Extension was updated, could not restore image from backup');
                }
                else {
                    this._perfMetrics.dataReadyEvent = performance_js_1.perf.now();
                    return {
                        type: 'restore',
                        config: this._getLunaConfig(),
                        state,
                        workbenchState,
                        editIndex: this._editIndex,
                        restoreHistory: true
                    };
                }
            }
            if (!this._isInitialized) {
                this._isInitialized = true;
                this._initData.workbenchState = workbenchState;
                this._perfMetrics.dataReadyEvent = performance_js_1.perf.now();
                return this._initData;
            }
            try {
                const data = yield vscode_1.workspace.fs.readFile(this.uri);
                this._lastSaveStat = vscode_1.workspace.fs.stat(this.uri);
                yield this._lastSaveStat;
                if (data.length === 0) {
                    const config = vscode_1.workspace.getConfiguration("luna.defaultImageSize", this.uri);
                    this._perfMetrics.dataReadyEvent = performance_js_1.perf.now();
                    return {
                        type: 'new',
                        config: this._getLunaConfig(),
                        workbenchState,
                        dimensions: {
                            width: config.get('width', 800),
                            height: config.get('height', 600)
                        }
                    };
                }
                this._perfMetrics.dataReadyEvent = performance_js_1.perf.now();
                return {
                    type: 'open',
                    config: this._getLunaConfig(),
                    workbenchState,
                    data,
                    extName: (0, path_1.extname)(this.uri.path),
                    isReadonly: this._initData.isReadonly
                };
            }
            catch (e) {
                vscode_1.window.showInformationMessage('This image could not be restored from hot exit, try saving the file and/or turning the luna.retainContextWhenHidden setting on');
                this._initData.workbenchState = workbenchState;
                this._perfMetrics.dataReadyEvent = performance_js_1.perf.now();
                return this._initData;
            }
        }));
        ipcClient.registerRequestHandler("parseFinished", (data) => __awaiter(this, void 0, void 0, function* () {
            this._perfMetrics.parseDuration = data.duration;
            this._perfMetrics.finishEvent = performance_js_1.perf.now();
            this._perfMetrics.dataTransportDuration = this._perfMetrics.finishEvent - this._perfMetrics.dataReadyEvent - this._perfMetrics.parseDuration;
            this._perfMetrics.totalDuration = this._perfMetrics.finishEvent - this._perfMetrics.startEvent;
            logPerformanceMetrics(`Open perf: ${this.uri.fsPath}`, this._perfMetrics);
        }));
        ipcClient.registerRequestHandler("reportIssue", () => __awaiter(this, void 0, void 0, function* () {
            vscode_1.commands.executeCommand('workbench.action.openIssueReporter', { extensionId: 'tyriar.luna-paint' });
        }));
        ipcClient.registerRequestHandler("setMimeType", mimeType => {
            this._onMimeTypeChange.fire(mimeType);
        });
        ipcClient.registerRequestHandler("updateWorkbenchState", state => {
            if (state.global) {
                this._globalState.set(state.id, state.state);
            }
            else {
                this._workbenchState.set(state.id, state.state);
            }
            const workspaceState = this._context.workspaceState.get('workbenchState') || {};
            const serializedWorkbenchState = {
                version: 3,
                entries: []
            };
            if (state.global) {
                for (const [id, state] of this._globalState.entries()) {
                    serializedWorkbenchState.entries.push({ id, state });
                }
                workspaceState['global'] = serializedWorkbenchState;
            }
            else {
                for (const [id, state] of this._workbenchState.entries()) {
                    serializedWorkbenchState.entries.push({ id, state });
                }
                workspaceState[this.uri.toString()] = serializedWorkbenchState;
            }
            this._context.workspaceState.update('workbenchState', workspaceState);
            if (state.global) {
                this._onDidUpdateGlobalState.fire(serializedWorkbenchState);
            }
        });
        return ipcClient;
    }
    syncGlobalState(ipcClient, globalState) {
        return __awaiter(this, void 0, void 0, function* () {
            yield ipcClient.request("syncGlobalState", globalState);
        });
    }
    _getLunaConfig() {
        var _a, _b, _c;
        const config = vscode_1.workspace.getConfiguration();
        return {
            mouseWheelBehavior: (_a = config.get("luna.mouseWheelBehavior")) !== null && _a !== void 0 ? _a : 'scroll',
            snapToPixelGrid: (_b = config.get("luna.snapToPixelGrid")) !== null && _b !== void 0 ? _b : true,
            statusBarPointerColor: (_c = config.get("luna.statusBar.pointerColor")) !== null && _c !== void 0 ? _c : 'currentLayer'
        };
    }
}
exports.ImageDocument = ImageDocument;
var BuiltInCommands;
(function (BuiltInCommands) {
    BuiltInCommands["SetContext"] = "setContext";
})(BuiltInCommands = exports.BuiltInCommands || (exports.BuiltInCommands = {}));
function setVscodeContext(key, value) {
    return vscode_1.commands.executeCommand(BuiltInCommands.SetContext, key, value);
}
exports.setVscodeContext = setVscodeContext;
function validateDimensionsShorthand(value, minValue, maxValue) {
    return !!value.match(/^\d+x\d+/);
}
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
function fileStatEquals(a, b) {
    if (!b) {
        return false;
    }
    return a.ctime === b.ctime && a.mtime === b.mtime && a.size === b.size;
}
function logPerformanceMetrics(title, metrics) {
    const logPerfMetrics = vscode_1.workspace.getConfiguration().get("luna.developer.logPerfMetrics");
    if (logPerfMetrics) {
        const events = {};
        const durations = {};
        for (const key of Object.keys(metrics)) {
            const value = metrics[key];
            if (key.endsWith('Event')) {
                events[key] = {
                    'Time (ms)': parseFloat((value - metrics.startEvent).toFixed(2)),
                    'Percent (%)': Math.round((metrics[key] - metrics.startEvent) / metrics.totalDuration * 100)
                };
            }
            else {
                durations[key] = {
                    'Duration (ms)': parseFloat(value.toFixed(2))
                };
            }
        }
        console.info(`\n${title}`);
        console.table(durations);
        console.table(events);
    }
}
//# sourceMappingURL=imageDocument.js.map

/***/ }),
/* 6 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.saveBackupData = exports.getBackupData = void 0;
const vscode_1 = __webpack_require__(2);
const platform_js_1 = __webpack_require__(7);
const state_js_1 = __webpack_require__(8);
function getBackupData(context, uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const serializedData = yield vscode_1.workspace.fs.readFile(uri);
        if (platform_js_1.isWeb) {
            if (!self.TextDecoder) {
                console.warn('This browser doesn\'t support TextEncoder');
                return {};
            }
            const decoder = new self.TextDecoder();
            const deserialized = decoder.decode(serializedData);
            const state = ensureLunaStateType(deserialized === null || deserialized === void 0 ? void 0 : deserialized.state);
            const workbenchState = deserialized === null || deserialized === void 0 ? void 0 : deserialized.workbenchState;
            return { state, workbenchState };
        }
        const deserializer = new (yield Promise.resolve().then(() => __webpack_require__(9))).Deserializer(serializedData);
        const deserialized = deserializer.readValue();
        const state = ensureLunaStateType(deserialized === null || deserialized === void 0 ? void 0 : deserialized.state);
        const workbenchState = deserialized === null || deserialized === void 0 ? void 0 : deserialized.workbenchState;
        (0, state_js_1.mixinGlobalState)(context, workbenchState);
        return { state, workbenchState };
    });
}
exports.getBackupData = getBackupData;
function saveBackupData(destination, data) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer;
        if (platform_js_1.isWeb) {
            if (self.TextEncoder) {
                const encoder = new self.TextEncoder();
                buffer = encoder.encode(JSON.stringify(data));
            }
            else {
                throw new Error('This browser doesn\'t support TextEncoder');
            }
        }
        else {
            const serializer = new (yield Promise.resolve().then(() => __webpack_require__(9))).Serializer();
            serializer.writeValue(data);
            buffer = serializer.releaseBuffer();
        }
        yield vscode_1.workspace.fs.writeFile(destination, buffer);
    });
}
exports.saveBackupData = saveBackupData;
function ensureLunaStateType(deserialized) {
    if (typeof deserialized !== 'object' || deserialized === null) {
        return undefined;
    }
    const state = deserialized;
    if (!('version' in state) || state.version !== 8) {
        return undefined;
    }
    if (!('body' in state || typeof state.body !== 'object')) {
        return undefined;
    }
    return {
        version: state.version,
        body: state.body
    };
}
//# sourceMappingURL=backup.js.map

/***/ }),
/* 7 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.isLinux = exports.isWindows = exports.isMac = exports.isWeb = exports.globals = void 0;
exports.globals = (typeof self === 'object' ? self : typeof __webpack_require__.g === 'object' ? __webpack_require__.g : {});
let nodeProcess = undefined;
if (typeof exports.globals.vscode !== 'undefined' && typeof exports.globals.vscode.process !== 'undefined') {
    nodeProcess = exports.globals.vscode.process;
}
else if (typeof process !== 'undefined') {
    nodeProcess = process;
}
const isElectronRenderer = typeof ((_a = nodeProcess === null || nodeProcess === void 0 ? void 0 : nodeProcess.versions) === null || _a === void 0 ? void 0 : _a.electron) === 'string' && nodeProcess.type === 'renderer';
let internalIsWeb = false;
let internalIsMac = false;
let internalIsWindows = false;
let internalIsLinux = false;
if (typeof navigator === 'object' && !isElectronRenderer) {
    internalIsWeb = true;
    internalIsWindows = navigator.userAgent.indexOf('Windows') >= 0;
    internalIsMac = navigator.userAgent.indexOf('Macintosh') >= 0;
    internalIsLinux = navigator.userAgent.indexOf('Linux') >= 0;
}
else if (typeof nodeProcess === 'object') {
    internalIsWeb = false;
    internalIsWindows = (nodeProcess.platform === 'win32');
    internalIsMac = (nodeProcess.platform === 'darwin');
    internalIsLinux = (nodeProcess.platform === 'linux');
}
exports.isWeb = internalIsWeb;
exports.isMac = internalIsMac;
exports.isWindows = internalIsWindows;
exports.isLinux = internalIsLinux;
//# sourceMappingURL=platform.js.map

/***/ }),
/* 8 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.mixinGlobalState = exports.getWorkbenchState = exports.getGlobalState = void 0;
function getState(context, key) {
    const workspaceState = context.workspaceState.get('workbenchState');
    const workbenchState = workspaceState === null || workspaceState === void 0 ? void 0 : workspaceState[key];
    if (!workbenchState || workbenchState.version !== 3) {
        return {
            version: 3,
            entries: []
        };
    }
    return workbenchState;
}
function getGlobalState(context) {
    return getState(context, 'global');
}
exports.getGlobalState = getGlobalState;
function getWorkbenchState(context, uri) {
    const state = getState(context, uri.toString());
    mixinGlobalState(context, state);
    return state;
}
exports.getWorkbenchState = getWorkbenchState;
function mixinGlobalState(context, workbenchState) {
    const globalState = getGlobalState(context);
    for (const entry of globalState.entries) {
        const i = workbenchState.entries.findIndex(e => e.id === entry.id);
        workbenchState.entries.splice(i, 1);
    }
    workbenchState.entries.push(...globalState.entries);
}
exports.mixinGlobalState = mixinGlobalState;
//# sourceMappingURL=state.js.map

/***/ }),
/* 9 */
/***/ ((module) => {

"use strict";
module.exports = require("v8");;

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebviewIpcClient = void 0;
const serialization_js_1 = __webpack_require__(11);
const platform_js_1 = __webpack_require__(7);
class WebviewIpcClient {
    constructor(_webview) {
        this._webview = _webview;
        this._webviewRequestHandlers = new Map();
        this._activeRequests = new Map();
        this._webview.onDidReceiveMessage((e) => __awaiter(this, void 0, void 0, function* () {
            if ('extHostRequestId' in e) {
                const extHostRequestId = e.extHostRequestId;
                const resolveRequest = this._activeRequests.get(extHostRequestId);
                if (!resolveRequest) {
                    throw new Error(`Response received without request "${extHostRequestId}"`);
                }
                this._activeRequests.delete(extHostRequestId);
                resolveRequest(platform_js_1.isWeb ? (0, serialization_js_1.deserializeFromJson)(e.body) : e.body);
                return;
            }
            if ('webviewRequestId' in e) {
                const handler = this._webviewRequestHandlers.get(e.type);
                if (!handler) {
                    throw new Error(`No handler for webview request "${e.type}"`);
                }
                const reply = yield handler(e.body);
                const response = {
                    type: e.type,
                    body: platform_js_1.isWeb ? (0, serialization_js_1.serializeToJson)(reply) : reply,
                    webviewRequestId: e.webviewRequestId
                };
                this._webview.postMessage(response);
                return;
            }
        }));
    }
    registerRequestHandler(type, handler) {
        if (this._webviewRequestHandlers.has(type)) {
            throw new Error(`Duplicate webview request handler "${type}"`);
        }
        this._webviewRequestHandlers.set(type, handler);
    }
    request(type, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const extHostRequestId = Math.round(Math.random() * 1000000);
            const promise = yield new Promise(r => {
                this._activeRequests.set(extHostRequestId, r);
                const request = {
                    type,
                    body: args,
                    extHostRequestId
                };
                this._webview.postMessage(request);
            });
            return promise;
        });
    }
}
exports.WebviewIpcClient = WebviewIpcClient;
//# sourceMappingURL=ipcWebview.js.map

/***/ }),
/* 11 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.deserializeFromJson = exports.serializeToJson = void 0;
function serializeToJson(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    const result = {};
    for (const key of Object.keys(obj)) {
        const inner = obj[key];
        if (typeof inner === 'object') {
            if ('readyPromise' in inner) {
                result[key] = serializePendingResource(inner);
            }
            else if (inner instanceof Float32Array) {
                result[key] = serializeNumberArray(inner, 'Float32Array');
            }
            else if (inner instanceof Uint8Array) {
                result[key] = serializeNumberArray(inner, 'Uint8Array');
            }
            else if (inner instanceof Uint16Array) {
                result[key] = serializeNumberArray(inner, 'Uint16Array');
            }
            else if (inner instanceof Uint32Array) {
                result[key] = serializeNumberArray(inner, 'Uint32Array');
            }
            else {
                result[key] = inner;
            }
        }
        else {
            result[key] = inner;
        }
    }
    return result;
}
exports.serializeToJson = serializeToJson;
function deserializeFromJson(obj) {
    if (!obj || typeof obj !== 'object') {
        return obj;
    }
    const result = {};
    for (const key of Object.keys(obj)) {
        const inner = obj[key];
        if (typeof inner === 'object') {
            if ('dataType' in inner) {
                if (inner['dataType'] === 'pending') {
                    result[key] = deserializePendingResource(inner);
                }
                else {
                    result[key] = deserializeNumberArray(inner);
                }
            }
            else {
                result[key] = deserializeFromJson(inner);
            }
        }
        else {
            result[key] = inner;
        }
    }
    return result;
}
exports.deserializeFromJson = deserializeFromJson;
function serializePendingResource(obj) {
    return {
        dataType: 'pending',
        data: serializeToJson(obj.resource)
    };
}
function deserializePendingResource(obj) {
    const resource = deserializeFromJson(obj.data);
    return {
        resource,
        readyPromise: Promise.resolve(resource),
        isReady: true
    };
}
function serializeNumberArray(array, dataType) {
    return {
        dataType,
        data: Array.from(array)
    };
}
function deserializeNumberArray(array) {
    return new __webpack_require__.g[array.dataType](array.data);
}
//# sourceMappingURL=serialization.js.map

/***/ }),
/* 12 */
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.disposeArray = exports.Disposable = void 0;
class Disposable {
    constructor() {
        this._disposables = [];
        this._isDisposed = false;
    }
    dispose() {
        if (this._isDisposed) {
            throw new Error('Attempt to dispose a disposed entity');
        }
        this._isDisposed = true;
        for (const d of this._disposables) {
            d.dispose();
        }
        this._disposables.length = 0;
    }
    register(d) {
        this._disposables.push(d);
        return d;
    }
    unregister(d) {
        const index = this._disposables.indexOf(d);
        if (index !== -1) {
            this._disposables.splice(index, 1);
        }
    }
}
exports.Disposable = Disposable;
function disposeArray(disposables) {
    for (const d of disposables) {
        d.dispose();
    }
    disposables.length = 0;
}
exports.disposeArray = disposeArray;
//# sourceMappingURL=lifecycle.js.map

/***/ }),
/* 13 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.perf = void 0;
const platform_js_1 = __webpack_require__(7);
exports.perf = platform_js_1.isWeb ? self.performance : __webpack_require__(14).performance;
//# sourceMappingURL=performance.js.map

/***/ }),
/* 14 */
/***/ ((module) => {

"use strict";
module.exports = require("perf_hooks");;

/***/ }),
/* 15 */
/***/ ((__unused_webpack_module, exports) => {

exports.endianness = function () { return 'LE' };

exports.hostname = function () {
    if (typeof location !== 'undefined') {
        return location.hostname
    }
    else return '';
};

exports.loadavg = function () { return [] };

exports.uptime = function () { return 0 };

exports.freemem = function () {
    return Number.MAX_VALUE;
};

exports.totalmem = function () {
    return Number.MAX_VALUE;
};

exports.cpus = function () { return [] };

exports.type = function () { return 'Browser' };

exports.release = function () {
    if (typeof navigator !== 'undefined') {
        return navigator.appVersion;
    }
    return '';
};

exports.networkInterfaces
= exports.getNetworkInterfaces
= function () { return {} };

exports.arch = function () { return 'javascript' };

exports.platform = function () { return 'browser' };

exports.tmpdir = exports.tmpDir = function () {
    return '/tmp';
};

exports.EOL = '\n';

exports.homedir = function () {
	return '/'
};


/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// module exports must be returned from runtime so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })()

));
//# sourceMappingURL=vscode.workerexthost.js.map