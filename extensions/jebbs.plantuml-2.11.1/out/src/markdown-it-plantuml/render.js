"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diagram_1 = require("../plantuml/diagram/diagram");
const type_1 = require("../plantuml/diagram/type");
const urlMaker_1 = require("../plantuml/urlMaker/urlMaker");
function renderHtml(tokens, idx) {
    // console.log("request html for:", idx, tokens[idx].content);
    let token = tokens[idx];
    if (token.type !== "plantuml")
        return tokens[idx].content;
    let diagram = new diagram_1.Diagram(token.content);
    // Ditaa only supports png
    let format = diagram.type == type_1.DiagramType.Ditaa ? "png" : "svg";
    let result = urlMaker_1.MakeDiagramURL(diagram, format, null);
    return result.urls.reduce((p, url) => {
        p += `\n<img id="image" src="${url}" title=${diagram.title}>`;
        return p;
    }, "");
}
exports.renderHtml = renderHtml;
//# sourceMappingURL=render.js.map