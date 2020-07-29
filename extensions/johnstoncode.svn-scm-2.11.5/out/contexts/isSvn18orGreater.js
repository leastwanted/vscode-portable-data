"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsSvn18orGreater = void 0;
const semver = require("semver");
const util_1 = require("../util");
class IsSvn18orGreater {
    constructor(svnVersion) {
        const is18orGreater = semver.satisfies(svnVersion, ">= 1.8");
        util_1.setVscodeContext("isSvn18orGreater", is18orGreater);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    dispose() { }
}
exports.IsSvn18orGreater = IsSvn18orGreater;
//# sourceMappingURL=isSvn18orGreater.js.map