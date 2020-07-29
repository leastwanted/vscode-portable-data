"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rmdir = void 0;
const original_fs_1 = require("original-fs");
const util_1 = require("util");
exports.rmdir = util_1.promisify(original_fs_1.rmdir);
//# sourceMappingURL=rmdir.js.map