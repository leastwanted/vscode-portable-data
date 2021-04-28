"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VscAppContext = void 0;
const vscode_1 = require("vscode");
const vsc_helper_1 = require("./vsc-helper");
const VSCodeTextSource_1 = require("./VSCodeTextSource");
class AppConfig {
    // TODO: まだ仕様を決めてない。
    returnKey() {
        const editor = vscode_1.window.activeTextEditor;
        if (editor) {
            return editor.document.eol === 1 ? "\n" : "\r\n";
        }
        return "\n";
    }
}
class VscAppContext {
    constructor() {
        this.decorator = new DecorationApi();
    }
    getCursor() {
        const pos = vsc_helper_1.VscHelper.getCursorPosition();
        if (pos) {
            return {
                docIndex: pos.line,
                charIndex: pos.character
            };
        }
    }
    replace(range, text, cursorPos) {
        vsc_helper_1.VscHelper.replace(range.begin, range.end, text, new vscode_1.Position(cursorPos.docIndex, cursorPos.charIndex));
    }
    getStringCounter() {
        return this.stringCounter;
    }
    // http://blog.tofu-kun.org/070627210315.php
    stringCounter(str) {
        let len = 0;
        let strSrc = escape(str);
        for (let i = 0; i < strSrc.length; i++, len++) {
            if (strSrc.charAt(i) === "%") {
                if (strSrc.charAt(++i) === "u") {
                    i += 3;
                    len++;
                }
                i++;
            }
        }
        return len;
    }
    getTextSource() {
        const ed = vscode_1.window.activeTextEditor;
        if (ed) {
            return new VSCodeTextSource_1.VSCodeTextSource(ed.document);
        }
    }
    getAppConfig() {
        return new AppConfig();
    }
    decorate(table, docPos) {
        this.decorator.decorate(table, docPos);
    }
    clearDecorate() {
        this.decorator.clearDecorate();
    }
    scroll(docIndex) {
        vsc_helper_1.VscHelper.scroll(docIndex);
    }
}
exports.VscAppContext = VscAppContext;
class DecorationApi {
    constructor() {
        this.decorator = new vsc_helper_1.FocusDecorator();
    }
    decorate(table, docPos) {
        this.clearDecorate();
        this.currentEditor = vscode_1.window.activeTextEditor;
        if (this.currentEditor) {
            this.decorator.decorate(this.currentEditor, {
                table: table,
                docIndex: docPos.docIndex,
                charIndex: docPos.charIndex
            });
        }
    }
    clearDecorate() {
        if (this.currentEditor) {
            this.decorator.hide(this.currentEditor);
            this.currentEditor = undefined;
        }
    }
}
//# sourceMappingURL=VscAppContext.js.map