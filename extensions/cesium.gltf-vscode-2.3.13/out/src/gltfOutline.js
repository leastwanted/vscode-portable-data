"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GltfOutline = void 0;
const vscode = require("vscode");
const path = require("path");
const fs = require("fs");
const Url = require("url");
const jsonMap = require("json-source-map");
const sprintf_js_1 = require("sprintf-js");
const utilities_1 = require("./utilities");
const knownTextureExtensions = [
    'KHR_texture_basisu',
    // DDS and WebP are not officially supported by this VSCode extension, but
    // naming them here will help to compute the correct asset size breakdown.
    'EXT_texture_webp',
    'MSFT_texture_dds'
];
class GltfOutline {
    constructor(context, gltfWindow) {
        this.context = context;
        this.gltfWindow = gltfWindow;
        this.skinMap = new Map(); // jointId (nodeId) to Set of skinIds
        this.skeletonMap = new Map(); // nodeId (skeleton) to Set of skinIds
        this.selectedList = new Set();
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.pauseUpdate = false;
        this.gltfWindow.onDidChangeActiveTextEditor(() => {
            this.tryParseTreeAndNotify();
        });
        vscode.window.onDidChangeTextEditorSelection(() => {
            this.fillSelectedList();
            if (!this.pauseUpdate && vscode.workspace.getConfiguration('glTF').get('expandOutlineWithSelection')) {
                this._onDidChangeTreeData.fire(undefined);
            }
            this.pauseUpdate = false;
        });
        vscode.workspace.onDidChangeTextDocument(() => {
            this.tryParseTreeAndNotify();
        });
        this.tryParseTreeAndNotify();
    }
    getTreeItem(node) {
        let treeState = vscode.TreeItemCollapsibleState.None;
        if (node.children.length > 0) {
            treeState = !this.selectedList.has(node) ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.Expanded;
        }
        let name = node.name;
        if (node.size !== undefined) {
            if (node.size < 1024) {
                name += ` ${node.size}B`;
            }
            else if (node.size > 1024 && node.size < (1024 * 1024)) {
                name += (0, sprintf_js_1.sprintf)(' %0.1fKB', node.size / 1024);
            }
            else {
                name += (0, sprintf_js_1.sprintf)(' %0.1fMB', node.size / (1024 * 1024));
            }
        }
        let treeItem = new vscode.TreeItem(name, treeState);
        if (node.range !== undefined) {
            treeItem.command = {
                command: 'gltf.openGltfSelection',
                title: '',
                arguments: [node.range]
            };
        }
        treeItem.iconPath = this.getIcon(node.type);
        treeItem.contextValue = node.type;
        return treeItem;
    }
    getChildren(node) {
        if (node) {
            return node.children;
        }
        return this.tree ? this.tree.children : [];
    }
    select(range) {
        this.pauseUpdate = true;
        this.editor.selection = new vscode.Selection(range.start, range.end);
        this.editor.revealRange(range, vscode.TextEditorRevealType.InCenterIfOutsideViewport);
    }
    walkTree(node, callback) {
        callback(node);
        for (let child of node.children) {
            this.walkTree(child, callback);
        }
    }
    fillSelectedList() {
        this.selectedList.clear();
        if (this.tree && vscode.workspace.getConfiguration('glTF').get('expandOutlineWithSelection')) {
            for (let selection of this.editor.selections) {
                this.walkTree(this.tree, (node) => {
                    if (node.range && node.range.contains(selection)) {
                        do {
                            this.selectedList.add(node);
                            node = node.parent;
                        } while (node !== undefined);
                    }
                });
            }
        }
    }
    parseTree() {
        this.tree = null;
        this.gltf = null;
        this.pointers = null;
        this.editor = this.gltfWindow.activeTextEditor;
        if (this.editor) {
            let mapResult = jsonMap.parse(this.editor.document.getText());
            this.gltf = mapResult.data;
            this.pointers = mapResult.pointers;
            if (this.gltf && this.gltf.asset && this.gltf.asset.version) {
                if (this.gltf.asset.version[0] !== '2') {
                    this.gltf = null;
                }
            }
            else {
                this.gltf = null;
            }
        }
        if (!this.gltf) {
            return;
        }
        this.skinMap.clear();
        this.skeletonMap.clear();
        if (this.gltf && this.gltf.skins) {
            for (let skinIndex = 0; skinIndex < this.gltf.skins.length; skinIndex++) {
                let skin = this.gltf.skins[skinIndex];
                this.populateSkinMap(skinIndex, skin);
            }
        }
        this.tree = {
            name: "Root",
            children: [],
            type: 'root',
            range: new vscode.Range(this.editor.document.positionAt(this.pointers[''].value.pos), this.editor.document.positionAt(this.pointers[''].valueEnd.pos))
        };
        if (this.gltf) {
            this.createAsset(this.tree);
            if (this.gltf.scenes) {
                for (let sceneIndex = 0; sceneIndex < this.gltf.scenes.length; sceneIndex++) {
                    let scene = this.gltf.scenes[sceneIndex];
                    this.createScene(scene, sceneIndex, this.tree);
                }
            }
        }
        this.fillSelectedList();
    }
    tryParseTreeAndNotify() {
        try {
            this.parseTree();
        }
        catch (ex) {
            this.tree = null;
            this.gltf = null;
            this.pointers = null;
            console.log("Can't parse glTF into tree: " + ex.toString());
        }
        this._onDidChangeTreeData.fire(undefined);
    }
    populateSkinMap(skinIndex, skin) {
        if (!this.skeletonMap.has(skin.skeleton)) {
            this.skeletonMap.set(skin.skeleton, new Set());
        }
        this.skeletonMap.get(skin.skeleton).add(skinIndex.toString());
        for (let joint of skin.joints) {
            if (!this.skinMap.has(joint)) {
                this.skinMap.set(joint, new Set());
            }
            this.skinMap.get(joint).add(skinIndex.toString());
        }
    }
    formatVertices(vertices) {
        if (vertices < 1000) {
            return vertices.toString();
        }
        return (0, sprintf_js_1.sprintf)('%0.1fK', vertices / 1000);
    }
    createAsset(parent) {
        let assetPointer = this.pointers[''];
        let assetObj = {
            name: 'Asset',
            children: [],
            type: 'node',
            parent: parent
        };
        parent.children.push(assetObj);
        let totalSize = this.editor.document.getText().length;
        if (this.gltf.buffers && this.gltf.buffers.length > 0) {
            for (let buffer of this.gltf.buffers) {
                totalSize += buffer.byteLength;
            }
        }
        if (this.gltf.meshes && this.gltf.meshes.length > 0) {
            let meshesPointer = this.pointers['/meshes'];
            let meshesObj = {
                name: 'Meshes',
                children: [],
                type: 'node',
                parent: assetPointer,
                size: 0,
                range: new vscode.Range(this.editor.document.positionAt(meshesPointer.value.pos), this.editor.document.positionAt(meshesPointer.valueEnd.pos))
            };
            assetObj.children.push(meshesObj);
            let vertices = 0;
            for (let index = 0; index < this.gltf.meshes.length; index++) {
                let sizeInfo = this.createMesh(index.toString(), undefined, meshesObj, true);
                meshesObj.size += sizeInfo.size;
                vertices += sizeInfo.vertices;
            }
            meshesObj.name += ` (${this.formatVertices(vertices)} vertices)`;
        }
        if (this.gltf.animations && this.gltf.animations.length > 0) {
            let animationsPointer = this.pointers['/animations'];
            let animationObj = {
                name: 'Animations',
                children: [],
                type: 'node',
                parent: assetPointer,
                size: 0,
                range: new vscode.Range(this.editor.document.positionAt(animationsPointer.value.pos), this.editor.document.positionAt(animationsPointer.valueEnd.pos))
            };
            assetObj.children.push(animationObj);
            for (let index = 0; index < this.gltf.animations.length; index++) {
                animationObj.size += this.createAnimation(index.toString(), animationObj);
            }
        }
        if (this.gltf.textures && this.gltf.textures.length > 0) {
            let texturePointer = this.pointers['/textures'];
            let textureObj = {
                name: 'Textures',
                children: [],
                type: 'node',
                parent: assetPointer,
                size: 0,
                range: new vscode.Range(this.editor.document.positionAt(texturePointer.value.pos), this.editor.document.positionAt(texturePointer.valueEnd.pos))
            };
            assetObj.children.push(textureObj);
            for (let index = 0; index < this.gltf.textures.length; index++) {
                textureObj.size += this.createTexture('Asset', { index: index.toString() }, textureObj, true) || 0;
            }
            totalSize += textureObj.size;
        }
        assetObj.size = totalSize;
        let otherSize = totalSize;
        for (let childObj of assetObj.children) {
            otherSize -= childObj.size;
        }
        if (otherSize > 0) {
            let otherObj = {
                name: 'Other',
                children: [],
                type: 'node',
                parent: assetPointer,
                size: otherSize
            };
            assetObj.children.push(otherObj);
        }
    }
    createAnimation(animationIndex, parent) {
        let animation = this.gltf.animations[animationIndex];
        let pointer = this.pointers['/animations/' + animationIndex];
        let animationObj = {
            name: this.createName('Animation', animationIndex, animation),
            children: [],
            type: 'animation',
            parent: parent,
            range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
        };
        parent.children.push(animationObj);
        let channelCount = animation.channels.length;
        let samplerSize = 0;
        for (let channel of animation.channels) {
            let sampler = animation.samplers[channel.sampler];
            samplerSize += this.sizeOfAccessor(sampler.input);
            samplerSize += this.sizeOfAccessor(sampler.output);
        }
        animationObj.name += ` (${channelCount} channels)`;
        animationObj.size = samplerSize;
        return samplerSize;
    }
    sizeOfAccessor(index) {
        let accessor = this.gltf.accessors[index];
        let numComponents = utilities_1.AccessorTypeToNumComponents[accessor.type];
        let sizeOfComponent = utilities_1.ComponentTypeToBytesPerElement[accessor.componentType];
        return numComponents * sizeOfComponent * accessor.count;
    }
    createScene(scene, sceneIndex, parent) {
        let pointer = this.pointers['/scenes/' + sceneIndex];
        let sceneObj = {
            name: this.createName('Scene', sceneIndex.toString(), scene),
            children: [],
            type: 'scene',
            parent: parent,
            range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
        };
        parent.children.push(sceneObj);
        if (scene.nodes) {
            for (let nodeSceneIndex = 0; nodeSceneIndex < scene.nodes.length; nodeSceneIndex++) {
                let nodeIndex = scene.nodes[nodeSceneIndex];
                let node = this.gltf.nodes[nodeIndex];
                this.createNode(node, nodeIndex, sceneObj);
            }
        }
    }
    createNode(node, nodeIndex, parent) {
        let pointer = this.pointers['/nodes/' + nodeIndex];
        let nodeObj = {
            name: this.createName('Node', nodeIndex, node) + this.skinsName(nodeIndex),
            children: [],
            type: this.skeletonMap.has(nodeIndex) ? 'skeleton' : this.skinMap.has(nodeIndex) ? 'skin' : 'node',
            parent: parent,
            range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
        };
        parent.children.push(nodeObj);
        if (node.mesh !== undefined) {
            this.createMesh(node.mesh, node.skin, nodeObj, false);
        }
        if (node.children) {
            for (let nodeChildrenIndex = 0; nodeChildrenIndex < node.children.length; nodeChildrenIndex++) {
                let childNodeIndex = node.children[nodeChildrenIndex];
                let childNode = this.gltf.nodes[childNodeIndex];
                this.createNode(childNode, childNodeIndex, nodeObj);
            }
        }
        this.createNodeAnimations(nodeIndex, nodeObj);
    }
    forEachAnimationChannel(callback) {
        if (this.gltf.animations === undefined) {
            return;
        }
        for (let animationIndex = 0; animationIndex < this.gltf.animations.length; animationIndex++) {
            let animation = this.gltf.animations[animationIndex];
            for (let channelIndex = 0; channelIndex < animation.channels.length; channelIndex++) {
                let target = animation.channels[channelIndex].target;
                callback(animationIndex, channelIndex, target);
            }
        }
    }
    createNodeAnimations(nodeIndex, parent) {
        this.forEachAnimationChannel((animationIndex, channelIndex, target) => {
            if (target.node === nodeIndex) {
                let pointerPath = '/animations/' + animationIndex.toString() + '/channels/' + channelIndex.toString();
                let pointer = this.pointers[pointerPath];
                let animation = this.gltf.animations[animationIndex];
                let name = this.createName(target.path + ' animation', `${animationIndex} ${channelIndex}`, animation);
                let animationObj = {
                    name: name,
                    children: [],
                    type: 'animation',
                    parent: parent,
                    range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
                };
                parent.children.push(animationObj);
            }
        });
    }
    createMesh(meshIndex, skinIndex, parent, assetReport) {
        let mesh = this.gltf.meshes[meshIndex];
        let name = this.createName('Mesh', meshIndex, mesh);
        if (skinIndex !== undefined) {
            name += ` (Skin ${skinIndex})`;
        }
        let pointer = this.pointers['/meshes/' + meshIndex];
        let meshObj = {
            name: name,
            children: [],
            type: 'mesh',
            parent: parent,
            range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
        };
        parent.children.push(meshObj);
        let meshInfo = {
            size: 0,
            vertices: 0
        };
        if (mesh.primitives) {
            for (let primitiveIndex = 0; primitiveIndex < mesh.primitives.length; primitiveIndex++) {
                let primitiveInfo = this.createMeshPrimitive(mesh, meshIndex, primitiveIndex.toString(), meshObj, assetReport);
                if (assetReport) {
                    meshInfo.size += primitiveInfo.size;
                    meshInfo.vertices += primitiveInfo.vertices;
                }
            }
        }
        if (assetReport) {
            meshObj.size = meshInfo.size;
            meshObj.name += ` (${this.formatVertices(meshInfo.vertices)} vertices)`;
            return meshInfo;
        }
        return undefined;
    }
    createMeshPrimitive(mesh, meshIndex, primitiveIndex, parent, assetReport) {
        let primitive = mesh.primitives[primitiveIndex];
        let name = this.createName('Primitive', primitiveIndex, primitive);
        let pointerPath = '/meshes/' + meshIndex + '/primitives/' + primitiveIndex;
        let pointer = this.pointers[pointerPath];
        let primitiveObj = {
            name: name,
            children: [],
            type: 'mesh',
            parent: parent,
            range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
        };
        parent.children.push(primitiveObj);
        let primitiveInfo = {
            size: 0,
            vertices: 0
        };
        if (primitive.targets) {
            let morphSize = this.createMorphTargets(primitive, pointerPath, primitiveObj, assetReport);
            if (assetReport) {
                primitiveInfo.size += morphSize;
            }
        }
        if (!assetReport) {
            this.createMaterial(primitive.material, primitiveObj);
            return undefined;
        }
        if (primitive.indices) {
            primitiveInfo.size += this.sizeOfAccessor(primitive.indices);
        }
        for (let attribute in primitive.attributes) {
            if (primitive.attributes.hasOwnProperty(attribute)) {
                primitiveInfo.size += this.sizeOfAccessor(primitive.attributes[attribute]);
            }
        }
        let posAccessor = primitive.attributes.POSITION;
        primitiveInfo.vertices += this.gltf.accessors[posAccessor].count;
        primitiveObj.size = primitiveInfo.size;
        primitiveObj.name += ` (${this.formatVertices(primitiveInfo.vertices)} vertices)`;
        return primitiveInfo;
    }
    createMorphTargets(primitive, pointerPath, parent, assetReport) {
        let size = 0;
        for (let morphTargetIndex = 0; morphTargetIndex < primitive.targets.length; morphTargetIndex++) {
            let targetPointerPath = pointerPath + '/targets/' + morphTargetIndex;
            let targetPointer = this.pointers[targetPointerPath];
            let targetObj = {
                name: `Morph Target ` + morphTargetIndex,
                children: [],
                type: 'mesh',
                parent: parent,
                range: new vscode.Range(this.editor.document.positionAt(targetPointer.value.pos), this.editor.document.positionAt(targetPointer.valueEnd.pos))
            };
            parent.children.push(targetObj);
            if (assetReport) {
                let targetSize = 0;
                let target = primitive.targets[morphTargetIndex];
                for (let attribute in target) {
                    if (target.hasOwnProperty(attribute)) {
                        targetSize += this.sizeOfAccessor(target[attribute]);
                    }
                }
                targetObj.size = targetSize;
                size += targetSize;
            }
        }
        if (assetReport) {
            return size;
        }
        return undefined;
    }
    createMaterial(materialIndex, parent) {
        if (materialIndex === undefined) {
            return;
        }
        let material = this.gltf.materials[materialIndex];
        let name = this.createName('Material', materialIndex, material);
        let pointerPath = '/materials/' + materialIndex;
        let pointer = this.pointers[pointerPath];
        let materialObj = {
            name: name,
            children: [],
            type: 'material',
            parent: parent,
            range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
        };
        parent.children.push(materialObj);
        this.createTexture('Base Color', material.baseColorTexture, materialObj);
        this.createTexture('Normal', material.normalTexture, materialObj);
        this.createTexture('Occlusion', material.occlusionTexture, materialObj);
        this.createTexture('Emissive', material.emissiveTexture, materialObj);
        if (material.pbrMetallicRoughness !== undefined) {
            this.createTexture('PBR Base Color', material.pbrMetallicRoughness.baseColorTexture, materialObj);
            this.createTexture('Metallic Roughness', material.pbrMetallicRoughness.metallicRoughnessTexture, materialObj);
        }
    }
    createTexture(typeName, textureIndex, parent, assetReport = false) {
        if (textureIndex === undefined) {
            return undefined;
        }
        let texture = this.gltf.textures[textureIndex.index];
        let imageIndex = texture.source;
        if (texture.extensions) {
            knownTextureExtensions.forEach(extensionName => {
                if (texture.extensions[extensionName] && texture.extensions[extensionName].source !== undefined) {
                    imageIndex = texture.extensions[extensionName].source;
                }
            });
        }
        if (imageIndex === undefined) {
            return undefined;
        }
        let name = this.createName(typeName + ' Texture', textureIndex.index, texture);
        let pointerPath = '/images/' + imageIndex;
        let pointer = this.pointers[pointerPath];
        let textureObj = {
            name: name,
            children: [],
            type: 'texture',
            parent: parent,
            range: new vscode.Range(this.editor.document.positionAt(pointer.value.pos), this.editor.document.positionAt(pointer.valueEnd.pos))
        };
        parent.children.push(textureObj);
        if (assetReport) {
            let size;
            let image = this.gltf.images[imageIndex];
            if (image.uri !== undefined) {
                if (image.uri.startsWith('data:')) {
                    size = image.uri.length * 0.75;
                }
                else {
                    const name = decodeURI(Url.resolve(this.editor.document.fileName, image.uri));
                    size = fs.statSync(name).size;
                }
            }
            else if (image.bufferView !== undefined) {
                size = this.gltf.bufferViews[image.bufferView].byteLength;
            }
            textureObj.size = size;
            return size;
        }
        return undefined;
    }
    createName(typeName, index, obj) {
        let name = `${typeName} ${index}`;
        if (obj && obj.name) {
            name = `${obj.name} (${name})`;
        }
        return name;
    }
    skinsName(index) {
        let set = new Set();
        if (this.skeletonMap.has(index)) {
            let skinIds = this.skeletonMap.get(index);
            for (let skinId of skinIds) {
                set.add(skinId);
            }
        }
        if (this.skinMap.has(index)) {
            let skinIds = this.skinMap.get(index);
            for (let skinId of skinIds) {
                set.add(skinId);
            }
        }
        if (set.size === 0) {
            return '';
        }
        return ` (Skin${set.size === 1 ? '' : 's'} ${Array.from(set.values()).join(', ')})`;
    }
    getIcon(nodeType) {
        if (nodeType === 'node' || nodeType === 'root') {
            return null;
        }
        return {
            light: this.context.asAbsolutePath(path.join('resources', 'light', nodeType + '.svg')),
            dark: this.context.asAbsolutePath(path.join('resources', 'dark', nodeType + '.svg'))
        };
    }
}
exports.GltfOutline = GltfOutline;
//# sourceMappingURL=gltfOutline.js.map