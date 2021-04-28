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
exports.AppMain = void 0;
const AppContext_1 = require("./AppContext");
const StringCounter_1 = require("../StringCounter");
const AutoFormatter_1 = require("./AutoFormatter");
const TableCacheManager_1 = require("./TableCacheManager");
const CacheUpdater_1 = require("./CacheUpdater");
const TableObserver_1 = require("./TableObserver");
const AppHelper_1 = require("./AppHelper");
class AppMain {
    constructor(appContext) {
        this.appContext = appContext;
        this.helper = new AppHelper_1.AppHelper(this.appContext);
        this.cache = new TableCacheManager_1.TableCacheManager(() => this.helper.getTable());
        this.eventReciever = new EventReciever();
        this.recieverSwitcher = new RecieverSwitcher(this.eventReciever);
        this.decoratorSwitcher = new DecoratorSwitcher(appContext);
        this.cache.cacheItemUpdated.push((nv, ov) => {
            this.onCurrentTableChanged(nv, ov);
        });
        // 文字数カウントの設定、仕様が定まらない・・・。
        StringCounter_1.StringCounter.counter = this.appContext.getStringCounter();
        // TODO: 設計上どうかと思うけど面倒だから仕方ない。
        AppContext_1.setAppContext(this.appContext);
    }
    set useAutoFormatter(use) {
        use ? this.recieverSwitcher.on() : this.recieverSwitcher.off();
    }
    set useDecorator(use) {
        this.decoratorSwitcher.setEnabled(use);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            // イベントの受信設定
            this.initRecievers(this.eventReciever, this.appContext);
            // コマンドの登録設定
            this.commandExecutionManager = this.registerCommands(this.appContext);
        });
    }
    initRecievers(reciever, appContext) {
        reciever.recievers.push(new AutoFormatter_1.AutoFormatter(appContext, this.cache, () => this.formatted()));
        reciever.recievers.push(new CacheUpdater_1.CacheUpdater(this.cache));
        reciever.recievers.push(new TableObserver_1.TableObserver(appContext, tables => this.onTablesUpdated(tables)));
        this.initEvents(this.eventReciever);
    }
    onTablesUpdated(tables) {
    }
    formatted() {
    }
    onCurrentTableChanged(nv, ov) {
        var _a;
        const appContext = this.appContext;
        appContext.clearDecorate();
        if (nv) {
            const docPos = appContext.getCursor();
            if (docPos) {
                this.decoratorSwitcher.decorate(() => appContext.decorate(nv, docPos));
            }
        }
        // コマンドの有効状態を更新
        (_a = this.commandExecutionManager) === null || _a === void 0 ? void 0 : _a.updateContents();
    }
}
exports.AppMain = AppMain;
class EventReciever {
    constructor() {
        this.recievers = [];
    }
    textChanged(e) {
        this.recievers.forEach(_ => _.textChanged(e));
    }
    selectChanged(e) {
        this.recievers.forEach(_ => _.selectChanged(e));
    }
    otherChanged(e) {
        this.recievers.forEach(_ => _.otherChanged(e));
    }
}
class RecieverSwitcher {
    constructor(reciever) {
        this.reciever = reciever;
    }
    on() {
        if (this.formatter) {
            this.reciever.recievers.unshift(this.formatter);
            this.formatter = undefined;
        }
    }
    off() {
        const formatter = this.reciever.recievers.find(_ => _ instanceof AutoFormatter_1.AutoFormatter);
        if (formatter) {
            const rs = this.reciever.recievers;
            const f = rs.splice(rs.indexOf(formatter), 1);
            if (f.length) {
                this.formatter = f[0];
            }
        }
    }
}
class DecoratorSwitcher {
    constructor(appContext) {
        this.appContext = appContext;
        this._enabled = false;
    }
    setEnabled(enabled) {
        this._enabled = enabled;
        if (!enabled) {
            this.appContext.clearDecorate();
        }
    }
    decorate(action) {
        if (this._enabled) {
            action();
        }
    }
}
//# sourceMappingURL=AppMain.js.map