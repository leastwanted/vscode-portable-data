"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TableObserver = void 0;
const EventUpdateManager_1 = require("./EventUpdateManager");
const AppHelper_1 = require("./AppHelper");
class TableObserver {
    constructor(appContext, updated) {
        this.appContext = appContext;
        this.updated = updated;
        this.eventManager = new EventUpdateManager_1.EventUpdateManager(3000);
        this.eventManager.updated.push(() => {
            this.tableUpdate();
        });
    }
    textChanged(e) {
        this.update();
    }
    selectChanged(e) {
        this.update();
    }
    otherChanged(e) {
        // テキスト変更やセレクション変更以外、つまりエディタの変更時などは即時更新。
        this.eventManager.update();
    }
    update() {
        this.eventManager.lazyUpdate();
    }
    tableUpdate() {
        const tables = new AppHelper_1.AppHelper(this.appContext).getTableContents();
        this.updated(tables);
    }
}
exports.TableObserver = TableObserver;
//# sourceMappingURL=TableObserver.js.map