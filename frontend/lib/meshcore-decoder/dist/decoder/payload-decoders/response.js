"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponsePayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const hex_1 = require("../../utils/hex");
class ResponsePayloadDecoder {
    static decode(payload, options) {
        try {
            // Based on MeshCore payloads.md - Response payload structure:
            // - destination_hash (1 byte)
            // - source_hash (1 byte)
            // - cipher_mac (2 bytes)
            // - ciphertext (rest of payload)
            if (payload.length < 4) {
                const result = {
                    type: enums_1.PayloadType.Response,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['Response payload too short (minimum 4 bytes: dest + source + MAC)'],
                    destinationHash: '',
                    sourceHash: '',
                    cipherMac: '',
                    ciphertext: '',
                    ciphertextLength: 0
                };
                if (options?.includeSegments) {
                    result.segments = [{
                            name: 'Invalid Response Data',
                            description: 'Response payload too short (minimum 4 bytes required)',
                            startByte: options.segmentOffset || 0,
                            endByte: (options.segmentOffset || 0) + payload.length - 1,
                            value: (0, hex_1.bytesToHex)(payload)
                        }];
                }
                return result;
            }
            const segments = [];
            const segmentOffset = options?.segmentOffset || 0;
            let offset = 0;
            // Destination Hash (1 byte)
            const destinationHash = (0, hex_1.byteToHex)(payload[offset]);
            if (options?.includeSegments) {
                segments.push({
                    name: 'Destination Hash',
                    description: 'First byte of destination node public key',
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset,
                    value: destinationHash
                });
            }
            offset += 1;
            // source hash (1 byte)
            const sourceHash = (0, hex_1.byteToHex)(payload[offset]);
            if (options?.includeSegments) {
                segments.push({
                    name: 'Source Hash',
                    description: 'First byte of source node public key',
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset,
                    value: sourceHash
                });
            }
            offset += 1;
            // cipher MAC (2 bytes)
            const cipherMac = (0, hex_1.bytesToHex)(payload.subarray(offset, offset + 2));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Cipher MAC',
                    description: 'MAC for encrypted data in next field',
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset + 1,
                    value: cipherMac
                });
            }
            offset += 2;
            // ciphertext (remaining bytes)
            const ciphertext = (0, hex_1.bytesToHex)(payload.subarray(offset));
            if (options?.includeSegments && payload.length > offset) {
                segments.push({
                    name: 'Ciphertext',
                    description: 'Encrypted response data (tag + content)',
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + payload.length - 1,
                    value: ciphertext
                });
            }
            const result = {
                type: enums_1.PayloadType.Response,
                version: enums_1.PayloadVersion.Version1,
                isValid: true,
                destinationHash,
                sourceHash,
                cipherMac,
                ciphertext,
                ciphertextLength: payload.length - 4
            };
            if (options?.includeSegments) {
                result.segments = segments;
            }
            return result;
        }
        catch (error) {
            return {
                type: enums_1.PayloadType.Response,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Failed to decode response payload'],
                destinationHash: '',
                sourceHash: '',
                cipherMac: '',
                ciphertext: '',
                ciphertextLength: 0
            };
        }
    }
}
exports.ResponsePayloadDecoder = ResponsePayloadDecoder;
//# sourceMappingURL=response.js.map