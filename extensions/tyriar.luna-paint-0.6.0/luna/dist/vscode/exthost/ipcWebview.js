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
exports.WebviewIpcClient = void 0;
class WebviewIpcClient {
    constructor(_webview) {
        this._webview = _webview;
        this._webviewRequestHandlers = new Map();
        this._activeRequests = new Map();
        this._webview.onDidReceiveMessage((e) => __awaiter(this, void 0, void 0, function* () {
            if ('extHostRequestId' in e) {
                const extHostRequestId = e.extHostRequestId;
                const resolveRequest = this._activeRequests.get(extHostRequestId);
                if (!resolveRequest) {
                    throw new Error(`Response received without request "${extHostRequestId}"`);
                }
                this._activeRequests.delete(extHostRequestId);
                resolveRequest(e.body);
                return;
            }
            if ('webviewRequestId' in e) {
                const handler = this._webviewRequestHandlers.get(e.type);
                if (!handler) {
                    throw new Error(`No handler for webview request "${e.type}"`);
                }
                const reply = yield handler(e.body);
                const response = {
                    type: e.type,
                    body: reply,
                    webviewRequestId: e.webviewRequestId
                };
                this._webview.postMessage(response);
                return;
            }
        }));
    }
    registerRequestHandler(type, handler) {
        if (this._webviewRequestHandlers.has(type)) {
            throw new Error(`Duplicate webview request handler "${type}"`);
        }
        this._webviewRequestHandlers.set(type, handler);
    }
    request(type, args) {
        return __awaiter(this, void 0, void 0, function* () {
            const extHostRequestId = Math.round(Math.random() * 1000000);
            const promise = yield new Promise(r => {
                this._activeRequests.set(extHostRequestId, r);
                const request = {
                    type,
                    body: args,
                    extHostRequestId
                };
                this._webview.postMessage(request);
            });
            return promise;
        });
    }
}
exports.WebviewIpcClient = WebviewIpcClient;
//# sourceMappingURL=ipcWebview.js.map