"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextReader = void 0;
class TextReader {
    constructor(textSource) {
        this._position = -1;
        this._textSource = textSource;
    }
    get position() {
        return this._position;
    }
    get current() {
        return this._textSource.lineAt(this._position);
    }
    /**
     * positionをインクリメントします。
     * ただし、終点を超えることはない点に注意してください。
     */
    moveNext() {
        // 外側は、_textSourceからlengthが取得できないための処置。
        if (this._textSource.hasLine(this._position) || this.position === -1) {
            this._position++;
            return this._textSource.hasLine(this._position);
        }
        return false;
    }
    /**
     * positionをデクリメントします。
     * ただし、始点(-1)未満には移動しない点に注意してください。
     */
    moveBack() {
        this._position = Math.max(-1, this._position - 1);
        return this._textSource.hasLine(this._position);
    }
    copy() {
        const tr = new TextReader(this._textSource);
        tr._position = this._position;
        return tr;
    }
    copyBackMode() {
        const tr = this.copy();
        tr.moveNext();
        return tr;
    }
    copyNextMode() {
        const tr = this.copy();
        tr.moveBack();
        return tr;
    }
    /**
     * positionを指定した位置までまで移動します。
     * 移動先が終点でない有効範囲内であればtrueを返します。
     * falseが返る状況にない場合でもpositionはリセットされません。
     * saveSeek(position)かITrackbackableからリセットしてください。
     */
    seek(position) {
        // positionに到達するまで、moveNext()が真であり続ける限りmoveNext()する。(終点を超えてのmoveNext()は無効になるため)
        while (this._position < position && this.moveNext())
            ;
        while (this._position > position && this.moveBack())
            ;
        return position === this._position && this.hasCurrent();
    }
    safeSeek(position) {
        const tr = this.createRollbackable();
        if (this.seek(position)) {
            return true;
        }
        tr.rollback();
        return false;
    }
    freeSeek(position) {
        this.seek(position);
        return this;
    }
    atPosition(position) {
        return position === this._position && this.hasCurrent();
    }
    hasCurrent() {
        return this._textSource.hasLine(this._position);
    }
    /**
     * moveNext()された後のcurrentをコールバックから取得します。
     */
    static lx(textReader, callback) {
        if (textReader.moveNext()) {
            let line = textReader.current;
            return callback(line);
        }
        return null;
    }
    createRollbackable() {
        let position = this._position;
        return {
            rollback: () => {
                this._position = position;
            }
        };
    }
    getText(begin, end) {
        const arr = [];
        const tr = this.copy().freeSeek(begin).copyNextMode();
        while (tr.moveNext() && tr.position < end) {
            arr.push(tr.current);
        }
        return arr;
    }
}
exports.TextReader = TextReader;
//# sourceMappingURL=TextReader.js.map