"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const moment = require("moment");
class Logger {
    static log(...message) {
        if (this.channel) {
            let time = moment().format("MM-DD HH:mm:ss");
            for (let m of message)
                this.channel.appendLine(`[${time}] ${m}`);
        }
    }
    static showInformationMessage(message, ...items) {
        this.log(message);
        return vscode.window.showInformationMessage(message, ...items);
    }
    static showErrorMessage(message, ...items) {
        this.log(message);
        return vscode.window.showErrorMessage(message, ...items);
    }
}
exports.default = Logger;
//# sourceMappingURL=Logger.js.map