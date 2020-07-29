"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoveUnversioned = void 0;
const command_1 = require("./command");
const vscode_1 = require("vscode");
class RemoveUnversioned extends command_1.Command {
    constructor() {
        super("svn.removeUnversioned", { repository: true });
    }
    async execute(repository) {
        const answer = await vscode_1.window.showWarningMessage("Are you sure? This will remove all unversioned files except for ignored.", { modal: true }, "Yes", "No");
        if (answer !== "Yes") {
            return;
        }
        await repository.removeUnversioned();
    }
}
exports.RemoveUnversioned = RemoveUnversioned;
//# sourceMappingURL=removeUnversioned.js.map