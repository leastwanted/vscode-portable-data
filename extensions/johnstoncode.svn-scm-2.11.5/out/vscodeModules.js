"use strict";
// Only this file is allowed to import VSCode modules
// tslint:disable: import-blacklist
Object.defineProperty(exports, "__esModule", { value: true });
exports.keytar = exports.jschardet = exports.iconv = void 0;
const path = require("path");
const vscode = require("vscode");
const appRoot = vscode.env.appRoot;
function loadVSCodeModule(id) {
    try {
        return require(`${appRoot}/node_modules.asar/${id}`);
    }
    catch (ea) {
        // Ignore
    }
    const baseDir = path.dirname(process.execPath);
    try {
        module.paths.unshift(`${baseDir}/node_modules`);
        return require(id);
    }
    catch (eb) {
        vscode.window.showErrorMessage(`Missing dependency, go to "${baseDir}" and run: npm install ${id}`);
    }
}
function getNodeModule(moduleName) {
    try {
        return require(`${appRoot}/node_modules.asar/${moduleName}`);
    }
    catch (error) {
        //Ignore
    }
    const baseDir = path.dirname(process.execPath);
    try {
        module.paths.unshift(`${baseDir}/node_modules`);
        return require(moduleName);
    }
    catch (error) { }
    return undefined;
}
let iconv_lite = getNodeModule("iconv-lite-umd");
if (!iconv_lite) {
    iconv_lite = loadVSCodeModule("iconv-lite");
}
exports.iconv = iconv_lite;
exports.jschardet = loadVSCodeModule("jschardet");
exports.keytar = loadVSCodeModule("keytar");
//# sourceMappingURL=vscodeModules.js.map