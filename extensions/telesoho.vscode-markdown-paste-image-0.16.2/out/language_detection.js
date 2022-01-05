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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LanguageDetection = void 0;
const vscode_languagedetection_1 = require("@vscode/vscode-languagedetection");
class LanguageDetection {
    constructor() {
        this._loadFailed = false;
    }
    getModelOperations() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._modelOperations) {
                return this._modelOperations;
            }
            this._modelOperations = new vscode_languagedetection_1.ModelOperations();
            return this._modelOperations;
        });
    }
    detectLanguage(content) {
        var e_1, _a;
        return __awaiter(this, void 0, void 0, function* () {
            if (content) {
                try {
                    for (var _b = __asyncValues(this.detectLanguagesImpl(content)), _c; _c = yield _b.next(), !_c.done;) {
                        const language = _c.value;
                        return language;
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
            return "";
        });
    }
    detectLanguages(content) {
        var e_2, _a;
        return __awaiter(this, void 0, void 0, function* () {
            const languages = [];
            if (content) {
                try {
                    for (var _b = __asyncValues(this.detectLanguagesImpl(content)), _c; _c = yield _b.next(), !_c.done;) {
                        const language = _c.value;
                        languages.push(language);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) yield _a.call(_b);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            return languages;
        });
    }
    detectLanguagesImpl(content) {
        return __asyncGenerator(this, arguments, function* detectLanguagesImpl_1() {
            if (this._loadFailed) {
                return yield __await(void 0);
            }
            let modelOperations;
            try {
                modelOperations = yield __await(this.getModelOperations());
            }
            catch (e) {
                this._loadFailed = true;
                return yield __await(void 0);
            }
            const modelResults = yield __await(modelOperations.runModel(content));
            if (!modelResults) {
                return yield __await(void 0);
            }
            if (modelResults[0].confidence < LanguageDetection.expectedRelativeConfidence) {
                return yield __await(void 0);
            }
            const possibleLanguages = [modelResults[0]];
            for (let current of modelResults) {
                if (current === modelResults[0]) {
                    continue;
                }
                const currentHighest = possibleLanguages[possibleLanguages.length - 1];
                if (currentHighest.confidence - current.confidence >=
                    LanguageDetection.expectedRelativeConfidence) {
                    while (possibleLanguages.length) {
                        // TODO: see if there's a better way to do this.
                        const vscodeLanguageId = possibleLanguages.shift().languageId;
                        if (vscodeLanguageId) {
                            yield yield __await(vscodeLanguageId);
                        }
                    }
                    if (current.confidence > LanguageDetection.expectedRelativeConfidence) {
                        possibleLanguages.push(current);
                        continue;
                    }
                    return yield __await(void 0);
                }
                else {
                    if (current.confidence > LanguageDetection.expectedRelativeConfidence) {
                        possibleLanguages.push(current);
                        continue;
                    }
                    return yield __await(void 0);
                }
            }
        });
    }
}
exports.LanguageDetection = LanguageDetection;
LanguageDetection.expectedRelativeConfidence = 0.001;
//# sourceMappingURL=language_detection.js.map