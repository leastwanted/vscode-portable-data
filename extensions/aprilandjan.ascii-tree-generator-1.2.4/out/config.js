"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
function getConfig() {
    let config = {
        ignore: [
            'node_modules'
        ],
        rootCharCode: vscode.workspace.getConfiguration().get("Root element character code"),
        childCharCode: vscode.workspace.getConfiguration().get("Child element character code"),
        lastCharCode: vscode.workspace.getConfiguration().get("Last element character code"),
        parentCharCode: vscode.workspace.getConfiguration().get("Parent element character code"),
        dashCharCode: vscode.workspace.getConfiguration().get("Dash element character code"),
        blankCharCode: vscode.workspace.getConfiguration().get("Blank element character code")
    };
    return config;
}
exports.getConfig = getConfig;
//# sourceMappingURL=config.js.map