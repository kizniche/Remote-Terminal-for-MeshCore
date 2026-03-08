"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.AckPayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const hex_1 = require("../../utils/hex");
class AckPayloadDecoder {
    static decode(payload, options) {
        try {
            // Based on MeshCore payloads.md - Ack payload structure:
            // - checksum (4 bytes) - CRC checksum of message timestamp, text, and sender pubkey
            if (payload.length < 4) {
                const result = {
                    type: enums_1.PayloadType.Ack,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['Ack payload too short (minimum 4 bytes for checksum)'],
                    checksum: ''
                };
                if (options?.includeSegments) {
                    result.segments = [{
                            name: 'Invalid Ack Data',
                            description: 'Ack payload too short (minimum 4 bytes required for checksum)',
                            startByte: options.segmentOffset || 0,
                            endByte: (options.segmentOffset || 0) + payload.length - 1,
                            value: (0, hex_1.bytesToHex)(payload)
                        }];
                }
                return result;
            }
            const segments = [];
            const segmentOffset = options?.segmentOffset || 0;
            // parse checksum (4 bytes as hex)
            const checksum = (0, hex_1.bytesToHex)(payload.subarray(0, 4));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Checksum',
                    description: `CRC checksum of message timestamp, text, and sender pubkey: 0x${checksum}`,
                    startByte: segmentOffset,
                    endByte: segmentOffset + 3,
                    value: checksum
                });
            }
            // any additional data (if present)
            if (options?.includeSegments && payload.length > 4) {
                segments.push({
                    name: 'Additional Data',
                    description: 'Extra data in Ack payload',
                    startByte: segmentOffset + 4,
                    endByte: segmentOffset + payload.length - 1,
                    value: (0, hex_1.bytesToHex)(payload.subarray(4))
                });
            }
            const result = {
                type: enums_1.PayloadType.Ack,
                version: enums_1.PayloadVersion.Version1,
                isValid: true,
                checksum
            };
            if (options?.includeSegments) {
                result.segments = segments;
            }
            return result;
        }
        catch (error) {
            return {
                type: enums_1.PayloadType.Ack,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Failed to decode Ack payload'],
                checksum: ''
            };
        }
    }
}
exports.AckPayloadDecoder = AckPayloadDecoder;
//# sourceMappingURL=ack.js.map