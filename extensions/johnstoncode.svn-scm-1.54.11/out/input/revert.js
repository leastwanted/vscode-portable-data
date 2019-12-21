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
const types_1 = require("../common/types");
const fs_1 = require("../fs");
function confirmRevert() {
    return __awaiter(this, void 0, void 0, function* () {
        const yes = "Yes I'm sure";
        const answer = yield vscode_1.window.showWarningMessage("Are you sure? This will wipe all local changes.", { modal: true }, yes);
        if (answer !== yes) {
            return false;
        }
        return true;
    });
}
exports.confirmRevert = confirmRevert;
function promptDepth() {
    return __awaiter(this, void 0, void 0, function* () {
        const picks = [];
        for (const depth in types_1.SvnDepth) {
            if (types_1.SvnDepth.hasOwnProperty(depth)) {
                picks.push({ label: depth, description: types_1.SvnDepth[depth] });
            }
        }
        const placeHolder = "Select revert depth";
        const pick = yield vscode_1.window.showQuickPick(picks, { placeHolder });
        if (!pick) {
            return undefined;
        }
        return pick.label;
    });
}
exports.promptDepth = promptDepth;
function checkAndPromptDepth(uris, defaultDepth = "empty") {
    return __awaiter(this, void 0, void 0, function* () {
        // Without uris, force prompt
        let hasDirectory = uris.length === 0;
        for (const uri of uris) {
            if (uri.scheme !== "file") {
                continue;
            }
            try {
                const stat = yield fs_1.lstat(uri.fsPath);
                if (stat.isDirectory()) {
                    hasDirectory = true;
                    break;
                }
            }
            catch (error) {
                // ignore
            }
        }
        if (hasDirectory) {
            return yield promptDepth();
        }
        return defaultDepth;
    });
}
exports.checkAndPromptDepth = checkAndPromptDepth;
//# sourceMappingURL=revert.js.map