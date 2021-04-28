"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class EventReciever {
    constructor() {
        this.recievers = [];
    }
    textChanged(e) {
        this.recievers.forEach(_ => _.textChanged(e));
    }
    selectChanged(e) {
        this.recievers.forEach(_ => _.selectChanged(e));
    }
    otherChanged(e) {
        this.recievers.forEach(_ => _.otherChanged(e));
    }
}
//# sourceMappingURL=EventReciever.js.map