"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManagerBase = void 0;
class CacheManagerBase {
    /**
     * @param newItemFactory 新しくアイテムを作成する必要があるときに呼び出します。
     */
    constructor(newItemFactory) {
        this.newItemFactory = newItemFactory;
        this.cacheItemUpdated = [];
    }
    /**
     * キャッシュされたアイテムを取得します。無ければundefinedが返ります。
     */
    get cachedItem() {
        return this._cachedItem;
    }
    /**
     * キャッシュされたアイテム、無ければ新規作成して返します。
     */
    get item() {
        return this._cachedItem || this.newItem;
    }
    /**
     * 新しくアイテムを生成します。その後updateCacheItem()で更新されることに注意してください。
     * newItemFactoryがundefinedの場合はそのままundefinedが返ります。
     */
    get newItem() {
        const item = this.newItemFactory ? this.newItemFactory() : undefined;
        return this.updateCacheItem(item);
    }
    /**
     * アイテムを更新します。
     * @param item
     */
    updateCacheItem(item) {
        const ov = this._cachedItem;
        const nv = item;
        this._cachedItem = item;
        this.onCacheItemUpdated(nv, ov);
        return item;
    }
    /**
     *
     * @param nv
     * @param ov
     */
    onCacheItemUpdated(nv, ov) {
        if (ov === undefined && nv === undefined) {
            return;
        }
        for (const up of this.cacheItemUpdated) {
            up(nv, ov);
        }
    }
    clear() {
        this.updateCacheItem(undefined);
    }
    hasCachedItem() {
        return this._cachedItem !== undefined;
    }
}
exports.CacheManagerBase = CacheManagerBase;
//# sourceMappingURL=CacheManagerBase.js.map