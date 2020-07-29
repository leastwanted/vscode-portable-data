"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mkdir = void 0;
const original_fs_1 = require("original-fs");
const util_1 = require("util");
exports.mkdir = util_1.promisify(original_fs_1.mkdir);
//# sourceMappingURL=mkdir.js.map