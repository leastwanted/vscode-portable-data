"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventUpdateManager = void 0;
/**
 *
 * ドキュメント変更におけるイベントを一元管理します。
 * エディタがアクティブ化されたり、コマンドが実行された場合など即時にイベントを発生させるものと、
 * テキスト変更、セレクション変更など遅延して発生させるものがあります。
 * update()が即時、lazyUpdate()が遅延でイベントを発生させます。
 *
 * @see https://github.com/Microsoft/vscode-extension-samples/blob/master/decorator-sample/src/extension.ts
 */
class EventUpdateManager {
    constructor(interval = 500) {
        this.interval = interval;
        this._timeout = null;
        this.updated = [];
    }
    /**
     *
     * @param e
     */
    lazyUpdate() {
        this.clearTimeout();
        this._timeout = setTimeout(() => this.onUpdated(), this.interval);
    }
    /**
     * 即時更新を実行します。
     * @param e
     */
    update() {
        this.clearTimeout();
        this.onUpdated();
    }
    /**
     * タイマーがセットしてある場合のみ即時更新します。
     * @param e
     */
    hasUpdate() {
        if (this._timeout) {
            this.update();
        }
    }
    /**
     * オーバーライドする場合は派生元を呼び出してください。
     */
    onUpdated() {
        for (const updated of this.updated) {
            updated();
        }
    }
    dispose() {
        this.clearTimeout();
    }
    clearTimeout() {
        if (this._timeout) {
            clearTimeout(this._timeout);
        }
    }
}
exports.EventUpdateManager = EventUpdateManager;
//# sourceMappingURL=EventUpdateManager.js.map