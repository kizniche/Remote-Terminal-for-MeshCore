"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestPayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const hex_1 = require("../../utils/hex");
class RequestPayloadDecoder {
    static decode(payload, options) {
        try {
            // Based on MeshCore payloads.md - Request payload structure:
            // - destination hash (1 byte)
            // - source hash (1 byte)
            // - cipher MAC (2 bytes)
            // - ciphertext (rest of payload) - contains encrypted timestamp, request type, and request data
            if (payload.length < 4) {
                const result = {
                    type: enums_1.PayloadType.Request,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['Request payload too short (minimum 4 bytes: dest hash + source hash + MAC)'],
                    timestamp: 0,
                    requestType: enums_1.RequestType.GetStats,
                    requestData: '',
                    destinationHash: '',
                    sourceHash: '',
                    cipherMac: '',
                    ciphertext: ''
                };
                if (options?.includeSegments) {
                    result.segments = [{
                            name: 'Invalid Request Data',
                            description: 'Request payload too short (minimum 4 bytes required: 1 for dest hash + 1 for source hash + 2 for MAC)',
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
            // Parse destination hash (1 byte)
            const destinationHash = (0, hex_1.bytesToHex)(payload.subarray(offset, offset + 1));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Destination Hash',
                    description: `First byte of destination node public key: 0x${destinationHash}`,
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset,
                    value: destinationHash
                });
            }
            offset += 1;
            // Parse source hash (1 byte)
            const sourceHash = (0, hex_1.bytesToHex)(payload.subarray(offset, offset + 1));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Source Hash',
                    description: `First byte of source node public key: 0x${sourceHash}`,
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset,
                    value: sourceHash
                });
            }
            offset += 1;
            // Parse cipher MAC (2 bytes)
            const cipherMac = (0, hex_1.bytesToHex)(payload.subarray(offset, offset + 2));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Cipher MAC',
                    description: `MAC for encrypted data verification (2 bytes)`,
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset + 1,
                    value: cipherMac
                });
            }
            offset += 2;
            // Parse ciphertext (remaining bytes)
            const ciphertext = (0, hex_1.bytesToHex)(payload.subarray(offset));
            if (options?.includeSegments && payload.length > offset) {
                segments.push({
                    name: 'Ciphertext',
                    description: `Encrypted message data (${payload.length - offset} bytes). Contains encrypted plaintext with this structure:
• Timestamp (4 bytes) - send time as unix timestamp
• Request Type (1 byte) - type of request (GetStats, GetTelemetryData, etc.)
• Request Data (remaining bytes) - additional request-specific data`,
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + payload.length - 1,
                    value: ciphertext
                });
            }
            const result = {
                type: enums_1.PayloadType.Request,
                version: enums_1.PayloadVersion.Version1,
                isValid: true,
                timestamp: 0, // Encrypted, cannot be parsed without decryption
                requestType: enums_1.RequestType.GetStats, // Encrypted, cannot be determined without decryption
                requestData: '',
                destinationHash,
                sourceHash,
                cipherMac,
                ciphertext
            };
            if (options?.includeSegments) {
                result.segments = segments;
            }
            return result;
        }
        catch (error) {
            return {
                type: enums_1.PayloadType.Request,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Failed to decode request payload'],
                timestamp: 0,
                requestType: enums_1.RequestType.GetStats,
                requestData: '',
                destinationHash: '',
                sourceHash: '',
                cipherMac: '',
                ciphertext: ''
            };
        }
    }
}
exports.RequestPayloadDecoder = RequestPayloadDecoder;
//# sourceMappingURL=request.js.map