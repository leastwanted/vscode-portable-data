"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VscFormatterContext = void 0;
const FormatterContext_1 = require("../../MdTableEditor/src/app/FormatterContext");
const b = new class extends FormatterContext_1.FormatterContext {
    get methods() {
        return {
            replace: (range, txt) => { },
            select: (...selections) => { }
        };
    }
};
class VscFormatterContext extends FormatterContext_1.FormatterContext {
    constructor() {
        super();
        this._methods = {};
    }
    get methods() {
        return this._methods;
    }
    set setMethods(m) {
        this._methods = m;
    }
}
exports.VscFormatterContext = VscFormatterContext;
//# sourceMappingURL=VscFormatterContext.js.map