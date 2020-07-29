"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.xml2jsParseSettings = void 0;
const util_1 = require("../util");
exports.xml2jsParseSettings = {
    mergeAttrs: true,
    explicitRoot: false,
    explicitArray: false,
    attrNameProcessors: [util_1.camelcase],
    tagNameProcessors: [util_1.camelcase]
};
//# sourceMappingURL=constants.js.map