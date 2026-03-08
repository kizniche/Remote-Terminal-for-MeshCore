"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.PathPayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const hex_1 = require("../../utils/hex");
class PathPayloadDecoder {
    static decode(payload) {
        try {
            // Based on MeshCore payloads.md - Path payload structure:
            // - path_len (1 byte, encoded: bits 7:6 = hash size selector, bits 5:0 = hop count)
            // - path (variable length) - list of node hashes (pathHashSize bytes each)
            // - extra_type (1 byte) - bundled payload type
            // - extra (rest of data) - bundled payload content
            if (payload.length < 2) {
                return {
                    type: enums_1.PayloadType.Path,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['Path payload too short (minimum 2 bytes: path length + extra type)'],
                    pathLength: 0,
                    pathHashes: [],
                    extraType: 0,
                    extraData: ''
                };
            }
            const pathLenByte = payload[0];
            const pathHashSize = (pathLenByte >> 6) + 1;
            const pathHopCount = pathLenByte & 63;
            const pathByteLength = pathHopCount * pathHashSize;
            if (pathHashSize === 4) {
                return {
                    type: enums_1.PayloadType.Path,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['Invalid path length byte: reserved hash size (bits 7:6 = 11)'],
                    pathLength: 0,
                    pathHashes: [],
                    extraType: 0,
                    extraData: ''
                };
            }
            if (payload.length < 1 + pathByteLength + 1) {
                return {
                    type: enums_1.PayloadType.Path,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: [`Path payload too short (need ${1 + pathByteLength + 1} bytes for path length + path + extra type)`],
                    pathLength: pathHopCount,
                    ...(pathHashSize > 1 ? { pathHashSize } : {}),
                    pathHashes: [],
                    extraType: 0,
                    extraData: ''
                };
            }
            // Parse path hashes (pathHashSize bytes each)
            const pathHashes = [];
            for (let i = 0; i < pathHopCount; i++) {
                const hashStart = 1 + i * pathHashSize;
                const hashBytes = payload.subarray(hashStart, hashStart + pathHashSize);
                pathHashes.push((0, hex_1.bytesToHex)(hashBytes));
            }
            // Parse extra type (1 byte after path)
            const extraType = payload[1 + pathByteLength];
            // Parse extra data (remaining bytes)
            let extraData = '';
            if (payload.length > 1 + pathByteLength + 1) {
                extraData = (0, hex_1.bytesToHex)(payload.subarray(1 + pathByteLength + 1));
            }
            return {
                type: enums_1.PayloadType.Path,
                version: enums_1.PayloadVersion.Version1,
                isValid: true,
                pathLength: pathHopCount,
                ...(pathHashSize > 1 ? { pathHashSize } : {}),
                pathHashes,
                extraType,
                extraData
            };
        }
        catch (error) {
            return {
                type: enums_1.PayloadType.Path,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Failed to decode Path payload'],
                pathLength: 0,
                pathHashes: [],
                extraType: 0,
                extraData: ''
            };
        }
    }
}
exports.PathPayloadDecoder = PathPayloadDecoder;
//# sourceMappingURL=path.js.map