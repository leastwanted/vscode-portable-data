"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const command_1 = require("./command");
class Close extends command_1.Command {
    constructor() {
        super("svn.close", { repository: true });
    }
    async execute(repository) {
        const model = (await vscode_1.commands.executeCommand("svn.getModel", ""));
        model.close(repository);
    }
}
exports.Close = Close;
//# sourceMappingURL=close.js.map