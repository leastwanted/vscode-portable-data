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
const fs = require("original-fs");
const vscode_1 = require("vscode");
const fs_1 = require("./fs");
const configuration_1 = require("./helpers/configuration");
const util_1 = require("./util");
var ProposedType;
(function (ProposedType) {
    ProposedType["PRODUCT"] = "product";
    ProposedType["ARGUMENT"] = "argument";
    ProposedType["NONE"] = "none";
})(ProposedType || (ProposedType = {}));
function promptProposedApi() {
    return __awaiter(this, void 0, void 0, function* () {
        const product = "Yes, edit product.json";
        const argument = "Yes, with start argument";
        const none = "No";
        const choice = yield vscode_1.window.showWarningMessage(`Would you like to enable proposed features for SVN?
    More info [here](https://github.com/JohnstonCode/svn-scm#experimental)`, product, argument, none);
        switch (choice) {
            case product:
                return ProposedType.PRODUCT;
            case argument:
                return ProposedType.ARGUMENT;
            case none:
                return ProposedType.NONE;
        }
        return undefined;
    });
}
function enableProposedProduct() {
    return __awaiter(this, void 0, void 0, function* () {
        const productPath = vscode_1.env.appRoot + "/product.json";
        if (!(yield fs_1.exists(productPath))) {
            vscode_1.window.showErrorMessage(`Can't find the "product.json" of VSCode.`);
            return;
        }
        if (!(yield fs_1.access(productPath, fs.constants.W_OK))) {
            vscode_1.window.showErrorMessage(`The "product.json" of VSCode is not writable.
      Please, append "johnstoncode.svn-scm" on "extensionAllowedProposedApi" array`);
            return;
        }
        const productJson = require(productPath);
        productJson.extensionAllowedProposedApi =
            productJson.extensionAllowedProposedApi || [];
        if (productJson.extensionAllowedProposedApi.includes("johnstoncode.svn-scm")) {
            return;
        }
        productJson.extensionAllowedProposedApi.push("johnstoncode.svn-scm");
        yield fs_1.writeFile(productPath, JSON.stringify(productJson, null, 2));
        const message = "SVN proposed features enabled, please restart VSCode";
        vscode_1.window.showInformationMessage(message);
    });
}
function enableProposedArgument() {
    return __awaiter(this, void 0, void 0, function* () {
        const packagePath = __dirname + "/../package.json";
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const packageJson = require(packagePath);
        if (!packageJson || packageJson.enableProposedApi !== false) {
            return;
        }
        packageJson.enableProposedApi = true;
        yield fs_1.writeFile(packagePath, JSON.stringify(packageJson, null, 2));
        const message = `SVN proposed features enabled,
    please close the VSCode and run with: --enable-proposed-api johnstoncode.svn-scm`;
        vscode_1.window.showInformationMessage(message);
    });
}
function setProposedApi(status) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (status) {
            case ProposedType.PRODUCT:
                enableProposedProduct();
                break;
            case ProposedType.ARGUMENT:
                enableProposedArgument();
                break;
            case ProposedType.NONE:
                break;
        }
        if (status) {
            configuration_1.configuration.update("enableProposedApi", status, vscode_1.ConfigurationTarget.Global);
        }
    });
}
exports.setProposedApi = setProposedApi;
function checkProposedApi() {
    return __awaiter(this, void 0, void 0, function* () {
        if (util_1.hasSupportToDecorationProvider()) {
            return;
        }
        let status = null;
        status = configuration_1.configuration.get("enableProposedApi", null);
        if (!status) {
            status = yield promptProposedApi();
        }
        try {
            setProposedApi(status);
        }
        catch (error) {
            console.error(error);
            yield vscode_1.window.showErrorMessage("Failed to configure proposed features for SVN");
        }
    });
}
exports.checkProposedApi = checkProposedApi;
//# sourceMappingURL=proposed.js.map