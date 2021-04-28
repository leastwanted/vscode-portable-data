"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MdTableEditor = void 0;
const vscode_1 = require("vscode");
const VscAppContext_1 = require("./VscAppContext");
const MdTableTreeView_1 = require("./MdTableTreeView");
const MdTableEditorConfig_1 = require("./MdTableEditorConfig");
const AppMain_1 = require("../../MdTableEditor/src/app/AppMain");
const vsc_helper_1 = require("./vsc-helper");
const DefaultCommandFactory_1 = require("../../MdTableEditor/src/app/DefaultCommandFactory");
const FormatterContext_1 = require("../../MdTableEditor/src/app/FormatterContext");
const CommandView_1 = require("./CommandView");
class MdTableEditor extends AppMain_1.AppMain {
    constructor(context) {
        super(new VscAppContext_1.VscAppContext());
        this.context = context;
        // 設定ファイルの変更を監視
        this.config = new MdTableEditorConfig_1.MdTableEditorConfig(context);
        // 設定ファイルの変更があったらsetContextに反映
        context.subscriptions.push(new VscConfigContextUpdater(this.config), new CommandView_1.CommandView(this.config));
        // テーブルエクスプローラの初期化
        this.explorer = new MdTableTreeView_1.MdTableExplorer(context);
    }
    initialize() {
        const _super = Object.create(null, {
            initialize: { get: () => super.initialize }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.initialize.call(this);
            this.config.configChanged(e => this.onConfigChanged());
            // 設定ファイル最初の読み込みイベント
            this.onConfigChanged();
        });
    }
    initEvents(eventReciever) {
        new VscEventRegister(this.context).register(eventReciever);
    }
    registerCommands(appContext) {
        const cFactory = new DefaultCommandFactory_1.DefaultCommandFactory(this.appContext, this.cache);
        return new VscCommandRegister(this.context).register(cFactory);
    }
    onTablesUpdated(tables) {
        this.explorer.refresh(tables);
    }
    onConfigChanged() {
        // auto formatter
        this.useAutoFormatter = this.config.isDebugMode && this.config.isAutoFormatterEnabled;
        // highlighter
        this.useDecorator = this.config.isHighlighterEnabled;
    }
    formatted() {
        var _a;
        const gc = this.commandExecutionManager;
        const cmd = (_a = gc === null || gc === void 0 ? void 0 : gc.commandMap) === null || _a === void 0 ? void 0 : _a.get('MdTableEditor.beautifulFormat');
        if (cmd) {
            gc === null || gc === void 0 ? void 0 : gc.execute(cmd);
        }
    }
    onCurrentTableChanged(nv, ov) {
        vscode_1.commands.executeCommand('setContext', 'MdTableEditor.isIconMenuEnabled', !!nv);
        super.onCurrentTableChanged(nv, ov);
    }
    dispose() {
        vscode_1.Disposable.from(...this.context.subscriptions).dispose();
    }
}
exports.MdTableEditor = MdTableEditor;
class VscConfigContextUpdater {
    constructor(config) {
        this.config = config;
        this.update();
        this.config.configChanged(e => {
            this.update();
        });
    }
    dispose() {
    }
    update() {
        const config = this.config;
        this.setContext(MdTableEditorConfig_1.MdTableEditorConfig.IS_DEBUG_MODE, config.isDebugMode);
        this.setContext(MdTableEditorConfig_1.MdTableEditorConfig.IS_ICOM_MENU_ENABLED, config.isIconMenuEnabled);
        this.setContext(MdTableEditorConfig_1.MdTableEditorConfig.IS_AUTO_FORMATTER_ENABLED, config.isAutoFormatterEnabled);
        this.setContext(MdTableEditorConfig_1.MdTableEditorConfig.IS_TREE_VIEW_ENABLED, config.isTreeViewEnabled);
        this.setContext(MdTableEditorConfig_1.MdTableEditorConfig.IS_HIGHLIGHTER_ENABLED, config.isHighlighterEnabled);
    }
    setContext(name, isEnabled) {
        vscode_1.commands.executeCommand('setContext', `MdTableEditor.${name}`, isEnabled);
    }
}
class VscCommandRegister {
    constructor(context) {
        this.context = context;
        this.internalFormatterContext = new class extends FormatterContext_1.FormatterContext {
            setMethods(methods) {
                this._methods = methods;
                return this;
            }
            get methods() {
                return this._methods || {
                    replace: (range, txt) => { },
                    select: (...selections) => { }
                };
            }
        };
    }
    register(factory) {
        const commandsFactories = new Map();
        // 状態管理コマンド
        commandsFactories.set('MdTableEditor.beautifulFormat', c => factory.createBeautifulFormat(c));
        commandsFactories.set('MdTableEditor.naturalFormat', c => factory.createNaturalFormat(c));
        commandsFactories.set('MdTableEditor.deleteComment', c => factory.createDeleteComment(c));
        commandsFactories.set('MdTableEditor.fillCells', c => factory.createFillCells(c));
        commandsFactories.set('MdTableEditor.changeAlignRight', c => factory.createChangeAlignRight(c));
        commandsFactories.set('MdTableEditor.changeAlignCenter', c => factory.createChangeAlignCenter(c));
        commandsFactories.set('MdTableEditor.changeAlignLeft', c => factory.createChangeAlignLeft(c));
        commandsFactories.set('MdTableEditor.insertTop', c => factory.createInsertTop(c));
        commandsFactories.set('MdTableEditor.insertBottom', c => factory.createInsertBottom(c));
        commandsFactories.set('MdTableEditor.insertLeft', c => factory.createInsertLeft(c));
        commandsFactories.set('MdTableEditor.insertRight', c => factory.createInsertRight(c));
        commandsFactories.set('MdTableEditor.removeColumn', c => factory.createRemoveColumn(c));
        commandsFactories.set('MdTableEditor.removeRow', c => factory.createRemoveRow(c));
        commandsFactories.set('MdTableEditor.moveTop', c => factory.createMoveTop(c));
        commandsFactories.set('MdTableEditor.moveBottom', c => factory.createMoveBottom(c));
        commandsFactories.set('MdTableEditor.moveLeft', c => factory.createMoveLeft(c));
        commandsFactories.set('MdTableEditor.moveRight', c => factory.createMoveRight(c));
        commandsFactories.set('MdTableEditor.focusLeft', c => factory.createFocusLeft(c));
        commandsFactories.set('MdTableEditor.focusTop', c => factory.createFocusTop(c));
        commandsFactories.set('MdTableEditor.focusBottom', c => factory.createFocusBottom(c));
        commandsFactories.set('MdTableEditor.focusRight', c => factory.createFocusRight(c));
        commandsFactories.set('MdTableEditor.columnSelect', c => factory.createColumnSelect(c));
        commandsFactories.set('MdTableEditor.columnSelectAll', c => factory.createColumnSelectAll(c));
        commandsFactories.set('MdTableEditor.columnSelectEmpty', c => factory.createColumnSelectEmpty(c));
        commandsFactories.set('MdTableEditor.sortNumberAsc', c => factory.createSortAsc(c));
        commandsFactories.set('MdTableEditor.sortNumberDesc', c => factory.createSortDesc(c));
        commandsFactories.set('MdTableEditor.sortTextAsc', c => factory.createTextSortAsc(c));
        commandsFactories.set('MdTableEditor.sortTextDesc', c => factory.createTextSortDesc(c));
        commandsFactories.set('MdTableEditor.sortTextAsc.ignore', c => factory.createTextSortAscIgnore(c));
        commandsFactories.set('MdTableEditor.sortTextDesc.ignore', c => factory.createTextSortDescIgnore(c));
        const commands = new Map([...commandsFactories.entries()].map(([commandName, commandFactory]) => {
            // 実験目的のため実際では使用しない。
            //const wrapper = this.createWrapperCommand(commandFactory);
            const wrapper = this.createCommand(commandFactory);
            return [commandName, wrapper];
        }));
        // 通常コマンド
        commands.set('MdTableEditor.scroll', this.createCommand(c => factory.createIndexScrollCommand(c)));
        return new GlobalCommands(commands);
    }
    fmCreater(selectCallback, replaceCallback) {
        return {
            select: (...selections) => {
                const s = selections.map(_ => {
                    return new vscode_1.Selection(new vscode_1.Position(_.sPos.docIndex, _.sPos.charIndex), _.ePos ? new vscode_1.Position(_.ePos.docIndex, _.ePos.charIndex) : new vscode_1.Position(_.sPos.docIndex, _.sPos.charIndex));
                });
                selectCallback(...s);
            },
            replace: (range, txt) => {
                var _a;
                const document = (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.document;
                if (!document) {
                    return;
                }
                const start = range.begin;
                const end = range.end;
                const s = document.lineAt(start).range.start;
                const e = document.lineAt(end - 1).range.end;
                replaceCallback(new vscode_1.Range(s, e), txt);
            }
        };
    }
    createCommand(commandFactory) {
        return commandFactory(this.internalFormatterContext.setMethods(this.fmCreater((...selections) => {
            if (vscode_1.window.activeTextEditor) {
                vscode_1.window.activeTextEditor.selections = selections;
            }
        }, (range, txt) => { var _a; return (_a = vscode_1.window.activeTextEditor) === null || _a === void 0 ? void 0 : _a.edit(ed => ed.replace(range, txt)); })));
    }
    // TODO: フォーカスのタイミング実験。
    createWrapperCommand(commandFactory) {
        const internalFormatterContext = this.internalFormatterContext;
        let cnt = 0;
        if (true) {
            console.log("");
        }
        return {
            canExecute: p => commandFactory(internalFormatterContext).canExecute(p),
            canExecuteChanged: commandFactory(internalFormatterContext).canExecuteChanged,
            execute: p => {
                const editor = vscode_1.window.activeTextEditor;
                if (editor) {
                    const document = editor.document;
                    if (document && !document.isDirty) {
                        editor.edit(edit => {
                            if (cnt !== 0) {
                                return;
                                throw new Error();
                            }
                            cnt++;
                            const fm = {
                                select: (...selections) => {
                                    const s = selections.map(_ => {
                                        return new vscode_1.Selection(new vscode_1.Position(_.sPos.docIndex, _.sPos.charIndex), _.ePos ? new vscode_1.Position(_.ePos.docIndex, _.ePos.charIndex) : new vscode_1.Position(_.sPos.docIndex, _.sPos.charIndex));
                                    });
                                    editor.selections = s;
                                    //VscHelper.setCursorPosition(...s);
                                },
                                replace: (range, txt) => {
                                    const start = range.begin;
                                    const end = range.end;
                                    const s = document.lineAt(start).range.start;
                                    const e = document.lineAt(end - 1).range.end;
                                    edit.replace(new vscode_1.Range(s, e), txt);
                                }
                            };
                            if (cnt !== 1) {
                                throw new Error();
                            }
                            try {
                                commandFactory(internalFormatterContext.setMethods(fm)).execute(p);
                            }
                            catch (err) {
                                console.log(err);
                            }
                            if (cnt !== 1) {
                                throw new Error();
                            }
                            cnt--;
                        });
                    }
                }
            }
        };
    }
}
class VscEventRegister {
    constructor(context) {
        this.context = context;
    }
    register(eventReciever) {
        const isMarkdown = (document) => {
            return (document === null || document === void 0 ? void 0 : document.languageId) === 'markdown';
        };
        this._activeEditor = vscode_1.window.activeTextEditor;
        if (this._activeEditor) {
            if (isMarkdown(this._activeEditor.document)) {
                eventReciever.otherChanged();
            }
        }
        vscode_1.window.onDidChangeActiveTextEditor(e => {
            if (isMarkdown(e === null || e === void 0 ? void 0 : e.document)) {
                this._activeEditor = e;
                eventReciever.otherChanged();
            }
        }, null, this.context.subscriptions);
        vscode_1.workspace.onDidChangeTextDocument(e => {
            if (isMarkdown(e.document)) {
                if (this._activeEditor && e.document === this._activeEditor.document) {
                    const pos = vsc_helper_1.VscHelper.getCursorPosition();
                    if (pos) {
                        //VscHelper.putInfo(e.document, 'TEXT  ');
                        eventReciever.textChanged({ changeStartPosition: { docIndex: pos.line, charIndex: pos.character } });
                    }
                }
            }
        }, null, this.context.subscriptions);
        vscode_1.window.onDidChangeTextEditorSelection(e => {
            if (isMarkdown(e.textEditor.document)) {
                if (this._activeEditor === e.textEditor && e.selections.length) {
                    const pos = vsc_helper_1.VscHelper.getCursorPosition();
                    if (pos) {
                        //VscHelper.putInfo(e.textEditor.document, 'SELECT');
                        eventReciever.selectChanged({ selectStargePosition: { docIndex: pos.line, charIndex: pos.character } });
                    }
                }
            }
        }, null, this.context.subscriptions);
    }
}
class GlobalCommands {
    constructor(commandMap) {
        this.commandMap = commandMap;
        this.disc = [];
        this.initRegister();
    }
    initRegister() {
        for (const [name, command] of this.commandMap) {
            this.disc.push(vscode_1.commands.registerCommand(name, p => this.execute(command, p)));
            vscode_1.commands.executeCommand('setContext', name, true);
        }
    }
    updateContents() {
        for (const [name, command] of this.commandMap.entries()) {
            const flag = command.canExecute(undefined);
            vscode_1.commands.executeCommand("setContext", name, flag);
        }
    }
    execute(command, parameter) {
        if (command.canExecute(parameter)) {
            command.execute(parameter);
        }
    }
    dispose() {
        vscode_1.Disposable.from(...this.disc).dispose();
    }
}
//# sourceMappingURL=MdTableEditor.js.map