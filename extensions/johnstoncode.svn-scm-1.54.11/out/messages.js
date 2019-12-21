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
const path = require("path");
const vscode_1 = require("vscode");
function noChangesToCommit() {
    return vscode_1.window.showInformationMessage("There are no changes to commit.");
}
exports.noChangesToCommit = noChangesToCommit;
let panel;
// for tests only
let callback;
vscode_1.commands.registerCommand("svn.forceCommitMessageTest", (message) => {
    if (callback) {
        return callback(message);
    }
});
function dispose() {
    if (panel) {
        panel.dispose();
    }
}
exports.dispose = dispose;
function showCommitInput(message, filePaths) {
    return __awaiter(this, void 0, void 0, function* () {
        const promise = new Promise(resolve => {
            // Close previous commit message input
            if (panel) {
                panel.dispose();
            }
            // for tests only
            callback = (m) => {
                resolve(m);
                panel.dispose();
            };
            panel = vscode_1.window.createWebviewPanel("svnCommitMessage", "Commit Message", {
                preserveFocus: false,
                viewColumn: vscode_1.ViewColumn.Active
            }, {
                enableScripts: true,
                retainContextWhenHidden: true
            });
            const styleUri = vscode_1.Uri.file(path.join(__dirname, "..", "css", "commit-message.css")).with({ scheme: "vscode-resource" });
            let beforeForm = "";
            if (filePaths && filePaths.length) {
                const selectedFiles = filePaths.sort().map(f => `<li>${f}</li>`);
                if (selectedFiles.length) {
                    beforeForm = `
<div class="file-list">
  <h3 class="title">Files to commit</h3>
  <ul>
    ${selectedFiles.join("\n")}
  </ul>
</div>`;
                }
            }
            const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Commit Message</title>
  <link rel="stylesheet" href="${styleUri}">
</head>
<body>
  <section class="container">
    ${beforeForm}
    <form>
      <fieldset>
        <div class="float-right">
          <a href="#" id="pickCommitMessage">Pick a previous commit message</a>
        </div>
        <label for="message">Commit message</label>
        <textarea id="message" rows="3" placeholder="Message (press Ctrl+Enter to commit)"></textarea>
        <button id="commit" class="button-primary">Commit</button>
        <div class="float-right">
          <button id="cancel" class="button button-outline">Cancel</button>
        </div>
      </fieldset>
    </form>
  </section>
  <script>
    const vscode = acquireVsCodeApi();

    const txtMessage = document.getElementById("message");
    const btnCommit = document.getElementById("commit");
    const btnCancel = document.getElementById("cancel");
    const linkPickCommitMessage = document.getElementById("pickCommitMessage");

    // load current message
    txtMessage.value = ${JSON.stringify(message)};

    btnCommit.addEventListener("click", function() {
      vscode.postMessage({
        command: "commit",
        message: txtMessage.value
      });
    });

    btnCancel.addEventListener("click", function() {
      vscode.postMessage({
        command: "cancel"
      });
    });

    // Allow CTRL + Enter
    txtMessage.addEventListener("keydown", function(e) {
      if (event.ctrlKey && event.keyCode === 13) {
        btnCommit.click();
      }
    });

    // Auto resize the height of message
    txtMessage.addEventListener("input", function(e) {
      txtMessage.style.height = "auto";
      txtMessage.style.height = (txtMessage.scrollHeight) + "px";
    });

    window.addEventListener("load", function() {
      setTimeout(() => {
        txtMessage.focus();
      }, 1000);
    });

    linkPickCommitMessage.addEventListener("click", function() {
      vscode.postMessage({
        command: "pickCommitMessage"
      });
    });

    // Message from VSCode
    window.addEventListener("message", function(event) {
      const message = event.data;
      switch (message.command) {
        case "setMessage":
          txtMessage.value = message.message;
          txtMessage.dispatchEvent(new Event("input"));
          break;
      }
    });
  </script>
</body>
</html>`;
            panel.webview.html = html;
            // On close
            panel.onDidDispose(() => {
                resolve(undefined);
            });
            const pickCommitMessage = () => __awaiter(this, void 0, void 0, function* () {
                let repository;
                if (filePaths && filePaths[0]) {
                    const model = (yield vscode_1.commands.executeCommand("svn.getModel", ""));
                    repository = yield model.getRepositoryFromUri(vscode_1.Uri.file(filePaths[0]));
                }
                const message = yield vscode_1.commands.executeCommand("svn.pickCommitMessage", repository);
                if (message !== undefined) {
                    panel.webview.postMessage({
                        command: "setMessage",
                        message
                    });
                }
            });
            // On button click
            panel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case "commit":
                        resolve(message.message);
                        panel.dispose();
                        break;
                    case "pickCommitMessage":
                        pickCommitMessage();
                        break;
                    default:
                        resolve(undefined);
                        panel.dispose();
                }
            });
            // Force show and activate
            panel.reveal(vscode_1.ViewColumn.Active, false);
        });
        return yield promise;
    });
}
function inputCommitMessage(message, promptNew = true, filePaths) {
    return __awaiter(this, void 0, void 0, function* () {
        if (promptNew) {
            message = yield showCommitInput(message, filePaths);
        }
        if (message === "") {
            const allowEmpty = yield vscode_1.window.showWarningMessage("Do you really want to commit an empty message?", { modal: true }, "Yes");
            if (allowEmpty === "Yes") {
                return "";
            }
            else {
                return undefined;
            }
        }
        return message;
    });
}
exports.inputCommitMessage = inputCommitMessage;
//# sourceMappingURL=messages.js.map