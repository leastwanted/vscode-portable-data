"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenResourceHead = void 0;
const command_1 = require("./command");
class OpenResourceHead extends command_1.Command {
    constructor() {
        super("svn.openResourceHead");
    }
    async execute(resource) {
        await this._openResource(resource, "HEAD", undefined, true, false);
    }
}
exports.OpenResourceHead = OpenResourceHead;
//# sourceMappingURL=openResourceHead.js.map