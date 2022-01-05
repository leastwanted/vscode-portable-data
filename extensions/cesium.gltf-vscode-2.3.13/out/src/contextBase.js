"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextBase = void 0;
const vscode = require("vscode");
const path = require("path");
class ContextBase {
    constructor(context) {
        this._context = context;
        this._extensionRootPath = this._context.extensionPath;
    }
    get extensionRootPath() {
        return this._extensionRootPath;
    }
    getConfigResourceUrl(section, name, localResourceRoots) {
        let value = vscode.workspace.getConfiguration(section).get(name);
        if (value.startsWith('{extensionRootPath}')) {
            value = path.join(this._extensionRootPath, value.replace(/^{extensionRootPath}\/?\\?/, ''));
        }
        localResourceRoots.push(vscode.Uri.file(path.dirname(value)));
        return value;
    }
}
exports.ContextBase = ContextBase;
//# sourceMappingURL=contextBase.js.map