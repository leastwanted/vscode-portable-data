"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const generator_1 = require("./lib/generator");
const config_1 = require("./config");
let isInTestMode = false;
/**
 * get user file eol setting. if not specific, behave defaultly according platform
 */
function getUserEOL() {
    //  strange type definition of 'get'...
    const eol = vscode.workspace.getConfiguration('files').get('eol');
    if (!eol || eol === 'auto') {
        return process.platform === "win32" ? '\r\n' : '\n';
    }
    return eol;
}
exports.getUserEOL = getUserEOL;
/**
 * create webview, with the ability to copy to clipboard, ect
 * @param text
 * @param context
 */
function createWebview(context, text = '') {
    const panel = vscode.window.createWebviewPanel('AsciiTreeGenerator', 'Ascii Tree', vscode.ViewColumn.One, {
        enableScripts: true,
    });
    panel.webview.html = fs.readFileSync(path.join(__dirname, '../static/webview.html'), 'utf8');
    panel.webview.postMessage({
        command: 'setText',
        payload: text,
    });
    //	listen webview messages
    panel.webview.onDidReceiveMessage(message => {
        const { command } = message;
        switch (command) {
            case 'copy':
                vscode.env.clipboard.writeText(text).then(() => {
                    vscode.window.showInformationMessage('Copy to Clipboard Successfully.');
                });
                break;
        }
    }, null, context.subscriptions);
    panel.onDidChangeViewState(e => {
        const panel = e.webviewPanel;
        if (panel.active) {
            panel.webview.postMessage({
                command: 'setText',
                payload: text,
            });
        }
    }, null, context.subscriptions);
    return panel;
}
exports.createWebview = createWebview;
/** create a revert regexp according to current config, and revert tree-string back */
function revertTreeString(treeString, replaceWith = '#') {
    const { child, last, parent, dash, blank } = getCharCodesFromConfig();
    //  [└├]──|│ {3}|^( {4})+?|( {4})(?=.*[└├│])
    const reg = new RegExp(`[${last}${child}]${dash}${dash}|${parent}${blank}{3}|^(${blank}{4})+?|(${blank}{4})(?=.*[${last}${child}${parent}])`, 'gm');
    return treeString.replace(reg, replaceWith);
}
exports.revertTreeString = revertTreeString;
function setTestMode() {
    console.info("Test mode was enabled: The default charset will be used instead of the user-defined");
    isInTestMode = true;
}
exports.setTestMode = setTestMode;
function getCharCodesFromConfig() {
    if (isInTestMode) {
        return generator_1.defaultCharset;
    }
    let config = config_1.getConfig();
    let charset = {
        root: validateCharCode(config.rootCharCode, generator_1.defaultCharset.root),
        child: validateCharCode(config.childCharCode, generator_1.defaultCharset.child),
        last: validateCharCode(config.lastCharCode, generator_1.defaultCharset.last),
        parent: validateCharCode(config.parentCharCode, generator_1.defaultCharset.parent),
        dash: validateCharCode(config.dashCharCode, generator_1.defaultCharset.dash),
        blank: validateCharCode(config.blankCharCode, generator_1.defaultCharset.blank)
    };
    return charset;
}
exports.getCharCodesFromConfig = getCharCodesFromConfig;
function validateCharCode(userValue, fallback) {
    if (typeof userValue === "undefined" || userValue < 0 || userValue > 65535) {
        return fallback;
    }
    else {
        return String.fromCharCode(userValue);
    }
}
//# sourceMappingURL=utils.js.map