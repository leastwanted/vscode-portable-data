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
const os = require("os");
const path = require("path");
const vscode_1 = require("vscode");
const fs_1 = require("./fs");
const crypto = require("crypto");
exports.tempdir = path.join(os.tmpdir(), "vscode-svn");
function createTempSvnRevisionFile(svnUri, revision, payload) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield fs_1.exists(exports.tempdir))) {
            yield fs_1.mkdir(exports.tempdir);
        }
        const fname = `r${revision}_${path.basename(svnUri.fsPath)}`;
        const hash = crypto.createHash("md5");
        const data = hash.update(svnUri.path);
        const filePathHash = data.digest("hex");
        if (!(yield fs_1.exists(path.join(exports.tempdir, filePathHash)))) {
            yield fs_1.mkdir(path.join(exports.tempdir, filePathHash));
        }
        const fpath = path.join(exports.tempdir, filePathHash, fname);
        yield fs_1.writeFile(fpath, payload);
        return vscode_1.Uri.file(fpath);
    });
}
exports.createTempSvnRevisionFile = createTempSvnRevisionFile;
//# sourceMappingURL=tempFiles.js.map