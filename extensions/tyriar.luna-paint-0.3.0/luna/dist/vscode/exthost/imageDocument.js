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
exports.setVscodeContext = exports.BuiltInCommands = exports.ImageDocument = void 0;
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
        var _a;
        if (((_a = this._fileWatcherUri) === null || _a === void 0 ? void 0 : _a.toString()) === uri.toString()) {
            return;
        }
        this._fileWatcherUri = uri;
        lifecycle_js_1.disposeArray(this._fileWatcherDisposables);
        const watcher = vscode_1.workspace.createFileSystemWatcher(this._fileWatcherUri.fsPath, true, false, false);
        this._fileWatcherDisposables.push(watcher);
        this._fileWatcherDisposables.push(watcher.onDidChange(() => __awaiter(this, void 0, void 0, function* () {
            if (this._isSavingTimeout) {
                return;
            }
            if (this._isActive) {
                if (this._isDirty) {
                    yield this._showContentChangedWarning();
                }
                else {
                    yield vscode_1.commands.executeCommand("workbench.action.closeActiveEditor");
                    yield vscode_1.commands.executeCommand("workbench.action.reopenClosedEditor");
                }
            }
            else {
                this._hasContentChanged = true;
            }
        })));
    }
    _showContentChangedWarning() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield vscode_1.window.showWarningMessage('The image changed on disk, do you want to reload the file?', 'Reload');
            if (result === 'Reload') {
                yield vscode_1.commands.executeCommand("workbench.action.files.revert");
                yield vscode_1.commands.executeCommand("workbench.action.closeActiveEditor");
                yield vscode_1.commands.executeCommand("workbench.action.reopenClosedEditor");
            }
            this._hasContentChanged = false;
        });
    }
    save(ipcClient, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.saveAs(ipcClient, this.uri, cancellation);
        });
    }
    saveAs(ipcClient, destination, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const isAutoSaveEnabled = vscode_1.workspace.getConfiguration('file').get('autoSave') !== 'off';
            const response = yield ipcClient.request("save", { isAutoSaveEnabled });
            if (cancellation.isCancellationRequested) {
                return undefined;
            }
            const data = new Uint8Array(response.blobBuffer);
            if (this._isSavingTimeout) {
                clearTimeout(this._isSavingTimeout);
            }
            this._isSavingTimeout = setTimeout(() => {
                this._isSavingTimeout = undefined;
            }, 2000);
            yield vscode_1.workspace.fs.writeFile(destination, data);
            this._setupFileWatcher(destination);
            this._isDirty = false;
        });
    }
    revert() {
        this._latestBackupUri = undefined;
        this._isDirty = false;
        if (this._isSavingTimeout) {
            clearTimeout(this._isSavingTimeout);
            this._isSavingTimeout = undefined;
        }
        this._hasContentChanged = false;
        this._isInitialized = true;
    }
    backup(ipcClient, context, cancellation) {
        return __awaiter(this, void 0, void 0, function* () {
            const hotExitMaxPixels = vscode_1.workspace.getConfiguration('luna').get('hotExitMaxPixels', 0);
            const response = yield ipcClient.request("backup", { hotExitMaxPixels });
            if (cancellation.isCancellationRequested) {
                throw new Error('Backup canceled');
            }
            if (!response.success) {
                throw new Error('Could not backup file as it\'s too large');
            }
            const serializer = new v8_1.Serializer();
            serializer.writeValue(response.state);
            yield vscode_1.workspace.fs.writeFile(context.destination, serializer.releaseBuffer());
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
        ipcClient.registerRequestHandler("historyNewEdit", args => {
            this._isDirty = true;
            this._onDidChange.fire({
                document: this,
                label: args.label,
                redo: () => __awaiter(this, void 0, void 0, function* () {
                    const result = yield ipcClient.request("luna.executeCommand", "edit.redo");
                    if (!result.success) {
                        throw new Error(`Could not redo entry "${args.label}"`);
                    }
                }),
                undo: () => __awaiter(this, void 0, void 0, function* () {
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
            if (this._latestBackupUri) {
                let state;
                if (this._latestBackupContent) {
                    state = this._latestBackupContent;
                }
                else {
                    const serializedData = yield vscode_1.workspace.fs.readFile(this._latestBackupUri);
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
                const data = yield vscode_1.workspace.fs.readFile(this.uri);
                return { type: 'open', data };
            }
            catch (e) {
                vscode_1.window.showInformationMessage('This image could not be restored from hot exit, try saving the file and/or turning the luna.retainContextWhenHidden setting on');
                return this._initData;
            }
        }));
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
//# sourceMappingURL=imageDocument.js.map