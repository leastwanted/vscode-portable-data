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
exports.MdTableEditorConfig = void 0;
const vscode_1 = require("vscode");
class MdTableEditorConfig {
    constructor(context) {
        this.context = context;
        this.configChangedEmitter = new vscode_1.EventEmitter();
        this.configChanged = this.configChangedEmitter.event;
        this._config = this.getConfig();
        context.subscriptions.push(vscode_1.workspace.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(MdTableEditorConfig.SECTION)) {
                this.updateConfig();
            }
        }));
    }
    get config() {
        return this._config;
    }
    get isHighlighterEnabled() {
        return this.getBool(MdTableEditorConfig.IS_HIGHLIGHTER_ENABLED, true);
    }
    get isDebugMode() {
        return this.getBool(MdTableEditorConfig.IS_DEBUG_MODE, false);
    }
    get isIconMenuEnabled() {
        return this.getBool(MdTableEditorConfig.IS_ICOM_MENU_ENABLED, true);
    }
    get isAutoFormatterEnabled() {
        return this.getBool(MdTableEditorConfig.IS_AUTO_FORMATTER_ENABLED, false);
    }
    get isTreeViewEnabled() {
        return this.getBool(MdTableEditorConfig.IS_TREE_VIEW_ENABLED, false);
    }
    get contextCommandViews() {
        var _a;
        return (_a = this.getCommandViews()) === null || _a === void 0 ? void 0 : _a['context'];
    }
    get toolbarCommandViews() {
        var _a;
        return (_a = this.getCommandViews()) === null || _a === void 0 ? void 0 : _a['toolbar'];
    }
    getCommandViews() {
        const obj = this.config.get(MdTableEditorConfig.COMMAND_VIEWS, {});
        const upd = {
            toolbar: (obj === null || obj === void 0 ? void 0 : obj.toolbar) || [],
            context: (obj === null || obj === void 0 ? void 0 : obj.context) || []
        };
        return upd;
    }
    setCommandViews(value) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.config.update(MdTableEditorConfig.COMMAND_VIEWS, value, true);
        });
    }
    getBool(name, def) {
        const r = this.config.get(name);
        return r !== undefined ? r : def;
    }
    updateConfig() {
        this._config = this.getConfig();
        this.configChangedEmitter.fire(this);
    }
    getConfig() {
        return vscode_1.workspace.getConfiguration(MdTableEditorConfig.SECTION);
    }
}
exports.MdTableEditorConfig = MdTableEditorConfig;
MdTableEditorConfig.SECTION = 'mdtableeditor';
MdTableEditorConfig.IS_DEBUG_MODE = 'isDebugMode';
MdTableEditorConfig.IS_ICOM_MENU_ENABLED = 'isIconMenuEnabled';
MdTableEditorConfig.IS_AUTO_FORMATTER_ENABLED = 'isAutoFormatterEnabled';
MdTableEditorConfig.IS_TREE_VIEW_ENABLED = 'isTreeViewEnabled';
MdTableEditorConfig.IS_HIGHLIGHTER_ENABLED = 'isHighlighterEnabled';
MdTableEditorConfig.COMMAND_VIEWS = 'commandViews';
//# sourceMappingURL=MdTableEditorConfig.js.map