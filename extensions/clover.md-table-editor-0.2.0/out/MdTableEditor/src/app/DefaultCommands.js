"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommands = void 0;
class DefaultCommands {
    constructor(factory) {
        this.factory = factory;
        this.moveLeft = factory.createMoveLeft();
        this.moveRight = factory.createMoveRight();
        this.moveTop = factory.createMoveTop();
        this.moveBottom = factory.createMoveBottom();
    }
}
exports.DefaultCommands = DefaultCommands;
//# sourceMappingURL=DefaultCommands.js.map