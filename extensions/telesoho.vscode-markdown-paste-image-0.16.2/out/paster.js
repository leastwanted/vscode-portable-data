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
exports.Paster = void 0;
const path = require("path");
const clipboard = require("clipboardy");
const child_process_1 = require("child_process");
const moment = require("moment");
const vscode = require("vscode");
const toMarkdown_1 = require("./toMarkdown");
const utils_1 = require("./utils");
const fs_1 = require("fs");
const language_detection_1 = require("./language_detection");
const Logger_1 = require("./Logger");
var ClipboardType;
(function (ClipboardType) {
    ClipboardType[ClipboardType["Unknown"] = -1] = "Unknown";
    ClipboardType[ClipboardType["Html"] = 0] = "Html";
    ClipboardType[ClipboardType["Text"] = 1] = "Text";
    ClipboardType[ClipboardType["Image"] = 2] = "Image";
})(ClipboardType || (ClipboardType = {}));
class PasteImageContext {
}
function wslSafe(path) {
    return __awaiter(this, void 0, void 0, function* () {
        if (utils_1.getCurrentPlatform() != "wsl")
            return path;
        yield runCommand("touch", [path]);
        return runCommand("wslpath", ["-m", path]);
    });
}
/**
 * Run command and get stdout
 * @param shell
 * @param options
 */
