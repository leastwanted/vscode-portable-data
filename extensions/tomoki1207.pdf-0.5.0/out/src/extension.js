"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const vscode_1 = require("vscode");
const pdfProvider_1 = require("./pdfProvider");
const path = require("path");
const viewType = 'pdf.preview';
function activate(context) {
    const openedPanels = [];
    const provider = new pdfProvider_1.PdfDocumentContentProvider(context);
    const revealIfAlreadyOpened = (uri) => {
        const opened = openedPanels.find(panel => panel.resource.fsPath === uri.fsPath);
        if (!opened)
            return false;
        opened.panel.reveal(opened.panel.viewColumn);
        return true;
    };
    const registerPanel = (preview) => {
        preview.panel.onDidDispose(() => {
            openedPanels.splice(openedPanels.indexOf(preview), 1);
        });
        openedPanels.push(preview);
    };
    const previewAndCloseSrcDoc = (document) => __awaiter(this, void 0, void 0, function* () {
        if (document.languageId === "pdf") {
            yield vscode.commands.executeCommand("workbench.action.closeActiveEditor");
            if (!revealIfAlreadyOpened(document.uri)) {
                registerPanel(createPreview(context, document.uri, provider));
            }
        }
    });
    const openedEvent = vscode.workspace.onDidOpenTextDocument((document) => {
        previewAndCloseSrcDoc(document);
    });
    const previewCmd = vscode.commands.registerCommand("extension.pdf-preview", (uri) => {
        if (!revealIfAlreadyOpened(uri)) {
            registerPanel(createPreview(context, uri, provider));
        }
    });
    if (vscode.window.registerWebviewPanelSerializer) {
        vscode.window.registerWebviewPanelSerializer(viewType, {
            deserializeWebviewPanel(panel, state) {
                return __awaiter(this, void 0, void 0, function* () {
                    const resource = vscode_1.Uri.parse(state.resource.fsPath);
                    panel.title = panel.title || getPreviewTitle(resource);
                    panel.webview.options = getWebviewOptions(context, resource);
                    panel.webview.html = provider.provideTextDocumentContent(resource, state);
                    registerPanel({ panel, resource });
                });
            }
        });
    }
    // If pdf file is already opened when load workspace.
    if (vscode.window.activeTextEditor) {
        previewAndCloseSrcDoc(vscode.window.activeTextEditor.document);
    }
    context.subscriptions.push(openedEvent, previewCmd);
}
exports.activate = activate;
function createPreview(context, uri, provider) {
    const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : 1;
    const panel = vscode.window.createWebviewPanel(viewType, getPreviewTitle(uri), column, getWebviewOptions(context, uri));
    panel.webview.html = provider.provideTextDocumentContent(uri, { resource: uri });
    return { panel, resource: uri };
}
function getPreviewTitle(uri) {
    return path.basename(uri.fsPath);
}
function getWebviewOptions(context, uri) {
    return {
        enableScripts: true,
        retainContextWhenHidden: true,
        localResourceRoots: getLocalResourceRoots(context, uri)
    };
}
function getLocalResourceRoots(context, resource) {
    const baseRoots = [vscode.Uri.file(context.extensionPath)];
    const folder = vscode.workspace.getWorkspaceFolder(resource);
    if (folder) {
        return baseRoots.concat(folder.uri);
    }
    if (!resource.scheme || resource.scheme === 'file') {
        return baseRoots.concat(vscode.Uri.file(path.dirname(resource.fsPath)));
    }
    return baseRoots;
}
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map