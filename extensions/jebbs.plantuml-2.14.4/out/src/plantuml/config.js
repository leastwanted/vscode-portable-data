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
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const common_1 = require("./common");
const configReader_1 = require("./configReader");
const tools_1 = require("./tools");
const context_1 = require("./context");
const WORKSPACE_IS_TRUSTED_KEY = 'WORKSPACE_IS_TRUSTED_KEY';
const SECURITY_SENSITIVE_CONFIG = [
    'java', 'jar'
];
exports.RenderType = {
    Local: 'Local',
    PlantUMLServer: 'PlantUMLServer'
};
class Config extends configReader_1.ConfigReader {
    constructor(workspaceState) {
        super('plantuml');
        this._jar = {};
        this._workspaceState = workspaceState;
        this._workspaceIsTrusted = this._workspaceState.get(WORKSPACE_IS_TRUSTED_KEY);
    }
    onChange() {
        this._jar = {};
        this._java = "";
    }
    jar(uri) {
        let folder = uri ? vscode.workspace.getWorkspaceFolder(uri) : undefined;
        let folderPath = folder ? folder.uri.fsPath : "";
        return this._jar[folderPath] || (() => {
            let jar;
            if (this._workspaceIsTrusted) {
                jar = this.read('jar', uri, (folderUri, value) => {
                    if (!value)
                        return "";
                    if (!path.isAbsolute(value))
                        value = path.join(folderUri.fsPath, value);
                    return value;
                });
            }
            else {
                jar = this.readGlobal('jar');
            }
            let intJar = path.join(common_1.extensionPath, "plantuml.jar");
            if (!jar) {
                jar = intJar;
            }
            else {
                if (!fs.existsSync(jar)) {
                    vscode.window.showWarningMessage(common_1.localize(19, null));
                    jar = intJar;
                }
            }
            this._jar[folderPath] = jar;
            return jar;
        })();
    }
    fileExtensions(uri) {
        let extReaded = this.read('fileExtensions', uri).replace(/\s/g, "");
        let exts = extReaded || ".*";
        if (exts.indexOf(",") > 0)
            exts = `{${exts}}`;
        //REG: .* | .wsd | {.wsd,.java}
        if (!exts.match(/^(.\*|\.\w+|\{\.\w+(,\.\w+)*\})$/)) {
            throw new Error(common_1.localize(18, null, extReaded));
        }
        return exts;
    }
    diagramsRoot(uri) {
        let folder = uri ? vscode.workspace.getWorkspaceFolder(uri) : undefined;
        if (!folder)
            return undefined;
        let fsPath = path.join(folder.uri.fsPath, this.read("diagramsRoot", uri));
        return vscode.Uri.file(fsPath);
    }
    exportOutDir(uri) {
        let folder = uri ? vscode.workspace.getWorkspaceFolder(uri) : undefined;
        if (!folder)
            return undefined;
        let fsPath = path.join(folder.uri.fsPath, this.read("exportOutDir", uri) || "out");
        return vscode.Uri.file(fsPath);
    }
    exportFormat(uri) {
        return this.read('exportFormat', uri);
    }
    exportSubFolder(uri) {
        return this.read('exportSubFolder', uri);
    }
    get exportConcurrency() {
        return this.read('exportConcurrency') || 3;
    }
    exportMapFile(uri) {
        return this.read('exportMapFile', uri) || false;
    }
    get previewAutoUpdate() {
        return this.read('previewAutoUpdate');
    }
    get previewSnapIndicators() {
        return this.read('previewSnapIndicators');
    }
    get server() {
        return this.read('server').trim().replace(/\/+$/g, "");
    }
    get urlFormat() {
        return this.read('urlFormat');
    }
    get urlResult() {
        return this.read('urlResult') || "MarkDown";
    }
    get render() {
        return this.read('render') || "Local";
    }
    includepaths(uri) {
        return this.read('includepaths', uri);
    }
    commandArgs(uri) {
        return this.read('commandArgs', uri) || [];
    }
    jarArgs(uri) {
        return this.read('jarArgs', uri) || [];
    }
    get java() {
        return this._java || (() => {
            let java;
            if (this._workspaceIsTrusted) {
                java = this.read('java');
            }
            else {
                java = this.readGlobal('java');
            }
            if (java == "java") {
                if (tools_1.javaCommandExists())
                    this._java = java;
            }
            else {
                if (tools_1.testJava(java)) {
                    this._java = java;
                }
                else {
                    vscode.window.showWarningMessage(common_1.localize(54, null, java));
                }
            }
            return this._java;
        })();
    }
    ignoredWorkspaceSettings(keys) {
        if (this._workspaceIsTrusted) {
            return [];
        }
        let conf = vscode.workspace.getConfiguration('plantuml');
        return keys.filter((key) => {
            const inspect = conf.inspect(key);
            return inspect.workspaceValue !== undefined || inspect.workspaceFolderValue !== undefined;
        });
    }
    toggleWorkspaceIsTrusted() {
        return __awaiter(this, void 0, void 0, function* () {
            this._workspaceIsTrusted = !this._workspaceIsTrusted;
            this.onChange();
            yield this._workspaceState.update(WORKSPACE_IS_TRUSTED_KEY, this._workspaceIsTrusted);
        });
    }
}
context_1.contextManager.addInitiatedListener((ctx) => __awaiter(void 0, void 0, void 0, function* () {
    exports.config = new Config(ctx.workspaceState);
    let ignoredSettings = exports.config.ignoredWorkspaceSettings(SECURITY_SENSITIVE_CONFIG);
    if (ignoredSettings.length == 0) {
        return;
    }
    const trustButton = common_1.localize(57, null);
    const val = yield vscode.window.showWarningMessage(common_1.localize(55, null, ignoredSettings), common_1.localize(56, null), trustButton);
    switch (val) {
        case trustButton:
            yield exports.config.toggleWorkspaceIsTrusted();
            break;
        default:
            break;
    }
}));
//# sourceMappingURL=config.js.map