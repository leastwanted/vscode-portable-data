"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCommandFactory = void 0;
const ChangeAlignmentCommand_1 = require("../commands/ChangeAlignmentCommand");
const RemoveColumnCommand_1 = require("../commands/RemoveColumnCommand");
const InsertColumnCommand_1 = require("../commands/InsertColumnCommand");
const InsertRowCommand_1 = require("../commands/InsertRowCommand");
const MoveRowCommand_1 = require("../commands/MoveRowCommand");
const MoveColumnCommand_1 = require("../commands/MoveColumnCommand");
const FillCellsCommand_1 = require("../commands/FillCellsCommand");
const FormatCommand_1 = require("../commands/FormatCommand");
const RemoveRowCommand_1 = require("../commands/RemoveRowCommand");
const FocusCommand_1 = require("../commands/FocusCommand");
const DeleteCommetCommand_1 = require("../commands/DeleteCommetCommand");
const SortCommand_1 = require("../commands/SortCommand");
const TextSortCommand_1 = require("../commands/TextSortCommand");
const ScrollCommand_1 = require("../commands/ScrollCommand");
const MarkdownAlignments_1 = require("../interfaces/MarkdownAlignments");
const MarkdownTableConverter_1 = require("../impls/MarkdownTableConverter");
const Direction_1 = require("../interfaces/Direction");
const ColumnSelectCommand_1 = require("../commands/ColumnSelectCommand");
class DefaultCommandFactory {
    constructor(appContext, cache) {
        this.appContext = appContext;
        this.cache = cache;
    }
    commandContext(formatterContext) {
        return new CommandContext(this.appContext, formatterContext, this.cache);
    }
    //#region セルベースのコマンド
    createMoveLeft(formatterContext) {
        return new MoveColumnCommand_1.MoveColumnCommand(this.commandContext(formatterContext), true);
    }
    createMoveRight(formatterContext) {
        return new MoveColumnCommand_1.MoveColumnCommand(this.commandContext(formatterContext), false);
    }
    createMoveTop(formatterContext) {
        return new MoveRowCommand_1.MoveRowCommand(this.commandContext(formatterContext), true);
    }
    createMoveBottom(formatterContext) {
        return new MoveRowCommand_1.MoveRowCommand(this.commandContext(formatterContext), false);
    }
    createInsertLeft(formatterContext) {
        return new InsertColumnCommand_1.InsertColumnCommand(this.commandContext(formatterContext), true);
    }
    createInsertRight(formatterContext) {
        return new InsertColumnCommand_1.InsertColumnCommand(this.commandContext(formatterContext), false);
    }
    createInsertTop(formatterContext) {
        return new InsertRowCommand_1.InsertRowCommand(this.commandContext(formatterContext), true);
    }
    createInsertBottom(formatterContext) {
        return new InsertRowCommand_1.InsertRowCommand(this.commandContext(formatterContext), false);
    }
    createChangeAlignLeft(formatterContext) {
        return new ChangeAlignmentCommand_1.ChangeAlignmentCommand(this.commandContext(formatterContext), MarkdownAlignments_1.MarkdownAlignments.Left);
    }
    createChangeAlignCenter(formatterContext) {
        return new ChangeAlignmentCommand_1.ChangeAlignmentCommand(this.commandContext(formatterContext), MarkdownAlignments_1.MarkdownAlignments.Center);
    }
    createChangeAlignRight(formatterContext) {
        return new ChangeAlignmentCommand_1.ChangeAlignmentCommand(this.commandContext(formatterContext), MarkdownAlignments_1.MarkdownAlignments.Right);
    }
    createNaturalFormat(formatterContext) {
        return new FormatCommand_1.FormatCommand(this.commandContext(formatterContext), MarkdownTableConverter_1.MarkdownTableRenderMode.Natural);
    }
    createBeautifulFormat(formatterContext) {
        return new FormatCommand_1.FormatCommand(this.commandContext(formatterContext), MarkdownTableConverter_1.MarkdownTableRenderMode.Beautiful);
    }
    createFocusLeft(formatterContext) {
        return new FocusCommand_1.FocusCommand(this.commandContext(formatterContext), Direction_1.Direction.Left);
    }
    createFocusRight(formatterContext) {
        return new FocusCommand_1.FocusCommand(this.commandContext(formatterContext), Direction_1.Direction.Right);
    }
    createFocusTop(formatterContext) {
        return new FocusCommand_1.FocusCommand(this.commandContext(formatterContext), Direction_1.Direction.Top);
    }
    createFocusBottom(formatterContext) {
        return new FocusCommand_1.FocusCommand(this.commandContext(formatterContext), Direction_1.Direction.Bottom);
    }
    createColumnSelect(formatterContext) {
        return new ColumnSelectCommand_1.ColumnSelectCommand(this.commandContext(formatterContext), ColumnSelectCommand_1.SelectType.Full);
    }
    createColumnSelectAll(formatterContext) {
        return new ColumnSelectCommand_1.ColumnSelectCommand(this.commandContext(formatterContext), ColumnSelectCommand_1.SelectType.Empty | ColumnSelectCommand_1.SelectType.Full);
    }
    createColumnSelectEmpty(formatterContext) {
        return new ColumnSelectCommand_1.ColumnSelectCommand(this.commandContext(formatterContext), ColumnSelectCommand_1.SelectType.Empty);
    }
    createDeleteComment(formatterContext) {
        return new DeleteCommetCommand_1.DeleteCommentCommand(this.commandContext(formatterContext));
    }
    createFillCells(formatterContext) {
        return new FillCellsCommand_1.FillCellsCommand(this.commandContext(formatterContext));
    }
    createRemoveRow(formatterContext) {
        return new RemoveRowCommand_1.RemoveRowCommand(this.commandContext(formatterContext));
    }
    createRemoveColumn(formatterContext) {
        return new RemoveColumnCommand_1.RemoveColumnCommand(this.commandContext(formatterContext));
    }
    createSortAsc(formatterContext) {
        return new SortCommand_1.SortCommand(this.commandContext(formatterContext), true);
    }
    createSortDesc(formatterContext) {
        return new SortCommand_1.SortCommand(this.commandContext(formatterContext), false);
    }
    createTextSortAsc(formatterContext) {
        return new TextSortCommand_1.TextSortCommand(this.commandContext(formatterContext), true, false);
    }
    createTextSortDesc(formatterContext) {
        return new TextSortCommand_1.TextSortCommand(this.commandContext(formatterContext), false, false);
    }
    createTextSortAscIgnore(formatterContext) {
        return new TextSortCommand_1.TextSortCommand(this.commandContext(formatterContext), true, true);
    }
    createTextSortDescIgnore(formatterContext) {
        return new TextSortCommand_1.TextSortCommand(this.commandContext(formatterContext), false, true);
    }
    //#endregion
    //#region 全体的なコマンド
    createIndexScrollCommand(formatterContext) {
        return new ScrollCommand_1.ScrollCommand(this.commandContext(formatterContext), true);
    }
}
exports.DefaultCommandFactory = DefaultCommandFactory;
class CommandContext {
    constructor(appContext, formatterContext, cache) {
        this.appContext = appContext;
        this.formatterContext = formatterContext;
        this.cache = cache;
    }
    getTable() {
        return this.cache.cachedItem;
    }
    getFormatterContext() {
        return this.formatterContext;
    }
}
//# sourceMappingURL=DefaultCommandFactory.js.map