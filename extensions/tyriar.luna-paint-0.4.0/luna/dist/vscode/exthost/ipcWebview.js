"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebviewIpcClient = void 0;
class WebviewIpcClient {
    constructor(_webview) {
        this._webview = _webview;
        this._webviewRequestHandlers = new Map();
        this._activeRequests = new Map();
        this._webview.onDidReceiveMessage(async (e) => {
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
                const reply = await handler(e.body);
                const response = {
                    type: e.type,
                    body: reply,
                    webviewRequestId: e.webviewRequestId
                };
                this._webview.postMessage(response);
                return;
            }
        });
    }
    registerRequestHandler(type, handler) {
        if (this._webviewRequestHandlers.has(type)) {
            throw new Error(`Duplicate webview request handler "${type}"`);
        }
        this._webviewRequestHandlers.set(type, handler);
    }
    request(type, args) {
        const extHostRequestId = Math.round(Math.random() * 1000000);
        return new Promise(r => {
            this._activeRequests.set(extHostRequestId, r);
            const request = {
                type,
                body: args,
                extHostRequestId
            };
            this._webview.postMessage(request);
        });
    }
}
exports.WebviewIpcClient = WebviewIpcClient;
//# sourceMappingURL=ipcWebview.js.map