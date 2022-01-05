"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseJsonMap = exports.guessMimeType = exports.guessFileExtension = exports.getAccessorElement = exports.getAccessorData = exports.btoa = exports.atob = exports.truncateJsonPointer = exports.getFromJsonPointer = exports.AccessorTypeToNumComponents = exports.ComponentTypeToBytesPerElement = void 0;
const jsonMap = require("json-source-map");
const gltf_import_export_1 = require("gltf-import-export");
exports.ComponentTypeToBytesPerElement = {
    5120: Int8Array.BYTES_PER_ELEMENT,
    5121: Uint8Array.BYTES_PER_ELEMENT,
    5122: Int16Array.BYTES_PER_ELEMENT,
    5123: Uint16Array.BYTES_PER_ELEMENT,
    5125: Uint32Array.BYTES_PER_ELEMENT,
    5126: Float32Array.BYTES_PER_ELEMENT
};
exports.AccessorTypeToNumComponents = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16
};
function getFromJsonPointer(glTF, jsonPointer) {
    const jsonPointerSplit = jsonPointer.split('/');
    const numPointerSegments = jsonPointerSplit.length;
    let result = glTF;
    const firstValidIndex = 1; // Because the path has a leading slash.
    for (let i = firstValidIndex; i < numPointerSegments; ++i) {
        result = result[jsonPointerSplit[i]];
    }
    return result;
}
exports.getFromJsonPointer = getFromJsonPointer;
function truncateJsonPointer(value, level) {
    const components = value.split('/');
    components.splice(level + 1);
    return components.join('/');
}
exports.truncateJsonPointer = truncateJsonPointer;
function atob(str) {
    return Buffer.from(str, 'base64').toString('binary');
}
exports.atob = atob;
function btoa(str) {
    return str.toString('base64');
}
exports.btoa = btoa;
function buildArrayBuffer(typedArray, data, byteOffset, count, numComponents, byteStride) {
    byteOffset += data.byteOffset;
    const targetLength = count * numComponents;
    if (byteStride === undefined || byteStride === numComponents * typedArray.BYTES_PER_ELEMENT) {
        return new typedArray(data.buffer, byteOffset, targetLength);
    }
    const elementStride = byteStride / typedArray.BYTES_PER_ELEMENT;
    const sourceBuffer = new typedArray(data.buffer, byteOffset, elementStride * count);
    const targetBuffer = new typedArray(targetLength);
    let sourceIndex = 0;
    let targetIndex = 0;
    while (targetIndex < targetLength) {
        for (let componentIndex = 0; componentIndex < numComponents; componentIndex++) {
            targetBuffer[targetIndex] = sourceBuffer[sourceIndex + componentIndex];
            targetIndex++;
        }
        sourceIndex += elementStride;
    }
    return targetBuffer;
}
function getAccessorData(fileName, gltf, accessor) {
    if (accessor.bufferView === undefined) {
        return undefined;
    }
    const bufferView = gltf.bufferViews[accessor.bufferView];
    if (!bufferView) {
        return undefined;
    }
    const buffer = (0, gltf_import_export_1.getBuffer)(gltf, bufferView.buffer, fileName);
    const bufferOffset = bufferView.byteOffset || 0;
    const bufferLength = bufferView.byteLength;
    const bufferStride = bufferView.byteStride;
    const bufferViewBuf = buffer.subarray(bufferOffset, bufferOffset + bufferLength);
    const accessorByteOffset = accessor.byteOffset || 0;
    switch (accessor.componentType) {
        case 5120 /* BYTE */:
            return buildArrayBuffer(Int8Array, bufferViewBuf, bufferOffset + accessorByteOffset, accessor.count, exports.AccessorTypeToNumComponents[accessor.type], bufferStride);
        case 5121 /* UNSIGNED_BYTE */:
            return buildArrayBuffer(Uint8Array, bufferViewBuf, accessorByteOffset, accessor.count, exports.AccessorTypeToNumComponents[accessor.type], bufferStride);
        case 5122 /* SHORT */:
            return buildArrayBuffer(Int16Array, bufferViewBuf, accessorByteOffset, accessor.count, exports.AccessorTypeToNumComponents[accessor.type], bufferStride);
        case 5123 /* UNSIGNED_SHORT */:
            return buildArrayBuffer(Uint16Array, bufferViewBuf, accessorByteOffset, accessor.count, exports.AccessorTypeToNumComponents[accessor.type], bufferStride);
        case 5125 /* UNSIGNED_INT */:
            return buildArrayBuffer(Uint32Array, bufferViewBuf, accessorByteOffset, accessor.count, exports.AccessorTypeToNumComponents[accessor.type], bufferStride);
        case 5126 /* FLOAT */:
            return buildArrayBuffer(Float32Array, bufferViewBuf, accessorByteOffset, accessor.count, exports.AccessorTypeToNumComponents[accessor.type], bufferStride);
    }
}
exports.getAccessorData = getAccessorData;
function getAccessorElement(data, elementIndex, numComponents, componentType, normalized) {
    const normalize = (value) => {
        switch (componentType) {
            case 5120 /* BYTE */: return Math.max(value / 127.0, -1.0);
            case 5121 /* UNSIGNED_BYTE */: return value / 255.0;
            case 5122 /* SHORT */: return Math.max(value / 32767.0, -1.0);
            case 5123 /* UNSIGNED_SHORT */: return value / 65535.0;
        }
        return value;
    };
    const values = new Array(numComponents);
    const startIndex = elementIndex * numComponents;
    for (let index = 0; index < numComponents; index++) {
        const value = data[startIndex + index];
        values[index] = normalized ? normalize(value) : value;
    }
    return values;
}
exports.getAccessorElement = getAccessorElement;
const gltfMimeTypes = {
    'image/png': ['png'],
    'image/jpeg': ['jpg', 'jpeg'],
    'image/ktx': ['ktx'],
    'image/ktx2': ['ktx2'],
    'image/webp': ['webp'],
    'image/vnd-ms.dds': ['dds'],
    'text/plain': ['glsl', 'vert', 'vs', 'frag', 'fs', 'txt'],
    'audio/wav': ['wav']
};
function guessFileExtension(mimeType) {
    if (gltfMimeTypes.hasOwnProperty(mimeType)) {
        return '.' + gltfMimeTypes[mimeType][0];
    }
    return '.bin';
}
exports.guessFileExtension = guessFileExtension;
function guessMimeType(filename) {
    for (const mimeType in gltfMimeTypes) {
        for (const extensionIndex in gltfMimeTypes[mimeType]) {
            const extension = gltfMimeTypes[mimeType][extensionIndex];
            if (filename.toLowerCase().endsWith('.' + extension)) {
                return mimeType;
            }
        }
    }
    return 'application/octet-stream';
}
exports.guessMimeType = guessMimeType;
function parseJsonMap(content) {
    return jsonMap.parse(content);
}
exports.parseJsonMap = parseJsonMap;
//# sourceMappingURL=utilities.js.map