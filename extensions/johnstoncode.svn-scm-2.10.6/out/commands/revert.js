"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const revert_1 = require("../input/revert");
const command_1 = require("./command");
class Revert extends command_1.Command {
    constructor() {
        super("svn.revert");
    }
    async execute(...resourceStates) {
        const selection = await this.getResourceStates(resourceStates);
        if (selection.length === 0 || !(await revert_1.confirmRevert())) {
            return;
        }
        const uris = selection.map(resource => resource.resourceUri);
        const depth = await revert_1.checkAndPromptDepth(uris);
        if (!depth) {
            return;
        }
        await this.runByRepository(uris, async (repository, resources) => {
            if (!repository) {
                return;
            }
            const paths = resources.map(resource => resource.fsPath);
            try {
                await repository.revert(paths, depth);
            }
            catch (error) {
                console.log(error);
                vscode_1.window.showErrorMessage("Unable to revert");
            }
        });
    }
}
exports.Revert = Revert;
//# sourceMappingURL=revert.js.map