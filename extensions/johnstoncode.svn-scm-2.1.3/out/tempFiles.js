"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const os = require("os");
const path = require("path");
const vscode_1 = require("vscode");
const fs_1 = require("./fs");
const crypto = require("crypto");
exports.tempdir = path.join(os.tmpdir(), "vscode-svn");
async function createTempSvnRevisionFile(svnUri, revision, payload) {
    if (!(await fs_1.exists(exports.tempdir))) {
        await fs_1.mkdir(exports.tempdir);
    }
    const fname = `r${revision}_${path.basename(svnUri.fsPath)}`;
    const hash = crypto.createHash("md5");
    const data = hash.update(svnUri.path);
    const filePathHash = data.digest("hex");
    if (!(await fs_1.exists(path.join(exports.tempdir, filePathHash)))) {
        await fs_1.mkdir(path.join(exports.tempdir, filePathHash));
    }
    const fpath = path.join(exports.tempdir, filePathHash, fname);
    await fs_1.writeFile(fpath, payload);
    return vscode_1.Uri.file(fpath);
}
exports.createTempSvnRevisionFile = createTempSvnRevisionFile;
//# sourceMappingURL=tempFiles.js.map