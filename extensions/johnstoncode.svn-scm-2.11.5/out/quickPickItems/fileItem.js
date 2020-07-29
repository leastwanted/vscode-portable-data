"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileItem = void 0;
class FileItem {
    constructor(_repository, _state, picked = false) {
        this._repository = _repository;
        this._state = _state;
        this.picked = picked;
    }
    get label() {
        return this._repository.repository.removeAbsolutePath(this._state.resourceUri.fsPath);
    }
    get description() {
        return this._state.resourceUri.fsPath;
    }
    get state() {
        return this._state;
    }
}
exports.FileItem = FileItem;
//# sourceMappingURL=fileItem.js.map