"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const rawGlob = require("glob");
const fs = require("fs");
const path = require("path");
const util_1 = require("util");
const glob = util_1.promisify(rawGlob);
const readStat = util_1.promisify(fs.stat);
/**
 * get file stat
 * @param name
 * @param dir
 */
function getFileStat(name, dir) {
    return __awaiter(this, void 0, void 0, function* () {
        const absolutePath = path.join(dir || process.cwd(), name);
        let stat;
        try {
            stat = yield readStat(absolutePath);
        }
        catch (e) {
            return null;
        }
        return {
            name,
            absolutePath,
            stat,
            isDirectory: stat.isDirectory(),
            children: [],
        };
    });
}
/**
 * sort these files like VS Code. directories first, and then non-directories
 * @param files
 */
function sortFilesLikeVSCode(files) {
    const directories = files.filter(item => item.isDirectory);
    const nonDirectories = files.filter(item => !item.isDirectory);
    return directories.concat(nonDirectories);
}
/**
 * list directory recursively
 *
 * @param dir
 * @param config
 */
function listDirectory(dir, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ignore = [], sort = false, maxDepth = 1, } = config || {};
        if (maxDepth <= 0) {
            return [];
        }
        const fileNames = yield glob('*', {
            cwd: dir,
            dot: true,
            nosort: !sort,
            ignore,
        });
        let files = yield Promise.all(fileNames.map(item => getFileStat(item, dir)));
        files = files.filter(item => item !== null);
        //  sort
        if (sort) {
            files = sortFilesLikeVSCode(files);
        }
        let remainingDepth = maxDepth - 1;
        if (remainingDepth > 0) {
            for (let file of files) {
                if (file.isDirectory) {
                    const subFiles = yield listDirectory(file.absolutePath, Object.assign({}, config, { maxDepth: remainingDepth }));
                    file.children = subFiles;
                    //  add 'parent' mark
                    subFiles.forEach(f => {
                        f.parent = file;
                    });
                }
            }
        }
        return files;
    });
}
exports.listDirectory = listDirectory;
function formatFileTreeItemsFromDirectory(dir, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = yield listDirectory(dir, config);
        const allList = [];
        function traverseTree(list, parent) {
            list.forEach((f, index) => {
                const item = {
                    name: f.name,
                    isLast: index === list.length - 1,
                    depth: parent ? parent.depth + 1 : 0,
                    parent,
                };
                allList.push(item);
                if (f.children.length) {
                    traverseTree(f.children, item);
                }
            });
        }
        traverseTree(files);
        return allList;
    });
}
exports.formatFileTreeItemsFromDirectory = formatFileTreeItemsFromDirectory;
//# sourceMappingURL=directory.js.map