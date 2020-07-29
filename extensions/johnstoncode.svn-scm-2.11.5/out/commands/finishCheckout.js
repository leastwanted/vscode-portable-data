"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinishCheckout = void 0;
const command_1 = require("./command");
class FinishCheckout extends command_1.Command {
    constructor() {
        super("svn.finishCheckout", { repository: true });
    }
    async execute(repository) {
        await repository.finishCheckout();
    }
}
exports.FinishCheckout = FinishCheckout;
//# sourceMappingURL=finishCheckout.js.map