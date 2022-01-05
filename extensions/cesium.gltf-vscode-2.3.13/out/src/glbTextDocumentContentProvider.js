"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlbTextDocumentContentProvider = void 0;
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
//
// GlbTextDocumentContentProvider provide json chunk of glb.
//
class GlbTextDocumentContentProvider {
    constructor() {
        // emitter and its event
        this.onDidChangeEmitter = new vscode.EventEmitter();
        this.onDidChange = this.onDidChangeEmitter.event;
    }
    provideTextDocumentContent(uri) {
        if (!uri.fsPath.endsWith(".json")) {
            return "fsPath must endsWith .json";
        }
        let fsPath = uri.fsPath.substr(0, uri.fsPath.length - 5);
        let data = fs.readFileSync(fsPath);
        let offset = 0;
        if (data.readInt32LE(offset) != 0x46546C67) {
            return `not glb`;
        }
        offset += 4;
        let version = data.readInt32LE(offset);
        if (version != 2) {
            return `gltf version ${version} not support`;
        }
        offset += 4;
        let length = data.readInt32LE(offset);
        offset += 4;
        let json = null;
        let binOffset = null;
        while (offset < length) {
            let chunkLength = data.readInt32LE(offset);
            offset += 4;
            let chunkType = data.readInt32LE(offset);
            offset += 4;
            let chunkData = data.toString('utf8', offset, offset + chunkLength);
            if (chunkType == 0x4E4F534A) {
                json = JSON.parse(chunkData);
            }
            else if (chunkType == 0x004E4942) {
                binOffset = offset;
            }
            else {
                // unknown
            }
            offset += chunkLength;
        }
        if (binOffset && json) {
            // buffer access hack
            json.buffers[0]['uri'] = path.basename(fsPath);
            for (let bufferView of json.bufferViews) {
                bufferView.byteOffset += binOffset;
            }
            return JSON.stringify(json, null, '  ');
        }
        else {
            return `invalid glb`;
        }
    }
}
exports.GlbTextDocumentContentProvider = GlbTextDocumentContentProvider;
;
//# sourceMappingURL=glbTextDocumentContentProvider.js.map