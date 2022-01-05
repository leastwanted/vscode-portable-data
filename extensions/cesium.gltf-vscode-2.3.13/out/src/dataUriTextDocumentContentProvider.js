"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataUriTextDocumentContentProvider = void 0;
const vscode = require("vscode");
const path = require("path");
const Url = require("url");
const fs = require("fs");
const querystring = require("querystring");
const draco3dgltf = require("draco3dgltf");
const gltf_import_export_1 = require("gltf-import-export");
const sprintf_js_1 = require("sprintf-js");
const utilities_1 = require("./utilities");
let decoderModule;
draco3dgltf.createDecoderModule({}).then(function (module) {
    decoderModule = module;
});
class DataUriTextDocumentContentProvider {
    constructor(context) {
        this._onDidChange = new vscode.EventEmitter();
        this.UriPrefix = 'gltf-dataUri:';
        this._context = context;
    }
    // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
    uriIfNotDataUri(glTF, jsonPointer) {
        const data = (0, utilities_1.getFromJsonPointer)(glTF, jsonPointer);
        if ((typeof data === 'object') && data.hasOwnProperty('uri')) {
            const uri = data.uri;
            if (!uri.startsWith('data:')) {
                return uri;
            }
        }
        return null;
    }
    isImage(jsonPointer) {
        return jsonPointer.startsWith('/images/');
    }
    isShader(jsonPointer) {
        return jsonPointer.startsWith('/shaders/');
    }
    isAccessor(jsonPointer) {
        return jsonPointer.startsWith('/accessors/');
    }
    isMeshPrimitive(jsonPointer) {
        return !!jsonPointer.match(/^\/meshes\/\d+\/primitives\//);
    }
    async provideTextDocumentContent(uri) {
        const fileName = decodeURIComponent(uri.fragment);
        const query = querystring.parse(uri.query);
        query.viewColumn = query.viewColumn || vscode.ViewColumn.Active.toString();
        let glTFContent;
        const document = vscode.workspace.textDocuments.find(e => e.uri.scheme === 'file' && e.fileName === fileName);
        if (document) {
            glTFContent = document.getText();
        }
        else {
            glTFContent = fs.readFileSync(fileName, 'utf-8');
        }
        const glTF = JSON.parse(glTFContent);
        let jsonPointer = uri.path;
        if (this.isShader(jsonPointer) && jsonPointer.endsWith('.glsl')) {
            jsonPointer = jsonPointer.substring(0, jsonPointer.length - 5);
        }
        const data = (0, utilities_1.getFromJsonPointer)(glTF, jsonPointer);
        if (data && (typeof data === 'object')) {
            if (data.hasOwnProperty('uri')) {
                let dataUri = data.uri;
                let previewTitle = dataUri;
                if (!dataUri.startsWith('data:')) {
                    // Not a DataURI: Look up external reference.
                    const name = decodeURI(Url.resolve(fileName, dataUri));
                    const contents = fs.readFileSync(name);
                    dataUri = 'data:image;base64,' + (0, utilities_1.btoa)(contents);
                    previewTitle = decodeURI(previewTitle);
                }
                else {
                    previewTitle = jsonPointer;
                }
                if (this.isImage(jsonPointer)) {
                    // Peek Definition requests have a document that matches the current document
                    // Go to Definition has an undefined activeTextEditor
                    // Inspect Data Uri has a document that matches current but we provide a non-default viewColumn
                    // In the last two cases we want to close the current (to be empty editor), for Peek we leave it open.
                    if (vscode.window.activeTextEditor === undefined || vscode.window.activeTextEditor.document !== document || query.viewColumn !== vscode.ViewColumn.Active.toString()) {
                        await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
                    }
                    let localResourceRoots = [
                        vscode.Uri.file(this._context.extensionPath)
                    ];
                    if (document) {
                        localResourceRoots.push(vscode.Uri.file(path.dirname(document.fileName)));
                    }
                    let panel = vscode.window.createWebviewPanel('gltf.imagePreview', previewTitle, vscode.ViewColumn.Two, {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                        localResourceRoots: localResourceRoots,
                    });
                    const cssUri = panel.webview.asWebviewUri(vscode.Uri.file(this._context.asAbsolutePath('pages/imagePreview.css'))).toString();
                    panel.webview.html = `<html><head><link rel="stylesheet" href="${cssUri}"></link></head>` +
                        `<body><div class="monaco-resource-viewer image oversized" ` +
                        `onclick="this.classList.toggle(\'full-size\');" ><img src="${dataUri}" /></div></body></html>`;
                    panel.reveal(vscode.ViewColumn.Two);
                    return 'See image viewer window.';
                }
                const posBase = dataUri.indexOf('base64,');
                const body = dataUri.substring(posBase + 7);
                return (0, utilities_1.atob)(body);
            }
            else if (this.isAccessor(jsonPointer)) {
                return this.formatAccessor(fileName, glTF, data);
            }
        }
        else if (jsonPointer.includes('KHR_draco_mesh_compression')) {
            return this.formatDraco(glTF, jsonPointer, fileName);
        }
        return 'Unknown:\n' + jsonPointer;
    }
    formatAccessor(fileName, glTF, accessor) {
        const data = (0, utilities_1.getAccessorData)(fileName, glTF, accessor);
        if (!data) {
            return 'Accessor does not contain a bufferView';
        }
        let result = '';
        const numComponents = utilities_1.AccessorTypeToNumComponents[accessor.type];
        for (let index = 0; index < accessor.count; index++) {
            const values = (0, utilities_1.getAccessorElement)(data, index, numComponents, accessor.componentType, accessor.normalized);
            const format = (accessor.componentType === 5126 /* FLOAT */ || accessor.normalized) ? '%11.5f' : '%5d';
            if (accessor.type.startsWith('MAT')) {
                const size = Math.sqrt(numComponents);
                for (let rowIndex = 0; rowIndex < size; rowIndex++) {
                    const start = rowIndex * size;
                    const end = start + size;
                    result += values.slice(start, end).map(value => (0, sprintf_js_1.sprintf)(format, value)).join('') + '\n';
                }
                result += '\n';
            }
            else {
                result += values.map(value => (0, sprintf_js_1.sprintf)(format, value)).join('') + '\n';
            }
        }
        return result;
    }
    formatDraco(glTF, jsonPointer, fileName) {
        const attrIndex = jsonPointer.lastIndexOf('/');
        if (attrIndex === -1) {
            return 'Invalid path:\n' + jsonPointer;
        }
        let attrName = jsonPointer.substr(attrIndex + 1);
        const dracoIndex = jsonPointer.lastIndexOf('/', attrIndex - 1);
        if (dracoIndex === -1) {
            return 'Invalid path:\n' + jsonPointer;
        }
        const extIndex = jsonPointer.lastIndexOf('/', dracoIndex - 1);
        if (extIndex === -1) {
            return 'Invalid path:\n' + jsonPointer;
        }
        const primitiveIndex = jsonPointer.lastIndexOf('/', extIndex - 1);
        if (primitiveIndex === -1) {
            return 'Invalid path:\n' + jsonPointer;
        }
        if (!decoderModule) {
            return 'Error: Draco module not loaded.';
        }
        const primitivePointer = jsonPointer.substring(0, primitiveIndex);
        const primitive = (0, utilities_1.getFromJsonPointer)(glTF, primitivePointer);
        const dracoExtension = primitive.extensions['KHR_draco_mesh_compression'];
        let accessor;
        if (attrName !== 'indices') {
            accessor = glTF.accessors[primitive.attributes[attrName]];
        }
        let bufferView = glTF.bufferViews[dracoExtension.bufferView];
        let glTFBuffer = (0, gltf_import_export_1.getBuffer)(glTF, bufferView.buffer, fileName);
        const bufferOffset = bufferView.byteOffset || 0;
        const bufferLength = bufferView.byteLength;
        const bufferViewBuf = glTFBuffer.slice(bufferOffset, bufferOffset + bufferLength);
        const decoder = new decoderModule.Decoder();
        const dracoBuffer = new decoderModule.DecoderBuffer();
        let dracoGeometry;
        let dracoMeshData;
        let faceIndices;
        try {
            dracoBuffer.Init(new Int8Array(bufferViewBuf), bufferViewBuf.byteLength);
            const geometryType = decoder.GetEncodedGeometryType(dracoBuffer);
            let status;
            switch (geometryType) {
                case decoderModule.TRIANGULAR_MESH:
                    dracoGeometry = new decoderModule.Mesh();
                    status = decoder.DecodeBufferToMesh(dracoBuffer, dracoGeometry);
                    break;
                case decoderModule.POINT_CLOUD:
                    if (attrName === 'indices') {
                        return "Indices only valid for TRIANGULAR_MESH geometry.";
                    }
                    dracoGeometry = new decoderModule.PointCloud();
                    status = decoder.DecodeBufferToPointCloud(dracoBuffer, dracoGeometry);
                    break;
                default:
                    return `Invalid geometry type ${geometryType}`;
            }
            if (!status.ok() || !dracoGeometry.ptr) {
                return status.error_msg();
            }
            let result = '';
            if (attrName === 'indices') {
                const faceIndices = new decoderModule.DracoInt32Array();
                for (let i = 0; i < dracoGeometry.num_faces(); i++) {
                    decoder.GetFaceFromMesh(dracoGeometry, i, faceIndices);
                    result += (0, sprintf_js_1.sprintf)('%5d\n%5d\n%5d\n', faceIndices.GetValue(0), faceIndices.GetValue(1), faceIndices.GetValue(2));
                }
            }
            else {
                const attributeId = (0, utilities_1.getFromJsonPointer)(glTF, jsonPointer);
                const attribute = decoder.GetAttributeByUniqueId(dracoGeometry, attributeId);
                dracoMeshData = new decoderModule.DracoFloat32Array();
                decoder.GetAttributeFloatForAllPoints(dracoGeometry, attribute, dracoMeshData);
                const numPoints = dracoGeometry.num_points();
                const numComponents = attribute.num_components();
                for (let i = 0; i < (numPoints * numComponents); i++) {
                    const value = dracoMeshData.GetValue(i);
                    if (i % numComponents === 0 && i !== 0) {
                        result += '\n';
                    }
                    if (accessor.componentType === 5126 /* FLOAT */) {
                        result += (0, sprintf_js_1.sprintf)('%11.5f', value) + ' ';
                    }
                    else {
                        result += (0, sprintf_js_1.sprintf)('%5d', value) + ' ';
                    }
                }
            }
            return result;
        }
        finally {
            if (faceIndices) {
                decoderModule.destroy(faceIndices);
            }
            if (dracoMeshData) {
                decoderModule.destroy(dracoMeshData);
            }
            if (dracoGeometry) {
                decoderModule.destroy(dracoGeometry);
            }
            decoderModule.destroy(dracoBuffer);
            decoderModule.destroy(decoder);
        }
    }
    get onDidChange() {
        return this._onDidChange.event;
    }
    update(uri) {
        this._onDidChange.fire(uri);
    }
}
exports.DataUriTextDocumentContentProvider = DataUriTextDocumentContentProvider;
//# sourceMappingURL=dataUriTextDocumentContentProvider.js.map