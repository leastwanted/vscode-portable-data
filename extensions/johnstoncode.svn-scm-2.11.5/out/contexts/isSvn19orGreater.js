"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSvn19orGreater = void 0;
const semver = require("semver");
const util_1 = require("../util");
class IsSvn19orGreater {
    constructor(svnVersion) {
        const is19orGreater = semver.satisfies(svnVersion, ">= 1.9");
        util_1.setVscodeContext("isSvn19orGreater", is19orGreater);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispose() { }
}
exports.IsSvn19orGreater = IsSvn19orGreater;
//# sourceMappingURL=isSvn19orGreater.js.map