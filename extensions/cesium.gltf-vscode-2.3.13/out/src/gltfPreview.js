"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GltfPreview = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const contextBase_1 = require("./contextBase");
const utilities_1 = require("./utilities");
class GltfPreview extends contextBase_1.ContextBase {
    constructor(context) {
        super(context);
        this._panels = {};
        this._onDidChangeActivePanel = new vscode.EventEmitter();
        this._onDidChangePanelReady = new vscode.EventEmitter();
        this.onDidChangeActivePanel = this._onDidChangeActivePanel.event;
        this.onDidChangeReadyState = this._onDidChangePanelReady.event;
        this._mainHtml = fs.readFileSync(this._context.asAbsolutePath('pages/previewModel.html'), 'utf-8');
        this._babylonHtml = encodeURI(fs.readFileSync(this._context.asAbsolutePath('pages/babylonView.html'), 'utf-8'));
        this._cesiumHtml = encodeURI(fs.readFileSync(this._context.asAbsolutePath('pages/cesiumView.html'), 'utf-8'));
        this._filamentHtml = encodeURI(fs.readFileSync(this._context.asAbsolutePath('pages/filamentView.html'), 'utf-8'));
        this._threeHtml = encodeURI(fs.readFileSync(this._context.asAbsolutePath('pages/threeView.html'), 'utf-8'));
    }
    asExtensionUriString(panel, s) {
        return panel.webview.asWebviewUri(vscode.Uri.file(path.join(this.extensionRootPath, s))).toString();
    }
    asWebviewUriString(panel, s) {
        return panel.webview.asWebviewUri(vscode.Uri.file(s)).toString();
    }
    // Instructions to open DevTools on the glTF preview window:
    //
    // 1. Open the glTF preview window.
    //
    // 2. Press F1 to open the command bar at the top of VSCode.
    //
    // 3. Type in and run the following command:
    //    Developer: Open Webview Developer Tools
    //
    // 4. In the top of the Console tab of DevTools, click the pull-down
    //    and change `top` to `active-frame (index.html)`.
    openPanel(gltfEditor) {
        const gltfFilePath = gltfEditor.document.fileName;
        let panel = this._panels[gltfFilePath];
        if (!panel) {
            let localResourceRoots = [
                vscode.Uri.file(this._context.extensionPath),
                vscode.Uri.file(path.dirname(gltfFilePath)),
            ];
            const defaultBabylonReflection = this.getConfigResourceUrl('glTF.Babylon', 'environment', localResourceRoots);
            const defaultFilamentReflection = this.getConfigResourceUrl('glTF.Filament', 'environment', localResourceRoots);
            const defaultThreeReflection = this.getConfigResourceUrl('glTF.Three', 'environment', localResourceRoots);
            panel = vscode.window.createWebviewPanel('gltf.preview', 'glTF Preview', vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: localResourceRoots,
            });
            panel._defaultBabylonReflection = defaultBabylonReflection;
            panel._defaultFilamentReflection = defaultFilamentReflection;
            panel._defaultThreeReflection = defaultThreeReflection;
            panel._watchers = [];
            panel.textEditor = gltfEditor;
            panel.onDidDispose(() => {
                this.unwatchFiles(this._panels[gltfFilePath]);
                delete this._panels[gltfFilePath];
                this.updateActivePanel();
            });
            panel.onDidChangeViewState(() => {
                this.updateActivePanel();
            });
            this._panels[gltfFilePath] = panel;
        }
        const gltfContent = gltfEditor.document.getText();
        this.updatePanel(panel, gltfFilePath, gltfContent);
        panel.reveal(vscode.ViewColumn.Two);
        this.setActivePanel(panel);
    }
    get activePanel() {
        return this._activePanel;
    }
    getPanel(fileName) {
        return this._panels[fileName];
    }
    setActivePanel(activePanel) {
        if (this._activePanel !== activePanel) {
            this._activePanel = activePanel;
            this._onDidChangeActivePanel.fire(activePanel);
            if (activePanel) {
                activePanel.webview.postMessage({ command: 'updateDebugMode' });
            }
            else {
                vscode.commands.executeCommand('setContext', 'gltfDebugActive', false);
            }
        }
    }
    updateActivePanel() {
        const activePanel = Object.values(this._panels).find(panel => panel.active);
        this.setActivePanel(activePanel);
    }
    updatePanel(panel, gltfFilePath, gltfContent) {
        let map;
        try {
            map = (0, utilities_1.parseJsonMap)(gltfContent);
        }
        catch (ex) {
            vscode.window.showErrorMessage('' + ex);
            map = { data: { asset: { version: '2.0' } }, pointers: {} };
        }
        panel._jsonMap = map;
        const gltfRootPath = this.asWebviewUriString(panel, path.dirname(gltfFilePath)) + '/';
        const gltfFileName = path.basename(gltfFilePath);
        const gltf = map.data;
        let gltfMajorVersion = 1;
        if (gltf && gltf.asset && gltf.asset.version && gltf.asset.version[0] === '2') {
            gltfMajorVersion = 2;
        }
        panel.title = `glTF Preview [${gltfFileName}]`;
        panel.webview.html = this.formatHtml(panel, gltfMajorVersion, gltfContent, gltfRootPath, gltfFileName)
            .replace(/\${webview.cspSource}/g, panel.webview.cspSource);
        panel.webview.onDidReceiveMessage(message => {
            this.onDidReceiveMessage(panel, message);
        });
        this.watchFiles(panel);
    }
    onDidReceiveMessage(panel, message) {
        switch (message.command) {
            case 'select': {
                const pointer = panel._jsonMap.pointers[message.jsonPointer];
                const document = panel.textEditor.document;
                const range = new vscode.Range(document.positionAt(pointer.value.pos), document.positionAt(pointer.valueEnd.pos));
                vscode.commands.executeCommand('gltf.openGltfSelection', range);
                break;
            }
            case 'setDebugActive': {
                vscode.commands.executeCommand('setContext', 'gltfDebugActive', message.value);
                break;
            }
            case 'showErrorMessage': {
                vscode.window.showErrorMessage(message.message);
                break;
            }
            case 'showWarningMessage': {
                vscode.window.showWarningMessage(message.message);
                break;
            }
            case 'onReady': {
                panel.ready = true;
                this._onDidChangePanelReady.fire(panel);
                break;
            }
            default: {
                throw new Error(`Unknown command: ${message.command}`);
            }
        }
    }
    formatHtml(panel, gltfMajorVersion, gltfContent, gltfRootPath, gltfFileName) {
        const defaultEngine = vscode.workspace.getConfiguration('glTF').get('defaultV' + gltfMajorVersion + 'Engine');
        const dracoLoaderPath = this.asExtensionUriString(panel, 'engines/Draco/draco_decoder.js');
        const dracoLoaderWasmPath = this.asExtensionUriString(panel, 'engines/Draco/draco_decoder.wasm');
        // These strings are available in JavaScript by looking up the ID.  They provide the extension's root
        // path (needed for locating additional assets), various settings, and the glTF name and contents.
        // Some engines can display "live" glTF contents, others must load from the glTF path and filename.
        // The path name is needed for glTF files that include external resources.
        const strings = [
            { id: 'extensionRootPath', text: this.asWebviewUriString(panel, this.extensionRootPath) },
            { id: 'defaultEngine', text: defaultEngine },
            { id: 'defaultBabylonReflection', text: this.asWebviewUriString(panel, panel._defaultBabylonReflection) },
            { id: 'defaultFilamentReflection', text: this.asWebviewUriString(panel, panel._defaultFilamentReflection) },
            { id: 'defaultThreeReflection', text: this.asWebviewUriString(panel, panel._defaultThreeReflection).replace('%7Bface%7D', '{face}') },
            { id: 'dracoLoaderPath', text: dracoLoaderPath },
            { id: 'dracoLoaderWasmPath', text: dracoLoaderWasmPath },
            { id: 'threeModulePath', text: this.asExtensionUriString(panel, 'node_modules/three/build/three.module.js') },
            { id: 'babylonHtml', text: this._babylonHtml },
            { id: 'cesiumHtml', text: this._cesiumHtml },
            { id: 'filamentHtml', text: this._filamentHtml },
            { id: 'threeHtml', text: this._threeHtml },
            { id: 'gltf', text: gltfContent },
            { id: 'gltfRootPath', text: gltfRootPath },
            { id: 'gltfFileName', text: gltfFileName }
        ];
        const styles = [
            'pages/babylonView.css',
            'pages/cesiumView.css',
            'pages/filamentView.css',
            'pages/threeView.css',
            'pages/previewModel.css'
        ].map(s => this.asExtensionUriString(panel, s));
        const scripts = [
            'node_modules/cesium/Build/Cesium/Cesium.js',
            'node_modules/babylonjs/babylon.js',
            'node_modules/babylonjs-loaders/babylonjs.loaders.min.js',
            'node_modules/babylonjs-inspector/babylon.inspector.bundle.js',
            'node_modules/gltumble/gltumble.min.js',
            'node_modules/filament/filament.js',
            'pages/babylonView.js',
            'pages/babylonDebug.js'
        ].map(s => this.asExtensionUriString(panel, s));
        const modules = [
            'pages/cesiumView.js',
            'pages/previewModel.js'
        ].map(s => this.asExtensionUriString(panel, s));
        // Note that with the file: protocol, we must manually specify the UTF-8 charset.
        return this._mainHtml.replace('{assets}', styles.map(s => `<link rel="stylesheet" href="${s}"></link>\n`).join('') +
            strings.map(s => `<script id="${s.id}" type="text/plain">${s.text}</script>\n`).join('') +
            scripts.map(s => `<script type="text/javascript" charset="UTF-8" crossorigin="anonymous" src="${s}"></script>\n`).join('') +
            modules.map(s => `<script type="module" charset="UTF-8" src="${s}"></script>\n`).join(''));
    }
    watchFiles(panel) {
        this.unwatchFiles(panel);
        const document = panel.textEditor.document;
        const documentFilePath = document.fileName;
        panel._watchers.push(fs.watch(documentFilePath, () => {
            this.updatePanel(panel, documentFilePath, document.getText());
        }));
        const documentDirectoryPath = path.dirname(documentFilePath);
        const watch = (object) => {
            for (const key in object) {
                if (object.hasOwnProperty(key)) {
                    const value = object[key];
                    if (key === "uri" && typeof value === "string" && !value.startsWith("data:")) {
                        const filePath = path.join(documentDirectoryPath, decodeURI(value));
                        if (fs.existsSync(filePath)) {
                            panel._watchers.push(fs.watch(filePath, () => {
                                panel.webview.postMessage({ command: 'refresh' });
                            }));
                        }
                    }
                    else if (typeof value === "object") {
                        watch(value);
                    }
                }
            }
        };
        watch(panel._jsonMap.data);
    }
    unwatchFiles(panel) {
        for (const watcher of panel._watchers) {
            watcher.close();
        }
        panel._watchers.length = 0;
    }
}
exports.GltfPreview = GltfPreview;
//# sourceMappingURL=gltfPreview.js.map