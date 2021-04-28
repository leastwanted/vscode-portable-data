"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoFormatter = void 0;
const EventUpdateManager_1 = require("./EventUpdateManager");
const AppHelper_1 = require("./AppHelper");
class AutoFormatter {
    constructor(appContext, cache, formatted) {
        this.appContext = appContext;
        this.cache = cache;
        this.formatted = formatted;
        this.updateManager = new EventUpdateManager_1.EventUpdateManager(500);
        this.updateManager.updated.push(() => this.requestReplace());
    }
    textChanged(e) {
        this.docPos = e.changeStartPosition;
        //
        this.updateManager.lazyUpdate();
        //
        // 
        // this.updateManager.update();
        //
        //
        //
    }
    selectChanged(e) {
        //this.updateManager.hasUpdate();
    }
    otherChanged(e) {
        //this.updateManager.hasUpdate();
    }
    /**
     *
     */
    requestReplace() {
        if (!this.docPos)
            return;
        // 自動フォーマットなのでキャッシュではなく直接取得。
        let table = this.cache.newItem;
        if (table) {
            const helper = new AppHelper_1.AppHelper(this.appContext);
            // しまった、ここでテーブルの構造に変化が加わるので、
            const fmt = helper.formatTable(table); // 改行コードなし
            const doc = helper.getDocumentText(table.range); // 改行コードあり
            // 新しくテーブルを再取得する必要がある。
            table = this.cache.newItem;
            const newPos = this.appContext.getCursor();
            if (table && newPos && fmt !== doc) {
                this.formatted();
                //this.appMain.commandFactory.createBeautifulFormat().execute();
                //this.updateManager.clearTimeout();
            }
        }
        // ちょっとリファクタ必要かな
        this.docPos = undefined;
    }
}
exports.AutoFormatter = AutoFormatter;
//# sourceMappingURL=AutoFormatter.js.map