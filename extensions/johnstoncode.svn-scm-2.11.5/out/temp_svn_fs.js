"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tempSvnFs = exports.Directory = exports.File = void 0;
const vscode_1 = require("vscode");
const path = require("path");
const crypto = require("crypto");
const configuration_1 = require("./helpers/configuration");
const vscodeModules_1 = require("./vscodeModules");
class File {
    constructor(name) {
        this.type = vscode_1.FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
    }
}
exports.File = File;
class Directory {
    constructor(name) {
        this.type = vscode_1.FileType.Directory;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
        this.entries = new Map();
    }
}
exports.Directory = Directory;
class TempSvnFs {
    constructor() {
        this._emitter = new vscode_1.EventEmitter();
        this._bufferedEvents = [];
        this._root = new Directory("");
        this._disposables = [];
        this.onDidChangeFile = this._emitter.event;
        this._disposables.push(vscode_1.workspace.registerFileSystemProvider("tempsvnfs", this, {
            isCaseSensitive: true
        }), vscode_1.workspace.onDidCloseTextDocument(event => {
            if (event.uri.scheme === "tempsvnfs") {
                this.delete(event.uri);
            }
        }));
    }
    watch(_resource) {
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        return new vscode_1.Disposable(() => { });
    }
    stat(uri) {
        return this._lookup(uri, false);
    }
    readDirectory(uri) {
        const entry = this._lookupAsDirectory(uri, false);
        const result = [];
        for (const [name, child] of entry.entries) {
            result.push([name, child.type]);
        }
        return result;
    }
    createDirectory(uri) {
        const basename = path.posix.basename(uri.path);
        const dirname = uri.with({ path: path.posix.dirname(uri.path) });
        const parent = this._lookupAsDirectory(dirname, false);
        const entry = new Directory(basename);
        parent.entries.set(entry.name, entry);
        parent.mtime = Date.now();
        parent.size += 1;
        this._fireSoon({ type: vscode_1.FileChangeType.Changed, uri: dirname }, { type: vscode_1.FileChangeType.Created, uri });
    }
    readFile(uri) {
        const data = this._lookupAsFile(uri, false).data;
        if (data) {
            return data;
        }
        throw vscode_1.FileSystemError.FileNotFound();
    }
    writeFile(uri, content, options) {
        const basename = path.posix.basename(uri.path);
        const parent = this._lookupParentDirectory(uri);
        let entry = parent.entries.get(basename);
        if (entry instanceof Directory) {
            throw vscode_1.FileSystemError.FileIsADirectory(uri);
        }
        if (!entry && !options.create) {
            throw vscode_1.FileSystemError.FileNotFound(uri);
        }
        if (entry && options.create && !options.overwrite) {
            throw vscode_1.FileSystemError.FileExists(uri);
        }
        if (!entry) {
            entry = new File(basename);
            parent.entries.set(basename, entry);
            this._fireSoon({ type: vscode_1.FileChangeType.Created, uri });
        }
        entry.mtime = Date.now();
        entry.size = content.byteLength;
        entry.data = content;
        this._fireSoon({ type: vscode_1.FileChangeType.Changed, uri });
    }
    delete(uri) {
        const dirname = uri.with({ path: path.posix.dirname(uri.path) });
        const basename = path.posix.basename(uri.path);
        const parent = this._lookupAsDirectory(dirname, false);
        if (!parent.entries.has(basename)) {
            throw vscode_1.FileSystemError.FileNotFound(uri);
        }
        parent.entries.delete(basename);
        parent.mtime = Date.now();
        parent.size -= 1;
        this._fireSoon({ type: vscode_1.FileChangeType.Changed, uri: dirname }, { type: vscode_1.FileChangeType.Deleted, uri });
    }
    rename(oldUri, newUri, options) {
        if (!options.overwrite && this._lookup(newUri, true)) {
            throw vscode_1.FileSystemError.FileExists(newUri);
        }
        const entry = this._lookup(oldUri, false);
        const oldParent = this._lookupParentDirectory(oldUri);
        const newParent = this._lookupParentDirectory(newUri);
        const newName = path.posix.basename(newUri.path);
        oldParent.entries.delete(entry.name);
        entry.name = newName;
        newParent.entries.set(newName, entry);
        this._fireSoon({ type: vscode_1.FileChangeType.Deleted, uri: oldUri }, { type: vscode_1.FileChangeType.Created, uri: newUri });
    }
    async createTempSvnRevisionFile(svnUri, revision, content) {
        const fname = `r${revision}_${path.basename(svnUri.fsPath)}`;
        const hash = crypto.createHash("md5");
        const filePathHash = hash.update(svnUri.path).digest("hex");
        const encoding = configuration_1.configuration.get("default.encoding");
        let contentBuffer;
        if (encoding) {
            contentBuffer = Buffer.from(vscodeModules_1.iconv.encode(content, encoding));
        }
        else {
            contentBuffer = Buffer.from(content);
        }
        if (!this._root.entries.has(filePathHash)) {
            this.createDirectory(vscode_1.Uri.parse(`tempsvnfs:/${filePathHash}`));
        }
        const uri = vscode_1.Uri.parse(`tempsvnfs:/${filePathHash}/${fname}`, true);
        this.writeFile(uri, contentBuffer, {
            create: true,
            overwrite: true
        });
        return uri;
    }
    dispose() {
        this._disposables.forEach(disposable => disposable.dispose());
        this._disposables = [];
        for (const [name] of this.readDirectory(vscode_1.Uri.parse("tempsvnfs:/"))) {
            this.delete(vscode_1.Uri.parse(`tempsvnfs:/${name}`));
        }
    }
    _lookup(uri, silent) {
        const parts = uri.path.split("/");
        let entry = this._root;
        for (const part of parts) {
            if (!part) {
                continue;
            }
            let child;
            if (entry instanceof Directory) {
                child = entry.entries.get(part);
            }
            if (!child) {
                if (!silent) {
                    throw vscode_1.FileSystemError.FileNotFound(uri);
                }
                else {
                    return undefined;
                }
            }
            entry = child;
        }
        return entry;
    }
    _lookupAsDirectory(uri, silent) {
        const entry = this._lookup(uri, silent);
        if (entry instanceof Directory) {
            return entry;
        }
        throw vscode_1.FileSystemError.FileNotADirectory(uri);
    }
    _lookupAsFile(uri, silent) {
        const entry = this._lookup(uri, silent);
        if (entry instanceof File) {
            return entry;
        }
        throw vscode_1.FileSystemError.FileIsADirectory(uri);
    }
    _lookupParentDirectory(uri) {
        const dirname = uri.with({ path: path.posix.dirname(uri.path) });
        return this._lookupAsDirectory(dirname, false);
    }
    _fireSoon(...events) {
        this._bufferedEvents.push(...events);
        if (this._fireSoonHandler) {
            clearTimeout(this._fireSoonHandler);
        }
        this._fireSoonHandler = setTimeout(() => {
            this._emitter.fire(this._bufferedEvents);
            this._bufferedEvents.length = 0;
        }, 1);
    }
}
exports.tempSvnFs = new TempSvnFs();
//# sourceMappingURL=temp_svn_fs.js.map