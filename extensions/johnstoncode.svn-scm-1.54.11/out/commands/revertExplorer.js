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
const revert_1 = require("../input/revert");
const command_1 = require("./command");
class RevertExplorer extends command_1.Command {
    constructor() {
        super("svn.revertExplorer");
    }
    execute(_mainUri, allUris) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!allUris) {
                return;
            }
            const uris = allUris;
            if (uris.length === 0 || !(yield revert_1.confirmRevert())) {
                return;
            }
            const depth = yield revert_1.checkAndPromptDepth(uris);
            if (!depth) {
                return;
            }
            yield this.runByRepository(uris, (repository, resources) => __awaiter(this, void 0, void 0, function* () {
                if (!repository) {
                    return;
                }
                const paths = resources.map(resource => resource.fsPath);
                try {
                    yield repository.revert(paths, depth);
                }
                catch (error) {
                    console.log(error);
                    vscode_1.window.showErrorMessage("Unable to revert");
                }
            }));
        });
    }
}
exports.RevertExplorer = RevertExplorer;
//# sourceMappingURL=revertExplorer.js.map