"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchLogByText = void 0;
const command_1 = require("./command");
const vscode_1 = require("vscode");
const cp = require("child_process");
const temp_svn_fs_1 = require("../temp_svn_fs");
class SearchLogByText extends command_1.Command {
    constructor() {
        super("svn.searchLogByText", { repository: true });
    }
    async execute(repository) {
        const input = await vscode_1.window.showInputBox({ prompt: "Search query" });
        if (!input) {
            return;
        }
        const uri = vscode_1.Uri.parse("tempsvnfs:/svn.log");
        temp_svn_fs_1.tempSvnFs.writeFile(uri, Buffer.from(""), {
            create: true,
            overwrite: true
        });
        await vscode_1.commands.executeCommand("vscode.open", uri);
        const proc = cp.spawn("svn", ["log", "--search", input], {
            cwd: repository.workspaceRoot
        });
        let content = "";
        proc.stdout.on("data", data => {
            content += data.toString();
            temp_svn_fs_1.tempSvnFs.writeFile(uri, Buffer.from(content), {
                create: true,
                overwrite: true
            });
        });
        vscode_1.window.withProgress({
            cancellable: true,
            location: vscode_1.ProgressLocation.Notification,
            title: "Searching Log"
        }, (_progress, token) => {
            token.onCancellationRequested(() => {
                proc.kill("SIGINT");
            });
            return new Promise((resolve, reject) => {
                proc.on("exit", (code) => {
                    code === 0 ? resolve() : reject();
                });
            });
        });
    }
}
exports.SearchLogByText = SearchLogByText;
//# sourceMappingURL=search_log_by_text.js.map