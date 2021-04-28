"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableCommandBase = void 0;
const CommandBaseGeneric_1 = require("./CommandBaseGeneric");
const AppHelper_1 = require("../app/AppHelper");
class TableCommandBase extends CommandBaseGeneric_1.CommandBaseGeneric {
    constructor(commandContext) {
        super();
        this.commandContext = commandContext;
        this.appContext = commandContext.appContext;
        this.appHelper = new AppHelper_1.AppHelper(this.appContext);
    }
    /**
     * デフォルトではパラメータの型の安全性は一切保証しません。
     * @param parameter
     */
    convert(parameter) {
        return parameter;
    }
}
exports.TableCommandBase = TableCommandBase;
//# sourceMappingURL=TableCommandBase.js.map