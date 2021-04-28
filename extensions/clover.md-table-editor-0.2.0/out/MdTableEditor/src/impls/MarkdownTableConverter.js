"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlignFormatter = exports.CellFormatter = exports.MarkdownTableFormatter = exports.MarkdownTableConverter = exports.MarkdownTableRenderMode = void 0;
const MarkdownAlignments_1 = require("../interfaces/MarkdownAlignments");
const StringCounter_1 = require("../StringCounter");
var MarkdownTableRenderMode;
(function (MarkdownTableRenderMode) {
    /**
     * 出来るだけ元を崩さず自然な状態でフォーマットします。
     */
    MarkdownTableRenderMode[MarkdownTableRenderMode["Natural"] = 0] = "Natural";
    /**
     * 奇麗に整えられた状態でフォーマットします。
     */
    MarkdownTableRenderMode[MarkdownTableRenderMode["Beautiful"] = 1] = "Beautiful";
})(MarkdownTableRenderMode = exports.MarkdownTableRenderMode || (exports.MarkdownTableRenderMode = {}));
/**
 *
 */
class MarkdownTableConverter {
    constructor(formatMode) {
        this.formatMode = formatMode;
    }
    static format(table, mode = MarkdownTableRenderMode.Beautiful) {
        const formatter = MarkdownTableFormatter.createInstance();
        const converter = new MarkdownTableConverter(mode);
        formatter.format(table);
        return converter.toDataType(table);
    }
    toDataType(table) {
        const textBuilder = [];
        textBuilder.push(this.createRow(table.headers));
        textBuilder.push(this.createRow(table.alignments));
        table.rows.forEach(_ => textBuilder.push(this.createRow(_)));
        // TODO: 実験中
        return textBuilder.join("\r\n").trim();
    }
    createRow(row) {
        return this.formatMode === MarkdownTableRenderMode.Beautiful ? this.beautiful(row) : this.natural(row);
    }
    natural(row) {
        return [...row].map(_ => _.word).join('|');
    }
    beautiful(row) {
        const msg = row.lastCell ? row.lastCell.word : '';
        return `|${row.cells.map(_ => _.word).join('|')}|${msg}`;
    }
    toTable(data) {
        throw new Error("Method not implemented.");
    }
}
exports.MarkdownTableConverter = MarkdownTableConverter;
class MarkdownTableFormatter {
    constructor(config, cellFormatter, alignFormatter) {
        this.config = config;
        this.cellFormatter = cellFormatter;
        this.alignFormatter = alignFormatter;
    }
    static createInstance(leftSpaceLength = 1, rightSpaceLength = 1) {
        return new MarkdownTableFormatter({
            rightSpaceLength: rightSpaceLength,
            leftSpaceLength: leftSpaceLength
        }, new CellFormatter(), new AlignFormatter());
    }
    format(table) {
        const columnInfo = this.getColumnRenderInfo(table);
        this.formatCell(table.headers, columnInfo);
        this.formatAlign(table.alignments, columnInfo);
        table.rows.forEach(_ => this.formatCell(_, columnInfo));
    }
    formatCell(row, columnInfo) {
        row.cells.forEach((_, index) => this.cellFormatter.format(_, columnInfo[index], this.config));
    }
    formatAlign(align, columnInfo) {
        align.cells.forEach((_, index) => this.alignFormatter.format(_, columnInfo[index]));
    }
    // 余白を含めたカラム横幅の最大サイズを取得。
    getColumnRenderInfo(table) {
        return table.headers.cells.map((value, index) => {
            // 存在する縦のセルの文字数をすべて取得
            const vc = [...table.getVerticalOnlyTableRows(index)].map(_ => StringCounter_1.StringCounter.stringCount(_.cell.word.trim()));
            // ヘッダ文字数を含め、その中で最大値を取得
            const max = Math.max(...vc, StringCounter_1.StringCounter.stringCount(table.headers.cells[index].word.trim()));
            // アライメントのセルを取得
            const cell = table.alignments.getCell(index);
            return {
                width: this.adjustWidth(max),
                align: cell ? cell.align : MarkdownAlignments_1.MarkdownAlignments.Left
            };
        });
    }
    adjustWidth(width) {
        // 余白を追加。
        width += this.config.leftSpaceLength + this.config.rightSpaceLength;
        // widthは最低でも3文字必要(アライメントが三文字(例えば'---'や'--:'など))なので調整する。
        width = Math.max(3, width);
        return width;
    }
}
exports.MarkdownTableFormatter = MarkdownTableFormatter;
class CellFormatter {
    format(cell, columnInfo, config) {
        const word = cell.word.trim();
        // 空白の合計サイズを計算。ワードから余白と文字列サイズを引いたもの。
        const spaceCount = Math.max(0, columnInfo.width - StringCounter_1.StringCounter.stringCount(word) - config.leftSpaceLength - config.rightSpaceLength);
        // 左右の空白のサイズを計算
        const [l, r] = this.getSpace(spaceCount, columnInfo.align);
        // 左右の空白に余白のサイズを追加。
        const [left, right] = [l + config.leftSpaceLength, r + config.rightSpaceLength];
        // 空白を文字列化
        const leftSpace = ' '.repeat(left);
        const rightSpace = ' '.repeat(right);
        // セルを変更
        cell.word = `${leftSpace}${word}${rightSpace}`;
    }
    // アライメントによって空白量を計算
    getSpace(spaceCount, align) {
        // Center or Right(スペースが左側)
        let [left, right] = align === MarkdownAlignments_1.MarkdownAlignments.Center
            ? this.splitNumber(spaceCount) : [spaceCount, 0];
        // or Left
        if (align === MarkdownAlignments_1.MarkdownAlignments.Left) {
            [left, right] = [right, left];
        }
        return [left, right];
    }
    // センタリングの場合、奇数を考慮して２分割。奇数の場合はは左側に空白を追加。
    splitNumber(len) {
        const flag = len % 2; // 奇数ならflagが1になる。
        const hf = (len - flag) / 2; // 偶数を2で割る
        return [hf + flag, hf]; // 奇数なら左に1追加
    }
}
exports.CellFormatter = CellFormatter;
class AlignFormatter {
    format(align, columnInfo) {
        const aw = align.alignWord;
        const line = '-'.repeat(columnInfo.width - 3);
        const lineStr = `${aw.charAt(0)}${line}${aw.charAt(1)}${aw.charAt(2)}`;
        // セルを変更
        align.word = lineStr;
    }
}
exports.AlignFormatter = AlignFormatter;
//# sourceMappingURL=MarkdownTableConverter.js.map