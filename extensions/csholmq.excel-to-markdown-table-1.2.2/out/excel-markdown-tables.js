"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helper = require("./excel-markdown-helpers");
const LINE_ENDING = "\n";
/**
 * Converts a string payload into a Markdown formatted table
 * @param rawData A table-like string
 */
function excelToMarkdown(rawData) {
    let data = rawData.trim();
    var intraCellNewlineReplacedData = helper.replaceIntraCellNewline(data);
    var rows = helper.splitIntoRowsAndColumns(intraCellNewlineReplacedData);
    var { columnWidths, colAlignments } = helper.getColumnWidthsAndAlignments(rows);
    const markdownRows = helper.addMarkdownSyntax(rows, columnWidths);
    return helper.addAlignmentSyntax(markdownRows, columnWidths, colAlignments).join(LINE_ENDING);
}
exports.excelToMarkdown = excelToMarkdown;
//# sourceMappingURL=excel-markdown-tables.js.map