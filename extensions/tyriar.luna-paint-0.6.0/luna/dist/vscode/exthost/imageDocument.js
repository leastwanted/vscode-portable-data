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
const path_1 = require("path");
const perf_hooks_1 = require("perf_hooks");
const vscode_1 = require("vscode");
const backup_js_1 = require("./backup.js");
const ipcWebview_1 = require("./ipcWebview");
const lifecycle_js_1 = require("./lifecycle.js");
class ImageDocument extends lifecycle_js_1.Disposable {
    constructor(_context, uri, _initData, documentCreatedTime) {
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
        this._onRequestReload = new vscode_1.EventEmitter();
        this.onRequestReload = this._onRequestReload.event;
        this._onMimeTypeChange = new vscode_1.EventEmitter();
        this.onSetMimeType = this._onMimeTypeChange.event;
        this._perfMetrics.startEvent = documentCreatedTime !== undefined ? documentCreatedTime : perf_hooks_1.performance.now();
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
        lifecycle_js_1.disposeArray(this._fileWatcherDisposables);
        const watcher = vscode_1.workspace.createFileSystemWatcher(this._fileWatcherUri.fsPath, true, false, false);
        this._fileWatcherDisposables.push(watcher);
        this._fileWatcherDisposables.push(watcher.onDidChange(() => __awaiter(this, void 0, void 0, function* () {
            const stat = yield vscode_1.workspace.fs.stat(uri);
            if (fileStatEquals(stat, this._lastSaveStat)) {
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
        })));
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
                startEvent: perf_hooks_1.performance.now(),
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
            metrics.writeStartEvent = perf_hooks_1.performance.now();
            metrics.dataTransportDuration = metrics.writeStartEvent - metrics.startEvent - metrics.encodeDuration;
            const data = new Uint8Array(response.blobBuffer);
            yield vscode_1.workspace.fs.writeFile(destination, data);
            metrics.writeFinishEvent = perf_hooks_1.performance.now();
            this._lastSaveStat = yield vscode_1.workspace.fs.stat(destination);
            this._setupFileWatcher(destination);
            this._savedEditIndex = this._editIndex;
            if (this._latestBackupUri) {
                yield vscode_1.workspace.fs.delete(this._latestBackupUri);
                this._latestBackupUri = undefined;
                this._latestBackupContent = undefined;
            }
            metrics.finishEvent = perf_hooks_1.performance.now();
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
            yield backup_js_1.saveBackupData(context.destination, { state: response.state, workbenchState: response.workbenchState });
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
            this._perfMetrics.webviewReadyEvent = perf_hooks_1.performance.now();
            let workbenchState = undefined;
            if (!workbenchState && this._workbenchState.size > 0) {
                workbenchState = {
                    version: 2,
                    entries: []
                };
                for (const [id, state] of this._workbenchState.entries()) {
                    workbenchState.entries.push({ id, state });
                }
            }
            if (!workbenchState) {
                const workspaceState = this._context.workspaceState.get('workbenchState');
                if (workspaceState) {
                    workbenchState = workspaceState[this.uri.toString()];
                }
            }
            if (this._latestBackupUri) {
                let state;
                if (this._latestBackupContent) {
                    state = this._latestBackupContent;
                }
                else {
                    const backup = yield backup_js_1.getBackupData(this._latestBackupUri);
                    state = backup.state;
                    workbenchState = backup.workbenchState;
                }
                if (!state || state.version < 5) {
                    vscode_1.window.showWarningMessage('Extension was updated, could not restore image from backup');
                }
                else {
                    this._perfMetrics.dataReadyEvent = perf_hooks_1.performance.now();
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
                this._perfMetrics.dataReadyEvent = perf_hooks_1.performance.now();
                return this._initData;
            }
            try {
                const data = yield vscode_1.workspace.fs.readFile(this.uri);
                this._lastSaveStat = yield vscode_1.workspace.fs.stat(this.uri);
                if (data.length === 0) {
                    const config = vscode_1.workspace.getConfiguration("luna.defaultImageSize", this.uri);
                    this._perfMetrics.dataReadyEvent = perf_hooks_1.performance.now();
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
                this._perfMetrics.dataReadyEvent = perf_hooks_1.performance.now();
                return {
                    type: 'open',
                    config: this._getLunaConfig(),
                    workbenchState,
                    data,
                    extName: path_1.extname(this.uri.path),
                    isReadonly: this._initData.isReadonly
                };
            }
            catch (e) {
                vscode_1.window.showInformationMessage('This image could not be restored from hot exit, try saving the file and/or turning the luna.retainContextWhenHidden setting on');
                this._initData.workbenchState = workbenchState;
                this._perfMetrics.dataReadyEvent = perf_hooks_1.performance.now();
                return this._initData;
            }
        }));
        ipcClient.registerRequestHandler("parseFinished", (data) => __awaiter(this, void 0, void 0, function* () {
            this._perfMetrics.parseDuration = data.duration;
            this._perfMetrics.finishEvent = perf_hooks_1.performance.now();
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
            this._workbenchState.set(state.id, state.state);
            const workspaceState = this._context.workspaceState.get('workbenchState') || {};
            const serializedWorkbenchState = {
                version: 2,
                entries: []
            };
            for (const [id, state] of this._workbenchState.entries()) {
                serializedWorkbenchState.entries.push({ id, state });
            }
            workspaceState[this.uri.toString()] = serializedWorkbenchState;
            this._context.workspaceState.update('workbenchState', workspaceState);
        });
        return ipcClient;
    }
    _getLunaConfig() {
        return {
            mouseWheelBehavior: vscode_1.workspace.getConfiguration().get("luna.mouseWheelBehavior") || 'scroll'
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