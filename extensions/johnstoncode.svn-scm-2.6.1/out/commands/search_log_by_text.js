"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const command_1 = require("./command");
const vscode_1 = require("vscode");
const uri_1 = require("../uri");
const types_1 = require("../common/types");
class SearchLogByText extends command_1.Command {
    constructor() {
        super("svn.searchLogByText", { repository: true });
    }
    async execute(repository) {
        const input = await vscode_1.window.showInputBox({ prompt: "Search query" });
        if (!input) {
            return;
        }
        try {
            const resource = uri_1.toSvnUri(vscode_1.Uri.file(repository.workspaceRoot), types_1.SvnUriAction.LOG_SEARCH, { search: input });
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
exports.SearchLogByText = SearchLogByText;
//# sourceMappingURL=search_log_by_text.js.map