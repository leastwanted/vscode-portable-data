"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setVscodeContext = exports.BuiltInCommands = exports.ImageDocument = void 0;
const path_1 = require("path");
const v8_1 = require("v8");
const vscode_1 = require("vscode");
const ipcWebview_1 = require("./ipcWebview");
const lifecycle_js_1 = require("./lifecycle.js");
class ImageDocument extends lifecycle_js_1.Disposable {
    constructor(_context, uri, _initData) {
        super();
        this._context = _context;
        this.uri = uri;
        this._initData = _initData;
        this._isInitialized = false;
        this._isDirty = false;
        this._hasContentChanged = false;
        this._fileWatcherDisposables = [];
        this._isActive = false;
        this._workbenchState = new Map();
        this._onDidChange = new vscode_1.EventEmitter();
        this.onDidChange = this._onDidChange.event;
        this._onRequestReload = new vscode_1.EventEmitter();
        this.onRequestReload = this._onRequestReload.event;
        this._setupFileWatcher(uri);
    }
    get isActive() { return this._isActive; }
    set isActive(value) {
        this._isActive = value;
        if (this._isActive && this._hasContentChanged) {
            this._showContentChangedWarning();
        }
    }
    _setupFileWatcher(uri) {
        if (this._fileWatcherUri?.toString() === uri.toString()) {
            return;
        }
        this._fileWatcherUri = uri;
        lifecycle_js_1.disposeArray(this._fileWatcherDisposables);
        const watcher = vscode_1.workspace.createFileSystemWatcher(this._fileWatcherUri.fsPath, true, false, false);
        this._fileWatcherDisposables.push(watcher);
        this._fileWatcherDisposables.push(watcher.onDidChange(async () => {
            const stat = await vscode_1.workspace.fs.stat(uri);
            if (fileStatEquals(stat, this._lastSaveStat)) {
                return;
            }
            if (!this._isActive) {
                this._hasContentChanged = true;
                return;
            }
            if (this._isDirty) {
                await this._showContentChangedWarning();
                return;
            }
            this._onRequestReload.fire();
        }));
    }
    async _showContentChangedWarning() {
        const result = await vscode_1.window.showWarningMessage('The image changed on disk, do you want to reload the file?', 'Reload');
        if (result === 'Reload') {
            await vscode_1.commands.executeCommand("workbench.action.files.revert");
            this._onRequestReload.fire();
        }
    }
    async save(ipcClient, cancellation) {
        if (!this._isDirty) {
            console.warn(`Attempt to save when not dirty`);
            return;
        }
        await this.saveAs(ipcClient, this.uri, cancellation);
    }
    async saveAs(ipcClient, destination, cancellation) {
        const isAutoSaveEnabled = vscode_1.workspace.getConfiguration('files').get('autoSave') !== 'off';
        const response = await ipcClient.request("save", { isAutoSaveEnabled });
        if (cancellation.isCancellationRequested) {
            return undefined;
        }
        const data = new Uint8Array(response.blobBuffer);
        await vscode_1.workspace.fs.writeFile(destination, data);
        this._lastSaveStat = await vscode_1.workspace.fs.stat(destination);
        this._setupFileWatcher(destination);
        this._isDirty = false;
        if (this._latestBackupUri) {
            await vscode_1.workspace.fs.delete(this._latestBackupUri);
            this._latestBackupUri = undefined;
            this._latestBackupContent = undefined;
        }
    }
    revert() {
        this._latestBackupUri = undefined;
        this._lastSaveStat = undefined;
        this._isDirty = false;
        this._hasContentChanged = false;
        this._isInitialized = true;
    }
    async backup(ipcClient, context, cancellation) {
        const hotExitMaxPixels = vscode_1.workspace.getConfiguration('luna').get('hotExitMaxPixels', 0);
        const response = await ipcClient.request("backup", { hotExitMaxPixels });
        if (cancellation.isCancellationRequested) {
            throw new Error('Backup canceled');
        }
        if (!response.success) {
            throw new Error('Could not backup file as it\'s too large');
        }
        const serializer = new v8_1.Serializer();
        serializer.writeValue(response.state);
        await vscode_1.workspace.fs.writeFile(context.destination, serializer.releaseBuffer());
        this._latestBackupUri = context.destination;
        this._latestBackupContent = undefined;
        return {
            id: context.destination.toString(),
            delete: async () => {
                if (this._latestBackupUri && this._latestBackupUri.toString() === context.destination.toString()) {
                    this._latestBackupContent = response.state;
                }
                try {
                    await vscode_1.workspace.fs.delete(context.destination);
                }
                catch {
                }
            }
        };
    }
    setupIpc(webview) {
        const ipcClient = new ipcWebview_1.WebviewIpcClient(webview);
        ipcClient.registerRequestHandler("historyNewEdit", args => {
            this._isDirty = true;
            this._onDidChange.fire({
                document: this,
                label: args.label,
                redo: async () => {
                    const result = await ipcClient.request("luna.executeCommand", "edit.redo");
                    if (!result.success) {
                        throw new Error(`Could not redo entry "${args.label}"`);
                    }
                },
                undo: async () => {
                    const result = await ipcClient.request("luna.executeCommand", "edit.undo");
                    if (!result.success) {
                        throw new Error(`Could not undo entry "${args.label}"`);
                    }
                },
            });
        });
        ipcClient.registerRequestHandler("inputBoxNumber", async (args) => {
            const result = await vscode_1.window.showInputBox({
                prompt: args.prompt,
                value: args.defaultValue.toString(),
                validateInput: v => validateNumberInput(v, args.minValue, args.maxValue)
            });
            return result === undefined ? undefined : parseInt(result);
        });
        ipcClient.registerRequestHandler("quickPick", async (args) => {
            return (await vscode_1.window.showQuickPick(args.items, args.options))?.id;
        });
        ipcClient.registerRequestHandler("vscode.executeCommand", async (args) => {
            return vscode_1.commands.executeCommand(args.command, args.args);
        });
        ipcClient.registerRequestHandler("vscode.setContext", async (args) => {
            await setVscodeContext(args.key, args.value);
        });
        ipcClient.registerRequestHandler("ready", async () => {
            if (this._latestBackupUri) {
                let state;
                if (this._latestBackupContent) {
                    state = this._latestBackupContent;
                }
                else {
                    const serializedData = await vscode_1.workspace.fs.readFile(this._latestBackupUri);
                    const deserializer = new v8_1.Deserializer(serializedData);
                    state = deserializer.readValue();
                }
                if (state.version < 2) {
                    vscode_1.window.showWarningMessage('Extension was updated, could not restore image from backup');
                }
                else {
                    let workbenchState;
                    if (this._workbenchState.size > 0) {
                        workbenchState = {
                            version: 1,
                            entries: []
                        };
                        for (const [id, state] of this._workbenchState.entries()) {
                            workbenchState.entries.push({ id, state });
                        }
                    }
                    return {
                        type: 'restore',
                        state,
                        workbenchState,
                        restoreHistory: true
                    };
                }
            }
            if (!this._isInitialized) {
                this._isInitialized = true;
                return this._initData;
            }
            try {
                const data = await vscode_1.workspace.fs.readFile(this.uri);
                this._lastSaveStat = await vscode_1.workspace.fs.stat(this.uri);
                if (data.length === 0) {
                    const config = vscode_1.workspace.getConfiguration('luna.defaultImageSize', this.uri);
                    return {
                        type: 'new',
                        dimensions: {
                            width: config.get('width', 800),
                            height: config.get('height', 600)
                        }
                    };
                }
                return { type: 'open', data, extName: path_1.extname(this.uri.path) };
            }
            catch (e) {
                vscode_1.window.showInformationMessage('This image could not be restored from hot exit, try saving the file and/or turning the luna.retainContextWhenHidden setting on');
                return this._initData;
            }
        });
        ipcClient.registerRequestHandler("updateWorkbenchState", state => {
            this._workbenchState.set(state.id, state.body);
        });
        return ipcClient;
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
//# sourceMappingURL=imageDocument.js.map