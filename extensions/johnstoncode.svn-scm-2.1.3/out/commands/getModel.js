"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("./command");
class GetModel extends command_1.Command {
    constructor(model) {
        super("svn.getModel");
        this.model = model;
    }
    async execute() {
        return this.model;
    }
}
exports.GetModel = GetModel;
//# sourceMappingURL=getModel.js.map