"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MovableArray = void 0;
class MovableArray {
    constructor(arr) {
        this.arr = arr;
    }
    move(targetIndex, items, pos) {
        if (typeof (targetIndex) === 'number') {
            this.moveByIndex(targetIndex, items, pos);
        }
        else {
            this.moveByItem(targetIndex, items);
        }
    }
    /**
     *
     * @param targetIndex
     * @param itemIndices
     * @param pos targetIndexの前に挿入される。前に挿入するなら-1を指定。
     */
    moveByIndex(targetIndex, itemIndices, pos = 0) {
        // 削除するアイテムを取得
        const removeItems = this.getIndexItems(itemIndices);
        // targetIndex未満のインデックスのカウント
        const minCount = itemIndices.reduce((pv, cv, idx) => (cv < targetIndex) ? pv + 1 : pv, 0);
        // 削除する
        this.removeIndexItems(itemIndices);
        // 座標を修正
        const ti = this.floatIndex(targetIndex - minCount + pos);
        // 追加する
        this.insert(ti, removeItems);
    }
    moveByItem(targetItem, items) {
    }
    getIndexItems(itemIndices) {
        // 削除するアイテムを取得
        return this.arr.filter((v, i) => itemIndices.indexOf(i) !== -1);
    }
    removeIndexItems(itemIndices) {
        // 下から順に削除
        return itemIndices.concat().sort((a, b) => a + b).reduce((pv, cv) => {
            if (itemIndices.indexOf(cv) !== -1)
                pv.push(...this.arr.splice(cv, 1));
            return pv;
        }, []).reverse();
    }
    insert(index, items) {
        this.arr.splice(index, 0, ...items);
    }
    containsIndex(index) {
        return index >= 0 && index < this.count();
    }
    floatIndex(index) {
        return Math.max(0, Math.min(this.count(), index));
    }
    count() {
        return this.arr.length;
    }
}
exports.MovableArray = MovableArray;
//# sourceMappingURL=ICollectionMovable.js.map