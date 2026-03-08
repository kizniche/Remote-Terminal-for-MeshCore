"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonRequestPayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const hex_1 = require("../../utils/hex");
class AnonRequestPayloadDecoder {
    static decode(payload, options) {
        try {
            // Based on MeshCore payloads.md - AnonRequest payload structure:
            // - destination_hash (1 byte)
            // - sender_public_key (32 bytes)
            // - cipher_mac (2 bytes)
            // - ciphertext (rest of payload)
            if (payload.length < 35) {
                const result = {
                    type: enums_1.PayloadType.AnonRequest,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['AnonRequest payload too short (minimum 35 bytes: dest + public key + MAC)'],
                    destinationHash: '',
                    senderPublicKey: '',
                    cipherMac: '',
                    ciphertext: '',
                    ciphertextLength: 0
                };
                if (options?.includeSegments) {
                    result.segments = [{
                            name: 'Invalid AnonRequest Data',
                            description: 'AnonRequest payload too short (minimum 35 bytes required: 1 for dest hash + 32 for public key + 2 for MAC)',
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
            const destinationHash = (0, hex_1.byteToHex)(payload[0]);
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
            // Parse sender public key (32 bytes)
            const senderPublicKey = (0, hex_1.bytesToHex)(payload.subarray(1, 33));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Sender Public Key',
                    description: `Ed25519 public key of the sender (32 bytes)`,
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset + 31,
                    value: senderPublicKey
                });
            }
            offset += 32;
            // Parse cipher MAC (2 bytes)
            const cipherMac = (0, hex_1.bytesToHex)(payload.subarray(33, 35));
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
            const ciphertext = (0, hex_1.bytesToHex)(payload.subarray(35));
            if (options?.includeSegments && payload.length > 35) {
                segments.push({
                    name: 'Ciphertext',
                    description: `Encrypted message data (${payload.length - 35} bytes). Contains encrypted plaintext with this structure:
• Timestamp (4 bytes) - send time as unix timestamp
• Sync Timestamp (4 bytes) - room server only, sender's "sync messages SINCE x" timestamp  
• Password (remaining bytes) - password for repeater/room`,
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + payload.length - 1,
                    value: ciphertext
                });
            }
            const result = {
                type: enums_1.PayloadType.AnonRequest,
                version: enums_1.PayloadVersion.Version1,
                isValid: true,
                destinationHash,
                senderPublicKey,
                cipherMac,
                ciphertext,
                ciphertextLength: payload.length - 35
            };
            if (options?.includeSegments) {
                result.segments = segments;
            }
            return result;
        }
        catch (error) {
            return {
                type: enums_1.PayloadType.AnonRequest,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Failed to decode AnonRequest payload'],
                destinationHash: '',
                senderPublicKey: '',
                cipherMac: '',
                ciphertext: '',
                ciphertextLength: 0
            };
        }
    }
}
exports.AnonRequestPayloadDecoder = AnonRequestPayloadDecoder;
//# sourceMappingURL=anon-request.js.map