function runCommand(shell, options, timeout = 10000) {
    return new Promise((resolve, reject) => {
        let errorTriggered = false;
        let output = "";
        let errorMessage = "";
        let process = child_process_1.spawn(shell, options, { timeout });
        process.stdout.on("data", (chunk) => {
            Logger_1.default.log(chunk);
            output += `${chunk}`;
        });
        process.stderr.on("data", (chunk) => {
            Logger_1.default.log(chunk);
            errorMessage += `${chunk}`;
        });
        process.on("exit", (code, signal) => {
            if (process.killed) {
                Logger_1.default.log("Process took too long and was killed");
            }
            if (!errorTriggered) {
                if (code === 0) {
                    resolve(output.trim());
                }
                else {
                    reject(errorMessage);
                }
            }
        });
        process.on("error", (error) => {
            errorTriggered = true;
            reject(error);
        });
    });
}
class Paster {
    static pasteCode() {
        return __awaiter(this, void 0, void 0, function* () {
            const content = clipboard.readSync();
            if (content) {
                let ld = new language_detection_1.LanguageDetection();
                let lang = yield ld.detectLanguage(content);
                Paster.writeToEditor(`\`\`\`${lang}\n${content}\n\`\`\``);
            }
        });
    }
    /**
     * Paste text
     */
    static pasteText() {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx_type = yield this.getClipboardContentType();
            Logger_1.default.log("Clipboard Type:", ctx_type);
            switch (ctx_type) {
                case ClipboardType.Html:
                    const html = yield this.pasteTextHtml();
                    Logger_1.default.log(html);
                    const markdown = toMarkdown_1.toMarkdown(html);
                    Paster.writeToEditor(markdown);
                    break;
                case ClipboardType.Text:
                    const text = yield this.pasteTextPlain();
                    if (text) {
                        let newContent = Paster.parse(text);
                        Paster.writeToEditor(newContent);
                    }
                    break;
                case ClipboardType.Image:
                    Paster.pasteImage();
                    break;
                case ClipboardType.Unknown:
                    // Probably missing script to support type detection
                    const textContent = clipboard.readSync();
                    // If clipboard has text, paste it
                    if (textContent) {
                        Paster.writeToEditor(textContent);
                    }
                    else {
                        // No text in clipboard, attempt to paste image
                        Paster.pasteImage();
                    }
                    break;
            }
        });
    }
    /**
     * Download url content in clipboard
     */
    static pasteDownload() {
        return __awaiter(this, void 0, void 0, function* () {
            const ctx_type = yield this.getClipboardContentType();
            Logger_1.default.log("Clipboard Type:", ctx_type);
            switch (ctx_type) {
                case ClipboardType.Html:
                case ClipboardType.Text:
                    const text = yield this.pasteTextPlain();
                    if (text) {
                        if (/^(http[s]:)+\/\/(.*)/i.test(text)) {
                            Paster.pasteImageURL(text);
                        }
                    }
                    break;
            }
        });
    }
    /**
     * Ruby tag
     */
    static Ruby() {
        let editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let rubyTag = new vscode.SnippetString("<ruby>${TM_SELECTED_TEXT}<rp>(</rp><rt>${1:pronunciation}</rt><rp>)</rp></ruby>");
        editor.insertSnippet(rubyTag);
    }
    static isHTML(content) {
        return /<[a-z][\s\S]*>/i.test(content);
    }
    static writeToEditor(content) {
        let startLine = vscode.window.activeTextEditor.selection.start.line;
        const selection = vscode.window.activeTextEditor.selection;
        let position = new vscode.Position(startLine, selection.start.character);
        return vscode.window.activeTextEditor.edit((editBuilder) => {
            editBuilder.insert(position, content);
        });
    }
    /**
     * Replace all predefined variable.
     * @param str path
     * @returns
     */
    static replacePredefinedVars(str) {
        let replaceMap = {
            "${workspaceRoot}": (vscode.workspace.workspaceFolders &&
                vscode.workspace.workspaceFolders[0].uri.fsPath) ||
                "",
        };
        let editor = vscode.window.activeTextEditor;
        let fileUri = editor && editor.document.uri;
        let filePath = fileUri && fileUri.fsPath;
        if (filePath) {
            replaceMap["${fileExtname}"] = path.extname(filePath);
            replaceMap["${fileBasenameNoExtension}"] = path.basename(filePath, replaceMap["${fileExtname}"]);
            replaceMap["${fileBasename}"] = path.basename(filePath);
            replaceMap["${fileDirname}"] = path.dirname(filePath);
        }
        for (const search in replaceMap) {
            str = str.replace(search, replaceMap[search]);
        }
        // User may be input a path with backward slashes (\), so need to replace all '\' to '/'.
        return str.replace(/\\/g, "/");
    }
    static getConfig() {
        let editor = vscode.window.activeTextEditor;
        if (!editor)
            return vscode.workspace.getConfiguration("MarkdownPaste");
        let fileUri = editor.document.uri;
        if (!fileUri)
            return vscode.workspace.getConfiguration("MarkdownPaste");
        return vscode.workspace.getConfiguration("MarkdownPaste", fileUri);
    }
    /**
     * Generate different Markdown content based on the value entered.
     * for example:
     * ./assets/test.png        => ![](./assets/test.png)
     * ./assets/test.png?200,10 => <img src="./assets/test.png" width="200" height="10"/>
     * ./assets/                => ![](![](data:image/png;base64,...)
     * ./assets/?200,10         => <img src="data:image/png;base64,..." width="200" height="10"/>
     *
     * @param inputVal
     * @returns
     */
    static parsePasteImageContext(inputVal) {
        if (!inputVal)
            return;
        inputVal = this.replacePredefinedVars(inputVal);
        //leading and trailling white space are invalidate
        if (inputVal && inputVal.length !== inputVal.trim().length) {
            vscode.window.showErrorMessage('The specified path is invalid: "' + inputVal + '"');
            return;
        }
        // ! Maybe it is a bug in vscode.Uri.parse():
        // > vscode.Uri.parse("f:/test/images").fsPath
        // '/test/images'
        // > vscode.Uri.parse("file:///f:/test/images").fsPath
        // 'f:/test/image'
        //
        // So we have to add file:/// scheme. while input value contain a driver character
        if (inputVal.substr(1, 1) === ":") {
            inputVal = "file:///" + inputVal;
        }
        let pasteImgContext = new PasteImageContext();
        let inputUri = vscode.Uri.parse(inputVal);
        if (inputUri.fsPath.slice(inputUri.fsPath.length - 1) == "/") {
            // While filename is empty(ex: /abc/?200,20),  paste clipboard to a temporay file, then convert it to base64 image to markdown.
            pasteImgContext.targetFile = utils_1.newTemporaryFilename();
            pasteImgContext.convertToBase64 = true;
            pasteImgContext.removeTargetFileAfterConvert = true;
        }
        else {
            pasteImgContext.targetFile = inputUri;
            pasteImgContext.convertToBase64 = false;
            pasteImgContext.removeTargetFileAfterConvert = false;
        }
        let enableImgTagConfig = this.getConfig().enableImgTag;
        if (enableImgTagConfig && inputUri.query) {
            // parse `<filepath>[?width,height]`. for example. /abc/abc.png?200,100
            let ar = inputUri.query.split(",");
            if (ar) {
                pasteImgContext.imgTag = {
                    width: ar[0],
                    height: ar[1],
                };
            }
        }
        return pasteImgContext;
    }
    static saveImage(targetPath) {
        return __awaiter(this, void 0, void 0, function* () {
            let pasteImgContext = this.parsePasteImageContext(targetPath);
            if (!pasteImgContext || !pasteImgContext.targetFile)
                return;
            let imgPath = pasteImgContext.targetFile.fsPath;
            if (!utils_1.prepareDirForFile(imgPath)) {
                vscode.window.showErrorMessage("Make folder failed:" + imgPath);
                return;
            }
            // save image and insert to current edit file
            const imagePath = yield this.saveClipboardImageToFileAndGetPath(imgPath);
            if (!imagePath)
                return;
            if (imagePath === "no image") {
                vscode.window.showInformationMessage("There is not an image in the clipboard.");
                return;
            }
            this.renderMarkdownLink(pasteImgContext);
        });
    }
    static renderMdFilePath(pasteImgContext) {
        let editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let fileUri = editor.document.uri;
        if (!fileUri)
            return;
        let languageId = editor.document.languageId;
        let docPath = fileUri.fsPath;
        // relative will be add backslash characters so need to replace '\' to '/' here.
        let imageFilePath = this.parse(this.encodePath(path.relative(path.dirname(docPath), pasteImgContext.targetFile.fsPath)));
        //"../../static/images/vscode-paste/cover.png".replace(new RegExp("(.*/static/)(.*)", ""), "/$2")
        if (languageId === "markdown") {
            let imgTag = pasteImgContext.imgTag;
            if (imgTag) {
                return `<img src='${imageFilePath}' width='${imgTag.width}' height='${imgTag.height}'/>`;
            }
            return `![](${imageFilePath})`;
        }
        else {
            return imageFilePath;
        }
    }
    static renderMdImageBase64(pasteImgContext) {
        if (!pasteImgContext.targetFile.fsPath ||
            !fs_1.existsSync(pasteImgContext.targetFile.fsPath)) {
            return;
        }
        let renderText = utils_1.base64Encode(pasteImgContext.targetFile.fsPath);
        let imgTag = pasteImgContext.imgTag;
        if (imgTag) {
            renderText = `<img src='data:image/png;base64,${renderText}' width='${imgTag.width}' height='${imgTag.height}'/>`;
        }
        else {
            renderText = `![](data:image/png;base64,${renderText})`;
        }
        const rmOptions = {
            recursive: true,
            force: true,
        };
        if (pasteImgContext.removeTargetFileAfterConvert) {
            fs_1.rmSync(pasteImgContext.targetFile.fsPath, rmOptions);
        }
        return renderText;
    }
    static renderMarkdownLink(pasteImgContext) {
        let editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let renderText;
        if (pasteImgContext.convertToBase64) {
            renderText = this.renderMdImageBase64(pasteImgContext);
        }
        else {
            renderText = this.renderMdFilePath(pasteImgContext);
        }
        if (renderText) {
            editor.edit((edit) => {
                let current = editor.selection;
                if (current.isEmpty) {
                    edit.insert(current.start, renderText);
                }
                else {
                    edit.replace(current, renderText);
                }
            });
        }
    }
    /**
     * Encode path string.
     * encodeURI        : encode all characters to URL encode format
     * encodeSpaceOnly  : encode all space character to %20
     * none             : do nothing
     * @param filePath
     * @returns
     */
    static encodePath(filePath) {
        filePath = filePath.replace(/\\/g, "/");
        const encodePathConfig = this.getConfig().encodePath;
        if (encodePathConfig == "encodeURI") {
            filePath = encodeURI(filePath);
        }
        else if (encodePathConfig == "encodeSpaceOnly") {
            filePath = filePath.replace(/ /g, "%20");
        }
        return filePath;
    }
    static parse(content) {
        let rules = this.getConfig().rules;
        for (const rule of rules) {
            const re = new RegExp(rule.regex, rule.options);
            const reps = rule.replace;
            if (re.test(content)) {
                const newstr = content.replace(re, reps);
                return newstr;
            }
        }
        try {
            // if copied content is exist file path that under folder of workspace root path
            // then add a relative link into markdown.
            if (fs_1.existsSync(content)) {
                let editor = vscode.window.activeTextEditor;
                let fileUri = editor.document.uri;
                let current_file_path = fileUri.fsPath;
                let workspace_root_dir = vscode.workspace.workspaceFolders &&
                    vscode.workspace.workspaceFolders[0].uri.path;
                if (content.startsWith(workspace_root_dir)) {
                    let relative_path = this.encodePath(path.relative(path.dirname(current_file_path), content));
                    return `![](${relative_path})`;
                }
            }
        }
        catch (error) {
            // do nothing
            // Logger.log(error);
        }
        if (Paster.isHTML(content)) {
            return toMarkdown_1.toMarkdown(content);
        }
        return content;
    }
    static pasteTextPlain() {
        return __awaiter(this, void 0, void 0, function* () {
            const script = {
                win32: "win32_get_clipboard_text_plain.ps1",
                linux: "linux_get_clipboard_text_plain.sh",
                darwin: null,
                wsl: "win32_get_clipboard_text_plain.ps1",
                win10: "win32_get_clipboard_text_plain.ps1",
            };
            return this.runScript(script, []);
        });
    }
    static pasteTextHtml() {
        return __awaiter(this, void 0, void 0, function* () {
            const script = {
                win32: "win32_get_clipboard_text_html.ps1",
                linux: "linux_get_clipboard_text_html.sh",
                darwin: null,
                wsl: "win32_get_clipboard_text_html.ps1",
                win10: "win32_get_clipboard_text_html.ps1",
            };
            return this.runScript(script, []);
        });
    }
    /**
     * Download image to local and render markdown link for it.
     * @param image_url
     */
    static pasteImageURL(image_url) {
        let filename = image_url.split("/").pop().split("?")[0];
        let ext = path.extname(filename);
        let imagePath = this.genTargetImagePath(ext);
        if (!imagePath)
            return;
        let silence = this.getConfig().silence;
        if (silence) {
            Paster.downloadFile(image_url, imagePath);
        }
        else {
            let options = {
                prompt: "You can change the filename. The existing file will be overwritten!",
                value: imagePath,
                placeHolder: "(e.g:../test/myimg.png?100,60)",
                valueSelection: [
                    imagePath.length - path.basename(imagePath).length,
                    imagePath.length - ext.length,
                ],
            };
            vscode.window.showInputBox(options).then((inputVal) => {
                Paster.downloadFile(image_url, inputVal);
            });
        }
    }
    static downloadFile(image_url, target) {
        let pasteImgContext = this.parsePasteImageContext(target);
        if (!pasteImgContext || !pasteImgContext.targetFile)
            return;
        let imgPath = pasteImgContext.targetFile.fsPath;
        if (!utils_1.prepareDirForFile(imgPath)) {
            vscode.window.showErrorMessage("Make folder failed:" + imgPath);
            return;
        }
        // save image and insert to current edit file
        utils_1.fetchAndSaveFile(image_url, imgPath)
            .then((imagePath) => {
            if (!imagePath)
                return;
            if (imagePath === "no image") {
                vscode.window.showInformationMessage("There is not an image in the clipboard.");
                return;
            }
            this.renderMarkdownLink(pasteImgContext);
        })
            .catch((err) => {
            vscode.window.showErrorMessage("Download failed:" + err);
        });
    }
    /**
     * Paste clipboard of image to file and render Markdown link for it.
     * @returns
     */
    static pasteImage() {
        let ext = ".png";
        let imagePath = this.genTargetImagePath(ext);
        if (!imagePath)
            return;
        let silence = this.getConfig().silence;
        if (silence) {
            Paster.saveImage(imagePath);
        }
        else {
            let options = {
                prompt: "You can change the filename. The existing file will be overwritten!.",
                value: imagePath,
                placeHolder: "(e.g:../test/myimage.png?100,60)",
                valueSelection: [
                    imagePath.length - path.basename(imagePath).length,
                    imagePath.length - ext.length,
                ],
            };
            vscode.window.showInputBox(options).then((inputVal) => {
                Paster.saveImage(inputVal);
            });
        }
    }
    /**
     * Generate an path for target image.
     * @param extension extension of target image file.
     * @returns
     */
    static genTargetImagePath(extension = ".png") {
        // get current edit file path
        let editor = vscode.window.activeTextEditor;
        if (!editor)
            return;
        let fileUri = editor.document.uri;
        if (!fileUri)
            return;
        if (fileUri.scheme === "untitled") {
            vscode.window.showInformationMessage("Before pasting an image, you need to save the current edited file first.");
            return;
        }
        let filePath = fileUri.fsPath;
        // get selection as image file name, need check
        const selection = editor.selection;
        const selectText = editor.document.getText(selection);
        if (selectText && !/^[^\\/:\*\?""<>|]{1,120}$/.test(selectText)) {
            vscode.window.showInformationMessage("Your selection is not a valid file name!");
            return;
        }
        // get image destination path
        let folderPathFromConfig = this.getConfig().path;
        folderPathFromConfig = this.replacePredefinedVars(folderPathFromConfig);
        if (folderPathFromConfig &&
            folderPathFromConfig.length !== folderPathFromConfig.trim().length) {
            vscode.window.showErrorMessage('The specified path is invalid: "' + folderPathFromConfig + '"');
            return;
        }
        // image file name
        let imageFileName = "";
        if (!selectText) {
            imageFileName = moment().format("Y-MM-DD-HH-mm-ss") + extension;
        }
        else {
            imageFileName = selectText + extension;
        }
        // image output path
        let folderPath = path.dirname(filePath);
        let imagePath = "";
        // generate image path
        if (path.isAbsolute(folderPathFromConfig)) {
            // important: replace must be done at the end, path.join() will build a path with backward slashes (\)
            imagePath = path
                .join(folderPathFromConfig, imageFileName)
                .replace(/\\/g, "/");
        }
        else {
            // important: replace must be done at the end, path.join() will build a path with backward slashes (\)
            imagePath = path
                .join(folderPath, folderPathFromConfig, imageFileName)
                .replace(/\\/g, "/");
        }
        return imagePath;
    }
    static getClipboardType(types) {
        if (!types) {
            return ClipboardType.Unknown;
        }
        const detectedTypes = new Set();
        let platform = utils_1.getCurrentPlatform();
        Logger_1.default.log("platform", platform);
        switch (platform) {
            case "linux":
                for (const type of types) {
                    switch (type) {
                        case "image/png":
                            detectedTypes.add(ClipboardType.Image);
                            break;
                        case "text/html":
                            detectedTypes.add(ClipboardType.Html);
                            break;
                        default:
                            detectedTypes.add(ClipboardType.Text);
                            break;
                    }
                }
                break;
            case "win32":
            case "win10":
            case "wsl":
                for (const type of types) {
                    switch (type) {
                        case "PNG":
                        case "Bitmap":
                        case "DeviceIndependentBitmap":
                            detectedTypes.add(ClipboardType.Image);
                            break;
                        case "HTML Format":
                            detectedTypes.add(ClipboardType.Html);
                            break;
                        case "Text":
                        case "UnicodeText":
                            detectedTypes.add(ClipboardType.Text);
                            break;
                    }
                }
                break;
        }
        // Set priority based on which to return type
        const priorityOrdering = [
            ClipboardType.Image,
            ClipboardType.Html,
            ClipboardType.Text,
        ];
        for (const type of priorityOrdering)
            if (detectedTypes.has(type))
                return type;
        // No known types detected
        return ClipboardType.Unknown;
    }
    static getClipboardContentType() {
        return __awaiter(this, void 0, void 0, function* () {
            const script = {
                linux: "linux_get_clipboard_content_type.sh",
                win32: "win32_get_clipboard_content_type.ps1",
                darwin: null,
                wsl: "win32_get_clipboard_content_type.ps1",
                win10: "win32_get_clipboard_content_type.ps1",
            };
            try {
                let data = yield this.runScript(script, []);
                Logger_1.default.log("getClipboardContentType", data);
                if (data == "no xclip") {
                    vscode.window.showInformationMessage("You need to install xclip command first.");
                    return;
                }
                let types = data.split(/\r\n|\n|\r/);
                return this.getClipboardType(types);
            }
            catch (e) {
                return ClipboardType.Unknown;
            }
        });
    }
    /**
     * Run shell script.
     * @param script
     * @param parameters
     * @param callback
     */
    static runScript(script, parameters = []) {
        return __awaiter(this, void 0, void 0, function* () {
            let platform = utils_1.getCurrentPlatform();
            if (script[platform] == null) {
                Logger_1.default.log(`No scipt exists for ${platform}`);
                throw new Error(`No scipt exists for ${platform}`);
            }
            const scriptPath = path.join(__dirname, "../res/" + script[platform]);
            let shell = "";
            let command = [];
            switch (platform) {
                case "win32":
                case "win10":
                case "wsl":
                    // Windows
                    command = [
                        "-noprofile",
                        "-noninteractive",
                        "-nologo",
                        "-sta",
                        "-executionpolicy",
                        "unrestricted",
                        "-windowstyle",
                        "hidden",
                        "-file",
                        yield wslSafe(scriptPath),
                    ].concat(parameters);
                    shell =
                        platform == "wsl"
                            ? "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
                            : "powershell";
                    break;
                case "darwin":
                    // Mac
                    shell = "osascript";
                    command = [scriptPath].concat(parameters);
                    break;
                case "linux":
                    // Linux
                    shell = "sh";
                    command = [scriptPath].concat(parameters);
                    break;
            }
            const runer = runCommand(shell, command);
            return runer.then((stdout) => stdout.trim());
        });
    }
    /**
     * use applescript to save image from clipboard and get file path
     */
    static saveClipboardImageToFileAndGetPath(imagePath) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!imagePath)
                return;
            const script = {
                win32: "win32_save_clipboard_png.ps1",
                darwin: "mac.applescript",
                linux: "linux_save_clipboard_png.sh",
                wsl: "win32_save_clipboard_png.ps1",
                win10: "win32_save_clipboard_png.ps1",
            };
            return this.runScript(script, [yield wslSafe(imagePath)]);
        });
    }
}
exports.Paster = Paster;
//# sourceMappingURL=paster.js.map