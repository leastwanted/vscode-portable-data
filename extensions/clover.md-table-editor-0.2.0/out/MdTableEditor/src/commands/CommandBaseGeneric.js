"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandBaseGeneric = exports.CommandBase = void 0;
class CommandBase {
    constructor() {
        this.canExecuteChanged = [];
    }
    raiseCanExecuteChanged() {
        this.canExecuteChanged.forEach(_ => _());
    }
}
exports.CommandBase = CommandBase;
class CommandBaseGeneric extends CommandBase {
    execute(parameter) {
        const p = this.convert(parameter);
        this.executeGeneric(p);
    }
    canExecute(parameter) {
        const p = this.convert(parameter);
        return this.canExecuteGeneric(p);
    }
}
exports.CommandBaseGeneric = CommandBaseGeneric;
//# sourceMappingURL=CommandBaseGeneric.js.map