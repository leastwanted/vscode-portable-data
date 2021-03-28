"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
class ConfigReader extends vscode.Disposable {
    constructor(section) {
        super(() => this.dispose());
        this._section = section;
        this._disposable = vscode.workspace.onDidChangeConfiguration(e => {
            this.onChange(e);
        });
    }
    dispose() {
        this._disposable && this._disposable.dispose();
    }
    read(key, ...para) {
        let resource = para.shift();
        let folder = resource ? vscode.workspace.getWorkspaceFolder(resource) : undefined;
        let conf = vscode.workspace.getConfiguration(this._section, resource);
        let value = conf.get(key);
        let func = undefined;
        if (para.length)
            func = para.shift();
        if (func && folder && folder.uri) {
            value = func(folder.uri, value);
        }
        // console.log(key, "=", value, ":", resource ? resource.fsPath : "undefined");
        return value;
    }
    /**
     * read the value of a window scope setting.
     * @param key the key name of a setting
     */
    readGlobal(key) {
        let conf = vscode.workspace.getConfiguration(this._section);
        let results = conf.inspect(key);
        let value = undefined;
        if (results.globalValue !== undefined)
            value = results.globalValue;
        else
            value = results.defaultValue;
        return value;
    }
}
exports.ConfigReader = ConfigReader;
//# sourceMappingURL=configReader.js.map