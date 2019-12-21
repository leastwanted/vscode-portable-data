"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const util_1 = require("../util");
class RepositoryFilesWatcher {
    constructor(root) {
        this.root = root;
        this.disposables = [];
        const fsWatcher = vscode_1.workspace.createFileSystemWatcher("**");
        this.disposables.push(fsWatcher);
        const isTmp = (uri) => /[\\\/]\.svn[\\\/]tmp/.test(uri.path);
        const isRelevant = (uri) => !isTmp(uri) && util_1.isDescendant(this.root, uri.fsPath);
        this.onDidChange = util_1.filterEvent(fsWatcher.onDidChange, isRelevant);
        this.onDidCreate = util_1.filterEvent(fsWatcher.onDidCreate, isRelevant);
        this.onDidDelete = util_1.filterEvent(fsWatcher.onDidDelete, isRelevant);
        this.onDidAny = util_1.anyEvent(this.onDidChange, this.onDidCreate, this.onDidDelete);
        const svnPattern = /[\\\/]\.svn[\\\/]/;
        const ignoreSvn = (uri) => !svnPattern.test(uri.path);
        this.onDidWorkspaceChange = util_1.filterEvent(this.onDidChange, ignoreSvn);
        this.onDidWorkspaceCreate = util_1.filterEvent(this.onDidCreate, ignoreSvn);
        this.onDidWorkspaceDelete = util_1.filterEvent(this.onDidDelete, ignoreSvn);
        this.onDidWorkspaceAny = util_1.anyEvent(this.onDidWorkspaceChange, this.onDidWorkspaceCreate, this.onDidWorkspaceDelete);
        const ignoreWorkspace = (uri) => svnPattern.test(uri.path);
        this.onDidSvnChange = util_1.filterEvent(this.onDidChange, ignoreWorkspace);
        this.onDidSvnCreate = util_1.filterEvent(this.onDidCreate, ignoreWorkspace);
        this.onDidSvnDelete = util_1.filterEvent(this.onDidDelete, ignoreWorkspace);
        this.onDidSvnAny = util_1.anyEvent(this.onDidSvnChange, this.onDidSvnCreate, this.onDidSvnDelete);
    }
    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}
exports.RepositoryFilesWatcher = RepositoryFilesWatcher;
//# sourceMappingURL=repositoryFilesWatcher.js.map