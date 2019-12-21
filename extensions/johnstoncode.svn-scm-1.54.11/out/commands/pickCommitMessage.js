"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const command_1 = require("./command");
class PickCommitMessage extends command_1.Command {
    constructor() {
        super("svn.pickCommitMessage", { repository: true });
    }
    execute(repository) {
        return __awaiter(this, void 0, void 0, function* () {
            const logs = yield repository.log("HEAD", "0", 20);
            if (!logs.length) {
                return;
            }
            const picks = logs.map(l => {
                return {
                    label: l.msg,
                    description: `r${l.revision} | ${l.author} | ${new Date(l.date).toLocaleString()}`
                };
            });
            const selected = yield vscode_1.window.showQuickPick(picks);
            if (selected === undefined) {
                return;
            }
            const msg = selected.label;
            repository.inputBox.value = msg;
            return msg;
        });
    }
}
exports.PickCommitMessage = PickCommitMessage;
//# sourceMappingURL=pickCommitMessage.js.map