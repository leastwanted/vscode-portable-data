"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchLogByRevision = void 0;
const path = require("path");
const command_1 = require("./command");
const vscode_1 = require("vscode");
const uri_1 = require("../uri");
const types_1 = require("../common/types");
class SearchLogByRevision extends command_1.Command {
    constructor() {
        super("svn.searchLogByRevision", { repository: true });
    }
    async execute(repository) {
        const input = await vscode_1.window.showInputBox({ prompt: "Revision?" });
        if (!input) {
            return;
        }
        const revision = parseInt(input, 10);
        if (!revision || !/^\+?(0|[1-9]\d*)$/.test(input)) {
            vscode_1.window.showErrorMessage("Invalid revision");
            return;
        }
        try {
            const resource = uri_1.toSvnUri(vscode_1.Uri.file(repository.workspaceRoot), types_1.SvnUriAction.LOG_REVISION, { revision });
            const uri = resource.with({
                path: path.join(resource.path, "svn.log")
            });
            await vscode_1.commands.executeCommand("vscode.open", uri);
        }
        catch (error) {
            console.error(error);
            vscode_1.window.showErrorMessage("Unable to log");
        }
    }
}
exports.SearchLogByRevision = SearchLogByRevision;
//# sourceMappingURL=search_log_by_revision.js.map