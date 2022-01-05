"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GltfInspectData = void 0;
const vscode = require("vscode");
const path = require("path");
const os = require("os");
const utilities_1 = require("./utilities");
const sprintf_js_1 = require("sprintf-js");
var NodeType;
(function (NodeType) {
    NodeType[NodeType["Header"] = 0] = "Header";
    NodeType[NodeType["Group"] = 1] = "Group";
    NodeType[NodeType["AccessorScalar"] = 2] = "AccessorScalar";
    NodeType[NodeType["AccessorVector"] = 3] = "AccessorVector";
    NodeType[NodeType["AccessorMatrix"] = 4] = "AccessorMatrix";
    NodeType[NodeType["AccessorMatrixRow"] = 5] = "AccessorMatrixRow";
    NodeType[NodeType["MatrixRow"] = 6] = "MatrixRow";
    NodeType[NodeType["Vertices"] = 7] = "Vertices";
    NodeType[NodeType["Vertex"] = 8] = "Vertex";
    NodeType[NodeType["VertexAttribute"] = 9] = "VertexAttribute";
    NodeType[NodeType["Triangles"] = 10] = "Triangles";
    NodeType[NodeType["Triangle"] = 11] = "Triangle";
    NodeType[NodeType["Lines"] = 12] = "Lines";
    NodeType[NodeType["Line"] = 13] = "Line";
    NodeType[NodeType["Points"] = 14] = "Points";
    NodeType[NodeType["Point"] = 15] = "Point";
})(NodeType || (NodeType = {}));
function isFloatAccessor(accessor) {
    return accessor.componentType === 5126 /* FLOAT */ || accessor.normalized;
}
function formatScalar(value, float) {
    return float ? (0, sprintf_js_1.sprintf)('%.5f', value) : `${value}`;
}
function formatVector(values, float) {
    return `[${values.map(value => formatScalar(value, float)).join(', ')}]`;
}
function formatMatrix(rows, float) {
    return rows.map(row => formatVector(row.values, float)).join(', ');
}
function groupNodes(nodes, groupSize) {
    if (nodes.length < groupSize) {
        return nodes;
    }
    const groupNodes = new Array();
    for (let startIndex = 0, endIndex = 0; startIndex < nodes.length; startIndex = endIndex) {
        endIndex = Math.min(startIndex + groupSize, nodes.length);
        groupNodes.push({
            type: NodeType.Group,
            label: `[${startIndex}..${endIndex}]`,
            startIndex: startIndex,
            endIndex: endIndex,
            nodes: nodes.slice(startIndex, endIndex)
        });
    }
    return groupNodes;
}
function getAccessorNodes(fileName, gltf, accessor) {
    const data = (0, utilities_1.getAccessorData)(fileName, gltf, accessor);
    if (!data) {
        throw new Error('Unable to get accessor data');
    }
    const nodes = new Array(accessor.count);
    for (let index = 0; index < nodes.length; index++) {
        nodes[index] = getAccessorElementNode(accessor, data, index);
    }
    return nodes;
}
function getAccessorElementNode(accessor, data, index) {
    const numComponents = utilities_1.AccessorTypeToNumComponents[accessor.type];
    const values = (0, utilities_1.getAccessorElement)(data, index, numComponents, accessor.componentType, accessor.normalized);
    const float = isFloatAccessor(accessor);
    switch (accessor.type) {
        case "SCALAR" /* SCALAR */: {
            const label = formatScalar(values[0], float);
            const tooltip = `${index}: ${label}`;
            return {
                type: NodeType.AccessorScalar,
                label: label,
                tooltip: tooltip,
                index: index,
                value: values[0]
            };
        }
        case "VEC2" /* VEC2 */:
        case "VEC3" /* VEC3 */:
        case "VEC4" /* VEC4 */: {
            const label = formatVector(values, isFloatAccessor(accessor));
            const tooltip = `${index}: ${label}`;
            return {
                type: NodeType.AccessorVector,
                label: label,
                tooltip: tooltip,
                index: index,
                float: float,
                values: values
            };
        }
        case "MAT2" /* MAT2 */:
        case "MAT3" /* MAT3 */:
        case "MAT4" /* MAT4 */: {
            const size = Math.sqrt(numComponents);
            const rows = [];
            for (let rowIndex = 0; rowIndex < size; rowIndex++) {
                const start = rowIndex * size;
                const end = start + size;
                const rowValues = values.slice(start, end);
                const rowLabel = formatVector(rowValues, float);
                const rowTooltip = `${rowIndex}: ${rowLabel}`;
                rows.push({
                    type: NodeType.AccessorMatrixRow,
                    label: rowLabel,
                    tooltip: rowTooltip,
                    index: rowIndex,
                    values: rowValues
                });
            }
            const label = formatMatrix(rows, float);
            const tooltip = `${index}: ${label}`;
            return {
                type: NodeType.AccessorMatrix,
                label: label,
                tooltip: tooltip,
                index: index,
                rows: rows
            };
        }
    }
    throw new Error(`Invalid accessor type: ${accessor.type}`);
}
function getVerticesNode(fileName, gltf, attributes) {
    const accessorInfo = {};
    let numVertices = 0;
    for (const attribute in attributes) {
        const accessor = gltf.accessors[attributes[attribute]];
        const data = accessor && (0, utilities_1.getAccessorData)(fileName, gltf, accessor);
        if (!data) {
            continue;
        }
        if (attribute === "POSITION") {
            numVertices = accessor.count;
        }
        accessorInfo[attribute] = {
            data: data,
            numComponents: utilities_1.AccessorTypeToNumComponents[accessor.type],
            accessor: accessor
        };
    }
    const nodes = new Array(numVertices);
    for (let index = 0; index < nodes.length; index++) {
        const attributeNodes = [];
        for (const attribute in attributes) {
            const info = accessorInfo[attribute];
            const values = (0, utilities_1.getAccessorElement)(info.data, index, info.numComponents, info.accessor.componentType, info.accessor.normalized);
            attributeNodes.push({
                type: NodeType.VertexAttribute,
                label: `${attribute}: ${formatVector(values, isFloatAccessor(info.accessor))}`,
                name: attribute,
                values: values
            });
        }
        nodes[index] = {
            type: NodeType.Vertex,
            label: `${index}`,
            index: index,
            attributeNodes: attributeNodes
        };
    }
    return {
        type: NodeType.Vertices,
        label: 'Vertices',
        numVertices: numVertices,
        nodes: nodes
    };
}
function getTriangleNodes(numVertices, mode, data) {
    const get = data ? (i) => data[i] : (i) => i;
    const length = data ? data.length : numVertices;
    let nodes;
    function setNode(index, vertices) {
        nodes[index] = {
            type: NodeType.Triangle,
            label: `${formatVector(vertices, false)}`,
            index: index,
            vertices: vertices
        };
    }
    switch (mode) {
        case 4 /* TRIANGLES */: {
            nodes = new Array(length / 3);
            for (let index = 0; index < nodes.length; index++) {
                setNode(index, [
                    get(index * 3),
                    get(index * 3 + 1),
                    get(index * 3 + 2)
                ]);
            }
            break;
        }
        case 6 /* TRIANGLE_FAN */: {
            nodes = new Array(length - 2);
            for (let index = 0; index < nodes.length; index++) {
                setNode(index, [
                    get(0),
                    get(index + 1),
                    get(index + 2)
                ]);
            }
            break;
        }
        case 5 /* TRIANGLE_STRIP */: {
            nodes = new Array(length - 2);
            for (let index = 0; index < nodes.length; index++) {
                const flip = (index & 1) === 1;
                setNode(index, [
                    get(flip ? index + 2 : index),
                    get(index + 1),
                    get(flip ? index : index + 2)
                ]);
            }
            break;
        }
    }
    return nodes;
}
function getLineNodes(numVertices, mode, data) {
    const get = data ? i => data[i] : i => i;
    const length = data ? data.length : numVertices;
    let nodes;
    function setNode(index, vertices) {
        nodes[index] = {
            type: NodeType.Line,
            label: `${formatVector(vertices, false)}`,
            index: index,
            vertices: vertices
        };
    }
    switch (mode) {
        case 1 /* LINES */: {
            nodes = new Array(length / 2);
            for (let index = 0; index < nodes.length; index++) {
                setNode(index, [
                    get(index * 2),
                    get(index * 2 + 1)
                ]);
            }
            break;
        }
        case 2 /* LINE_LOOP */:
        case 3 /* LINE_STRIP */: {
            nodes = new Array(mode === 2 /* LINE_LOOP */ ? length : length - 1);
            for (let index = 0; index < nodes.length; index++) {
                setNode(index, [
                    get(index),
                    get((index + 1) % length)
                ]);
            }
            break;
        }
    }
    return nodes;
}
function getPointNodes(numVertices, data) {
    const get = data ? i => data[i] : i => i;
    const nodes = new Array(data ? data.length : numVertices);
    for (let index = 0; index < nodes.length; index++) {
        nodes[index] = {
            type: NodeType.Point,
            label: `${index}`,
            index: index,
            vertex: get(index)
        };
    }
    return nodes;
}
function getIndicesNode(fileName, gltf, numVertices, mode, indices) {
    if (mode === undefined) {
        mode = 4 /* TRIANGLES */;
    }
    const accessor = indices !== undefined && gltf.accessors[indices];
    const data = accessor && (0, utilities_1.getAccessorData)(fileName, gltf, accessor);
    switch (mode) {
        case 4 /* TRIANGLES */:
        case 6 /* TRIANGLE_FAN */:
        case 5 /* TRIANGLE_STRIP */: {
            return {
                type: NodeType.Triangles,
                label: 'Triangles',
                nodes: getTriangleNodes(numVertices, mode, data)
            };
        }
        case 1 /* LINES */:
        case 2 /* LINE_LOOP */:
        case 3 /* LINE_STRIP */: {
            return {
                type: NodeType.Lines,
                label: 'Lines',
                nodes: getLineNodes(numVertices, mode, data)
            };
        }
        case 0 /* POINTS */: {
            return {
                type: NodeType.Points,
                label: 'Points',
                nodes: getPointNodes(numVertices, data)
            };
        }
        default: {
            throw new Error(`Invalid mesh primitive mode (${mode})`);
        }
    }
}
function getIconPath(context, name) {
    return {
        light: context.asAbsolutePath(path.join('resources', 'light', `${name}.svg`)),
        dark: context.asAbsolutePath(path.join('resources', 'dark', `${name}.svg`))
    };
}
class GltfInspectData {
    constructor(context, gltfWindow) {
        this._iconPaths = {};
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this._iconPaths[NodeType.Header] = getIconPath(context, 'inspect');
        this._gltfWindow = gltfWindow;
        this._gltfWindow.onDidChangeActiveTextEditor(() => {
            this.reset();
        });
        this._gltfWindow.preview.onDidChangeActivePanel(panel => {
            if (panel && panel.ready) {
                this.updateSelection(panel, this._treeView.selection);
            }
        });
        this._gltfWindow.preview.onDidChangeReadyState(panel => {
            this.updateSelection(panel, this._treeView.selection);
        });
        context.subscriptions.push(vscode.commands.registerCommand('gltfInspectData.copy', (node) => {
            vscode.env.clipboard.writeText(node.label);
        }));
        context.subscriptions.push(vscode.commands.registerCommand('gltfInspectData.copyAll', () => {
            let text = `${this._headerNode.label}${os.EOL}`;
            const traverseNodes = (nodes, indent) => {
                for (const node of nodes) {
                    text += `${indent}${node.label}${os.EOL}`;
                    traverseNodes(this.getChildren(node, Number.MAX_VALUE), `  ${indent}`);
                }
            };
            traverseNodes(this._nodes, '');
            vscode.env.clipboard.writeText(text);
        }));
    }
    getTreeItem(node) {
        const treeItem = new vscode.TreeItem(node.label);
        treeItem.tooltip = node.tooltip;
        treeItem.iconPath = this._iconPaths[node.type];
        if (this.getChildren(node).length !== 0) {
            treeItem.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
        }
        if (node.type === NodeType.Vertex) {
            // Add a noop command to stop the item from expanding when clicking on the item label.
            // See https://github.com/Microsoft/vscode/issues/34130#issuecomment-398783006.
            // The actual handling of selection is in onDidSelectionChange to support multiselect.
            treeItem.command = { title: '', command: 'gltf.noop' };
        }
        return treeItem;
    }
    getParent(node) {
        return undefined;
    }
    getChildren(node, groupSize = 100) {
        if (!node) {
            return this._headerNode ? [this._headerNode, ...groupNodes(this._nodes, groupSize)] : [];
        }
        switch (node.type) {
            case NodeType.Group: {
                const groupNode = node;
                return groupNode.nodes;
            }
            case NodeType.AccessorMatrix: {
                const accessorMatrixNode = node;
                return accessorMatrixNode.rows;
            }
            case NodeType.Vertices: {
                const verticesNode = node;
                return groupNodes(verticesNode.nodes, groupSize);
            }
            case NodeType.Vertex: {
                const vertexNode = node;
                return vertexNode.attributeNodes;
            }
            case NodeType.Triangles: {
                const trianglesNode = node;
                return groupNodes(trianglesNode.nodes, groupSize);
            }
            case NodeType.Lines: {
                const linesNode = node;
                return groupNodes(linesNode.nodes, groupSize);
            }
            case NodeType.Points: {
                const pointsNode = node;
                return groupNodes(pointsNode.nodes, groupSize);
            }
        }
        return [];
    }
    setTreeView(treeView) {
        this._treeView = treeView;
        this._treeView.onDidChangeSelection(e => this.onDidSelectionChange(e));
    }
    showAccessor(fileName, gltf, jsonPointer) {
        this.reset();
        this._fileName = fileName;
        this._jsonPointer = jsonPointer;
        const accessor = (0, utilities_1.getFromJsonPointer)(gltf, jsonPointer);
        this._headerNode = {
            type: NodeType.Header,
            label: this._jsonPointer
        };
        this._nodes = getAccessorNodes(fileName, gltf, accessor);
        this._onDidChangeTreeData.fire(undefined);
        this._treeView.reveal(this._headerNode, { select: false, focus: true });
    }
    showMeshPrimitive(fileName, gltf, jsonPointer) {
        this.reset();
        this._fileName = fileName;
        this._jsonPointer = jsonPointer;
        const meshPrimitive = (0, utilities_1.getFromJsonPointer)(gltf, jsonPointer);
        this._headerNode = {
            type: NodeType.Header,
            label: this._jsonPointer
        };
        const verticesNode = getVerticesNode(this._fileName, gltf, meshPrimitive.attributes);
        const indicesNode = getIndicesNode(this._fileName, gltf, verticesNode.numVertices, meshPrimitive.mode, meshPrimitive.indices);
        this._nodes = [verticesNode, indicesNode];
        this._onDidChangeTreeData.fire(undefined);
        this._treeView.reveal(this._headerNode, { select: false, focus: true });
    }
    reset() {
        delete this._fileName;
        delete this._jsonPointer;
        delete this._headerNode;
        delete this._nodes;
        this._onDidChangeTreeData.fire(undefined);
    }
    updateSelection(panel, selection) {
        const vertices = selection.filter(node => node.type === NodeType.Vertex).map((node) => node.index);
        const triangles = selection.filter(node => node.type === NodeType.Triangle).map((node) => ({ index: node.index, vertices: node.vertices }));
        const lines = selection.filter(node => node.type === NodeType.Line).map((node) => ({ index: node.index, vertices: node.vertices }));
        const points = selection.filter(node => node.type === NodeType.Point).map((node) => ({ index: node.index, vertices: [node.index] }));
        const trianglesLinesPoints = [...triangles, ...lines, ...points];
        panel.webview.postMessage({ command: 'select', jsonPointer: this._jsonPointer, vertices: vertices, trianglesLinesPoints: trianglesLinesPoints });
    }
    onDidSelectionChange(e) {
        const panel = this._gltfWindow.preview.getPanel(this._fileName);
        if (panel) {
            this.updateSelection(panel, e.selection);
        }
    }
}
exports.GltfInspectData = GltfInspectData;
//# sourceMappingURL=gltfInspectData.js.map