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
exports.saveBackupData = exports.getBackupData = void 0;
const v8_1 = require("v8");
const vscode_1 = require("vscode");
function getBackupData(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const serializedData = yield vscode_1.workspace.fs.readFile(uri);
        const deserializer = new v8_1.Deserializer(serializedData);
        const deserialized = deserializer.readValue();
        const state = ensureLunaStateType(deserialized === null || deserialized === void 0 ? void 0 : deserialized.state);
        const workbenchState = deserialized === null || deserialized === void 0 ? void 0 : deserialized.workbenchState;
        return { state, workbenchState };
    });
}
exports.getBackupData = getBackupData;
function saveBackupData(destination, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const serializer = new v8_1.Serializer();
        serializer.writeValue(data);
        yield vscode_1.workspace.fs.writeFile(destination, serializer.releaseBuffer());
    });
}
exports.saveBackupData = saveBackupData;
function ensureLunaStateType(deserialized) {
    if (typeof deserialized !== 'object' || deserialized === null) {
        return undefined;
    }
    const state = deserialized;
    if (!('version' in state) || state.version !== 5) {
        return undefined;
    }
    if (!('body' in state || typeof state.body !== 'object')) {
        return undefined;
    }
    return {
        version: state.version,
        body: state.body
    };
}
//# sourceMappingURL=backup.js.map