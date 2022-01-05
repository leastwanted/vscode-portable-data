"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = exports.activateServer = void 0;
const vscode = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const dataUriTextDocumentContentProvider_1 = require("./dataUriTextDocumentContentProvider");
const gltf_import_export_1 = require("gltf-import-export");
const gltfActionProvider_1 = require("./gltfActionProvider");
const GltfValidate = require("./validationProvider");
const path = require("path");
const Url = require("url");
const fs = require("fs");
const utilities_1 = require("./utilities");
const gltfWindow_1 = require("./gltfWindow");
function checkValidEditor(textEditor) {
    if (textEditor === undefined) {
        vscode.window.showErrorMessage('Document too large (or no editor selected). ' +
            'Click \'More info\' for details via GitHub.', 'More info').then(choice => {
            if (choice === 'More info') {
                let uri = vscode.Uri.parse('https://github.com/AnalyticalGraphicsInc/gltf-vscode/blob/master/README.md#compatibiliy-and-known-size-limitations');
                vscode.commands.executeCommand('vscode.open', uri);
            }
        });
        return false;
    }
    return true;
}
function pointerContains(pointer, selection, textEditor) {
    const doc = textEditor.document;
    const range = new vscode.Range(doc.positionAt(pointer.value.pos), doc.positionAt(pointer.valueEnd.pos));
    return range.contains(selection);
}
function tryGetJsonMap(textEditor) {
    try {
        return (0, utilities_1.parseJsonMap)(textEditor.document.getText());
    }
    catch (ex) {
        vscode.window.showErrorMessage('Error parsing this document.  Please make sure it is valid JSON.');
    }
    return undefined;
}
function tryGetCurrentJsonPointer(map, textEditor) {
    const selection = textEditor.selection;
    const pointers = map.pointers;
    let bestKey, secondBestKey;
    for (let key of Object.keys(pointers)) {
        let pointer = pointers[key];
        if (pointerContains(pointer, selection, textEditor)) {
            secondBestKey = bestKey;
            bestKey = key;
        }
    }
    if (!bestKey) {
        vscode.window.showErrorMessage('Please click on an embedded data item, and try this command again.');
        return undefined;
    }
    if (secondBestKey && bestKey.endsWith('/uri')) {
        bestKey = secondBestKey;
    }
    return bestKey;
}
function configurationChanged() {
    const config = vscode.workspace.getConfiguration('glTF');
    const showToolbar3D = config.get('showToolbar3D');
    vscode.commands.executeCommand('setContext', 'gltfShowToolbar3D', showToolbar3D);
}
// This method activates the language server, to run the glTF Validator.
function activateServer(context) {
    // The server is implemented in node
    let serverModule = context.asAbsolutePath(path.join('server', 'server.js'));
    // The debug options for the server
    let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
    // If the extension is launched in debug mode then the debug server options are used
    // Otherwise the run options are used
    let serverOptions = {
        run: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc },
        debug: { module: serverModule, transport: vscode_languageclient_1.TransportKind.ipc, options: debugOptions }
    };
    // Options to control the language client
    let clientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'json' }],
        synchronize: {
            // Synchronize the setting section 'glTF' to the server
            configurationSection: 'glTF',
            // Notify the server about file changes to '.clientrc files contain in the workspace
            fileEvents: vscode.workspace.createFileSystemWatcher('**/.clientrc')
        }
    };
    // Create the language client and start the client.
    let disposable = new vscode_languageclient_1.LanguageClient('gltfLanguageServer', 'glTF Language Server', serverOptions, clientOptions).start();
    // Push the disposable to the context's subscriptions so that the
    // client can be deactivated on extension deactivation
    context.subscriptions.push(disposable);
}
exports.activateServer = activateServer;
// this method is called when your extension is activated
// your extension is activated the very first time a command is executed
function activate(context) {
    // Set configuration options
    vscode.workspace.onDidChangeConfiguration(configurationChanged);
    configurationChanged();
    // Activate the validation server.
    activateServer(context);
    // Create the window object that manages the various views.
    const gltfWindow = new gltfWindow_1.GltfWindow(context);
    // Register a preview for dataURIs in the glTF file.
    const dataPreviewProvider = new dataUriTextDocumentContentProvider_1.DataUriTextDocumentContentProvider(context);
    const dataPreviewRegistration = vscode.workspace.registerTextDocumentContentProvider('gltf-dataUri', dataPreviewProvider);
    context.subscriptions.push(dataPreviewRegistration);
    // Commands are registered in 2 to 3 places in the package.json file:
    // activationEvents, contributes.commands, and optionally contributes.keybindings.
    // Also, note two different kinds: 'registerCommand' vs. 'registerTextEditorCommand'.
    // The latter includes the selected editor and an edit context as the first 2 args.
    //
    // Inspect the contents of the current json pointer in the glTF.
    //
    context.subscriptions.push(vscode.commands.registerCommand('gltf.inspectData', async () => {
        const textEditor = vscode.window.activeTextEditor;
        if (!checkValidEditor(textEditor)) {
            return;
        }
        const map = tryGetJsonMap(textEditor);
        if (!map) {
            return;
        }
        let jsonPointer = tryGetCurrentJsonPointer(map, textEditor);
        if (!jsonPointer) {
            return;
        }
        const notDataUri = dataPreviewProvider.uriIfNotDataUri(map.data, jsonPointer);
        const isShader = dataPreviewProvider.isShader(jsonPointer);
        const isImage = dataPreviewProvider.isImage(jsonPointer);
        const isAccessor = dataPreviewProvider.isAccessor(jsonPointer);
        const isMeshPrimitive = dataPreviewProvider.isMeshPrimitive(jsonPointer);
        if (!isImage && !isShader && !isAccessor && !isMeshPrimitive) {
            vscode.window.showErrorMessage('This feature currently works only with accessors, images, shaders, and mesh primitives.');
            console.log('gltf-vscode: No preview for: ' + jsonPointer);
            return;
        }
        const fileName = textEditor.document.fileName;
        if (isAccessor) {
            jsonPointer = (0, utilities_1.truncateJsonPointer)(jsonPointer, 2);
            gltfWindow.inspectData.showAccessor(fileName, map.data, jsonPointer);
            return;
        }
        if (isMeshPrimitive) {
            jsonPointer = (0, utilities_1.truncateJsonPointer)(jsonPointer, 4);
            gltfWindow.inspectData.showMeshPrimitive(fileName, map.data, jsonPointer);
            return;
        }
        if (notDataUri && !isImage) {
            let finalUri = vscode.Uri.file(Url.resolve(fileName, notDataUri));
            await vscode.commands.executeCommand('vscode.open', finalUri, vscode.ViewColumn.Two);
        }
        else {
            // This is a data: type uri
            if (isShader) {
                jsonPointer += '.glsl';
            }
            const previewUri = vscode.Uri.parse(`${dataPreviewProvider.UriPrefix}${jsonPointer}?viewColumn=${vscode.ViewColumn.Two}#${encodeURIComponent(fileName)}`);
            await vscode.commands.executeCommand('vscode.open', previewUri, vscode.ViewColumn.Two);
            dataPreviewProvider.update(previewUri);
        }
    }));
    // Used by a TreeItem to change the behavior of expand and collapse.
    context.subscriptions.push(vscode.commands.registerCommand('gltf.noop', () => { }));
    //
    // Import a filename URI into a dataURI.
    //
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('gltf.importUri', (textEditor, edit) => {
        if (!checkValidEditor(textEditor)) {
            return;
        }
        const map = tryGetJsonMap(textEditor);
        if (!map) {
            return;
        }
        let bestKey = tryGetCurrentJsonPointer(map, textEditor);
        if (!bestKey) {
            return;
        }
        const data = (0, utilities_1.getFromJsonPointer)(map.data, bestKey);
        let dataUri = data.uri;
        if (dataUri.startsWith('data:')) {
            vscode.window.showWarningMessage('This field is already a dataURI.');
        }
        else {
            // Not a DataURI: Look up external reference.
            const name = Url.resolve(textEditor.document.fileName, dataUri);
            let contents;
            try {
                contents = fs.readFileSync(name);
            }
            catch (ex) {
                vscode.window.showErrorMessage('Can\'t read file: ' + name);
                return;
            }
            dataUri = 'data:' + (0, utilities_1.guessMimeType)(name) + ';base64,' + (0, utilities_1.btoa)(contents);
            const pointer = map.pointers[bestKey + '/uri'];
            edit.replace(new vscode.Range(pointer.value.line, pointer.value.column + 1, pointer.valueEnd.line, pointer.valueEnd.column - 1), dataUri);
        }
    }));
    //
    // Export a Data URI to a file.
    //
    function exportToFile(filename, pathFilename, pointer, dataUri, textEditor) {
        const pos = dataUri.indexOf(',');
        const fileContents = Buffer.from(dataUri.substring(pos + 1), 'base64');
        try {
            fs.writeFileSync(pathFilename, fileContents);
        }
        catch (ex) {
            vscode.window.showErrorMessage('Can\'t write file: ' + pathFilename);
            return;
        }
        textEditor.edit(editBuilder => {
            editBuilder.replace(new vscode.Range(pointer.value.line, pointer.value.column + 1, pointer.valueEnd.line, pointer.valueEnd.column - 1), filename);
        });
        vscode.window.showInformationMessage('File saved: ' + pathFilename);
    }
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('gltf.exportUri', async (textEditor
    // Because this is async, we can't trust the TextEditorEdit to stick around long enough.
    ) => {
        if (!checkValidEditor(textEditor)) {
            return;
        }
        const map = tryGetJsonMap(textEditor);
        if (!map) {
            return;
        }
        let bestKey = tryGetCurrentJsonPointer(map, textEditor);
        if (!bestKey) {
            return;
        }
        const data = (0, utilities_1.getFromJsonPointer)(map.data, bestKey);
        let dataUri = data.uri;
        if (!dataUri.startsWith('data:')) {
            vscode.window.showWarningMessage('This field is not a dataURI.');
        }
        else {
            let guessName = 'Texture';
            if (data.name) {
                guessName = data.name;
            }
            const mimeTypePos = dataUri.indexOf(';');
            let extension;
            let mimeType = '';
            if (mimeTypePos > 0) {
                mimeType = dataUri.substring(5, mimeTypePos);
                extension = (0, utilities_1.guessFileExtension)(mimeType);
                guessName += extension;
            }
            let pathGuessName = path.join(path.dirname(textEditor.document.fileName), guessName);
            const pointer = map.pointers[bestKey + '/uri'];
            if (!vscode.workspace.getConfiguration('glTF').get('alwaysOverwriteDefaultFilename')) {
                let options = {
                    defaultUri: vscode.Uri.file(pathGuessName),
                    filters: {
                        'All files': ['*']
                    }
                };
                options.filters[mimeType] = [extension.replace('.', '')];
                let uri = await vscode.window.showSaveDialog(options);
                if (uri) {
                    let filename = uri.fsPath;
                    if (extension && filename.indexOf('.') < 0) {
                        filename += extension;
                    }
                    exportToFile(path.basename(filename), filename, pointer, dataUri, textEditor);
                }
            }
            else {
                // File may exist, but user says it's OK to overwrite.
                exportToFile(guessName, pathGuessName, pointer, dataUri, textEditor);
            }
        }
    }));
    //
    // Export the whole file and its dependencies to a binary GLB file.
    //
    context.subscriptions.push(vscode.commands.registerCommand('gltf.exportGlbFile', async (fileUri) => {
        const textEditor = vscode.window.activeTextEditor;
        let gltfContent;
        if (textEditor &&
            ((!fileUri) || !(fileUri instanceof vscode.Uri) || fileUri.fsPath === textEditor.document.uri.fsPath)) {
            // textEditor is valid, fileUri is either matching the editor or invalid.
            fileUri = textEditor.document.uri;
            gltfContent = textEditor.document.getText();
        }
        else {
            // Text file to export will need loading.
            if ((!fileUri) || !(fileUri instanceof vscode.Uri)) {
                // fileUri appears invalid, ask the user for a better one.
                const options = {
                    canSelectMany: false,
                    openLabel: 'Convert to GLB',
                    filters: {
                        'Text glTF': ['gltf'],
                        'All files': ['*']
                    }
                };
                let openUri = await vscode.window.showOpenDialog(options);
                if (openUri && openUri[0]) {
                    fileUri = openUri[0];
                }
                else {
                    return;
                }
            }
            // Load the JSON text from disk.
            try {
                if (!fs.existsSync(fileUri.fsPath)) {
                    throw new Error('File not found.');
                }
                gltfContent = fs.readFileSync(fileUri.fsPath).toString();
            }
            catch (ex) {
                vscode.window.showErrorMessage('Can\'t read file: ' + fileUri.fsPath);
                return;
            }
        }
        let gltf;
        try {
            gltf = JSON.parse(gltfContent);
        }
        catch (ex) {
            vscode.window.showErrorMessage(ex.toString());
            return;
        }
        if (!gltf || !gltf.asset || !gltf.asset.version || gltf.asset.version[0] !== '2') {
            vscode.window.showErrorMessage('Error: Only glTF 2.0 is supported for GLB export.');
            return;
        }
        let glbPath = fileUri.fsPath.replace('.gltf', '.glb');
        if (!vscode.workspace.getConfiguration('glTF').get('alwaysOverwriteDefaultFilename')) {
            const options = {
                defaultUri: vscode.Uri.file(glbPath),
                filters: {
                    'Binary glTF': ['glb'],
                    'All files': ['*']
                }
            };
            let uri = await vscode.window.showSaveDialog(options);
            if (uri !== undefined) {
                try {
                    (0, gltf_import_export_1.ConvertToGLB)(gltf, fileUri.fsPath, uri.fsPath);
                    vscode.window.showInformationMessage('Glb exported as: ' + uri.fsPath);
                }
                catch (ex) {
                    vscode.window.showErrorMessage(ex.toString());
                }
            }
        }
        else {
            try {
                (0, gltf_import_export_1.ConvertToGLB)(gltf, fileUri.fsPath, glbPath);
                vscode.window.showInformationMessage('Glb exported as: ' + glbPath);
            }
            catch (ex) {
                vscode.window.showErrorMessage(ex.toString());
            }
        }
    }));
    //
    // Preview a glTF model.
    //
    context.subscriptions.push(vscode.commands.registerCommand('gltf.previewModel', () => {
        const textEditor = vscode.window.activeTextEditor;
        if (!checkValidEditor(textEditor)) {
            return;
        }
        gltfWindow.preview.openPanel(textEditor);
    }));
    //
    // Enable/Disable glTF debug mode.
    //
    context.subscriptions.push(vscode.commands.registerCommand('gltf.enableDebugMode', () => {
        if (gltfWindow.preview.activePanel) {
            gltfWindow.preview.activePanel.webview.postMessage({ command: 'enableDebugMode' });
        }
    }));
    context.subscriptions.push(vscode.commands.registerCommand('gltf.disableDebugMode', () => {
        if (gltfWindow.preview.activePanel) {
            gltfWindow.preview.activePanel.webview.postMessage({ command: 'disableDebugMode' });
        }
    }));
    //
    // Register glTF Tree View
    //
    context.subscriptions.push(vscode.commands.registerCommand('gltf.openGltfSelection', range => {
        gltfWindow.outline.select(range);
    }));
    //
    // Import of a GLB file and writing out its various chunks.
    //
    context.subscriptions.push(vscode.commands.registerCommand('gltf.importGlbFile', async (fileUri) => {
        if (typeof fileUri === 'undefined' || !(fileUri instanceof vscode.Uri) || !fileUri.fsPath.endsWith('.glb')) {
            if ((vscode.window.activeTextEditor !== undefined) &&
                (vscode.window.activeTextEditor.document.uri.fsPath.endsWith('.glb'))) {
                fileUri = vscode.window.activeTextEditor.document.uri;
            }
            else {
                const options = {
                    canSelectMany: false,
                    openLabel: 'Import',
                    filters: {
                        'Binary glTF': ['glb'],
                        'All files': ['*']
                    }
                };
                let openUri = await vscode.window.showOpenDialog(options);
                if (openUri && openUri[0]) {
                    fileUri = openUri[0];
                }
                else {
                    return;
                }
            }
        }
        try {
            if (typeof fileUri.fsPath === 'undefined') {
                return;
            }
            if (!fs.existsSync(fileUri.fsPath)) {
                throw new Error('File not found.');
            }
            let getTargetFilename = async () => {
                // Compose a target filename
                let targetFilename = fileUri.fsPath.replace('.glb', '.gltf');
                if (!vscode.workspace.getConfiguration('glTF').get('alwaysOverwriteDefaultFilename')) {
                    const options = {
                        defaultUri: vscode.Uri.file(targetFilename),
                        filters: {
                            'glTF': ['gltf'],
                            'All files': ['*']
                        }
                    };
                    let uri = await vscode.window.showSaveDialog(options);
                    if (!uri) {
                        return undefined;
                    }
                    targetFilename = uri.fsPath;
                }
                return targetFilename;
            };
            let targetFilename = await (0, gltf_import_export_1.ConvertGLBtoGltfLoadFirst)(fileUri.fsPath, getTargetFilename);
            if (targetFilename) {
                vscode.commands.executeCommand('vscode.open', vscode.Uri.file(targetFilename));
            }
        }
        catch (ex) {
            vscode.window.showErrorMessage(ex.toString());
        }
    }));
    //
    // Run the validator on an external file.
    //
    context.subscriptions.push(vscode.commands.registerCommand('gltf.validateFile', async (fileUri) => {
        if (typeof fileUri === 'undefined' || !(fileUri instanceof vscode.Uri) ||
            !(fileUri.fsPath.endsWith('.glb') || fileUri.fsPath.endsWith('.gltf'))) {
            const options = {
                canSelectMany: false,
                openLabel: 'Validate',
                filters: {
                    'glTF Files': ['gltf', 'glb'],
                    'All files': ['*']
                }
            };
            let openUri = await vscode.window.showOpenDialog(options);
            if (openUri && openUri[0]) {
                fileUri = openUri[0];
            }
            else {
                return;
            }
        }
        try {
            await GltfValidate.validate(fileUri.fsPath);
        }
        catch (ex) {
            vscode.window.showErrorMessage(ex.toString());
        }
    }));
    context.subscriptions.push(vscode.languages.registerCodeActionsProvider('json', new gltfActionProvider_1.GltfActionProvider(), {
        providedCodeActionKinds: gltfActionProvider_1.GltfActionProvider.providedCodeActionKinds
    }));
    //
    // Copy the currently-selected extension to "extensionsUsed".
    //
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('gltf.declareExtension', (textEditor, edit, diagnostic) => {
        if (!textEditor) {
            return;
        }
        const map = tryGetJsonMap(textEditor);
        if (!map) {
            return;
        }
        gltfActionProvider_1.GltfActionProvider.declareExtension(diagnostic, map, textEditor, edit);
    }));
    function getAnimationFromJsonPointer(glTF, jsonPointer) {
        let inAnimation = false;
        let inSampler = false;
        const jsonPointerSplit = jsonPointer.split('/');
        const numPointerSegments = Math.min(5, jsonPointerSplit.length);
        let result = glTF;
        let path = '';
        const firstValidIndex = 1; // Because the path has a leading slash.
        for (let i = firstValidIndex; i < numPointerSegments; ++i) {
            inAnimation = inAnimation || (jsonPointerSplit[i] === 'animations');
            inSampler = inAnimation && (inSampler || (jsonPointerSplit[i] === 'samplers'));
            result = result[jsonPointerSplit[i]];
            path += '/' + jsonPointerSplit[i];
        }
        if (!inSampler) {
            vscode.window.showErrorMessage('Please select an animation sampler to import.');
            result = undefined;
        }
        return { json: result, path: path };
    }
    //
    // Import an animation for editing.
    //
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('gltf.importAnimation', (textEditor, edit) => {
        if (!textEditor) {
            return;
        }
        const map = tryGetJsonMap(textEditor);
        if (!map) {
            return;
        }
        const bestKey = tryGetCurrentJsonPointer(map, textEditor);
        if (!bestKey) {
            return;
        }
        const glTF = map.data;
        const animationPointer = getAnimationFromJsonPointer(glTF, bestKey);
        if (!animationPointer.json) {
            return;
        }
        animationPointer.json.extras = animationPointer.json.extras || {};
        for (const key of ['input', 'output']) {
            const accessorId = animationPointer.json[key];
            const accessor = glTF.accessors[accessorId];
            let data = [];
            if (accessor !== undefined) {
                data = (0, utilities_1.getAccessorData)(textEditor.document.fileName, glTF, accessor);
            }
            animationPointer.json.extras[`vscode_gltf_${key}`] = Array.from(data);
            animationPointer.json.extras['vscode_gltf_type'] = accessor ? accessor.type : 'SCALAR';
        }
        const pointer = map.pointers[animationPointer.path];
        const tabSize = textEditor.options.tabSize;
        const space = textEditor.options.insertSpaces ? (new Array(tabSize + 1).join(' ')) : '\t';
        let newJson = JSON.stringify(animationPointer.json, null, space);
        const newJsonLines = newJson.split(/\n/);
        const fullTab = new Array(5).join(space);
        for (let i = 1; i < newJsonLines.length; i++) {
            newJsonLines[i] = fullTab + newJsonLines[i];
        }
        newJson = newJsonLines.join('\n');
        const newRange = new vscode.Range(pointer.value.line, pointer.value.column, pointer.valueEnd.line, pointer.valueEnd.column);
        edit.replace(newRange, newJson);
    }));
    //
    // Export an editable animation.
    //
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('gltf.exportAnimation', (textEditor, edit) => {
        if (!textEditor) {
            return;
        }
        const map = tryGetJsonMap(textEditor);
        if (!map) {
            return;
        }
        let bestKey = tryGetCurrentJsonPointer(map, textEditor);
        if (!bestKey) {
            return;
        }
        const glTF = map.data;
        const animationPointer = getAnimationFromJsonPointer(map.data, bestKey);
        if (!animationPointer.json ||
            !animationPointer.json.extras ||
            !animationPointer.json.extras.vscode_gltf_type ||
            !animationPointer.json.extras.vscode_gltf_input ||
            !animationPointer.json.extras.vscode_gltf_output) {
            vscode.window.showErrorMessage('Please select an animation sampler with vscode_gltf extras.');
            return;
        }
        const samplerType = animationPointer.json.extras.vscode_gltf_type;
        const components = utilities_1.AccessorTypeToNumComponents[samplerType];
        let entriesPerComponent = animationPointer.json.interpolation === 'CUBICSPLINE' ? 3 : 1;
        // Check if this is a multi-target morph animation.
        const animationIndex = +animationPointer.path.split('/')[2];
        const outerAnimation = glTF.animations[animationIndex];
        if (outerAnimation.channels && outerAnimation.channels[0]) {
            const firstChannel = outerAnimation.channels[0];
            if (firstChannel.target && firstChannel.target.path === 'weights') {
                const animatedNode = glTF.nodes[firstChannel.target.node];
                const animatedMesh = glTF.meshes[animatedNode.mesh];
                const numTargets = animatedMesh.primitives[0].targets.length;
                entriesPerComponent *= numTargets;
            }
        }
        const newData = {
            input: animationPointer.json.extras.vscode_gltf_input,
            output: animationPointer.json.extras.vscode_gltf_output
        };
        if ((newData.input.length * components * entriesPerComponent) !== newData.output.length) {
            vscode.window.showErrorMessage(`Number of input values (${newData.input.length}) does not equal output values (${newData.output.length / components / entriesPerComponent}).`);
            return;
        }
        delete animationPointer.json.extras.vscode_gltf_type;
        delete animationPointer.json.extras.vscode_gltf_input;
        delete animationPointer.json.extras.vscode_gltf_output;
        if (Object.keys(animationPointer.json.extras).length === 0) {
            delete animationPointer.json.extras;
        }
        const inputAccessor = glTF.accessors[animationPointer.json.input];
        let bufferIndex = 0;
        if (inputAccessor !== undefined) {
            const bufferView = glTF.bufferViews[inputAccessor.bufferView];
            bufferIndex = bufferView.buffer;
        }
        const bufferJson = glTF.buffers[bufferIndex];
        const bufferData = (0, gltf_import_export_1.getBuffer)(glTF, bufferIndex, textEditor.document.fileName);
        const alignedLength = (value) => {
            const alignValue = 4;
            if (value === 0) {
                return value;
            }
            const multiple = value % alignValue;
            if (multiple === 0) {
                return value;
            }
            return value + (alignValue - multiple);
        };
        let bufferOffset = alignedLength(bufferData.length);
        const outputBuffers = [bufferData];
        if (bufferOffset !== bufferData.length) {
            outputBuffers.push(new Buffer(bufferOffset - bufferData.length));
        }
        for (const accessorType of ['input', 'output']) {
            const values = newData[accessorType];
            const accessorComponents = accessorType === 'input' ? 1 : components;
            const max = new Array(accessorComponents).fill(Number.NEGATIVE_INFINITY);
            for (let i = 0; i < values.length; i++) {
                const j = i % accessorComponents;
                max[j] = Math.max(max[j], values[i]);
            }
            const min = new Array(accessorComponents).fill(Number.POSITIVE_INFINITY);
            for (let i = 0; i < values.length; i++) {
                const j = i % accessorComponents;
                min[j] = Math.min(min[j], values[i]);
            }
            const float32Values = Float32Array.from(values);
            const accessor = {
                "bufferView": glTF.bufferViews.length,
                "componentType": 5126,
                "count": values.length / accessorComponents,
                "type": accessorType === 'input' ? 'SCALAR' : samplerType,
                "max": max,
                "min": min
            };
            const accessorId = animationPointer.json[accessorType];
            if (glTF.accessors[accessorId] === undefined) {
                animationPointer.json[accessorType] = glTF.accessors.length;
                glTF.accessors.push(accessor);
            }
            else {
                glTF.accessors[accessorId] = accessor;
            }
            const newBufferView = {
                "buffer": bufferIndex,
                "byteOffset": bufferOffset,
                "byteLength": float32Values.byteLength,
            };
            glTF.bufferViews.push(newBufferView);
            if (alignedLength(float32Values.byteLength) !== float32Values.byteLength) {
                throw new Error('Float32Array not 4 byte length');
            }
            bufferOffset += float32Values.byteLength;
            outputBuffers.push(Buffer.from(float32Values.buffer));
        }
        const finalBuffer = Buffer.concat(outputBuffers);
        bufferJson.uri = 'data:application/octet-stream;base64,' + finalBuffer.toString('base64');
        bufferJson.byteLength = finalBuffer.length;
        const tabSize = textEditor.options.tabSize;
        const space = textEditor.options.insertSpaces ? (new Array(tabSize + 1).join(' ')) : '\t';
        const newJson = JSON.stringify(glTF, null, space);
        const newRange = new vscode.Range(0, 0, textEditor.document.lineCount + 1, 0);
        edit.replace(newRange, newJson);
        const newMap = tryGetJsonMap(textEditor);
        const newPointer = newMap.pointers[animationPointer.path];
        textEditor.selection = new vscode.Selection(newPointer.value.line, space.length * 5, newPointer.value.line, space.length * 5);
    }));
}
exports.activate = activate;
// This method is called when your extension is deactivated.
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map