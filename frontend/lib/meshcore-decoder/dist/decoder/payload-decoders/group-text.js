"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupTextPayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const channel_crypto_1 = require("../../crypto/channel-crypto");
const hex_1 = require("../../utils/hex");
class GroupTextPayloadDecoder {
    static decode(payload, options) {
        try {
            if (payload.length < 3) {
                const result = {
                    type: enums_1.PayloadType.GroupText,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['GroupText payload too short (need at least channel_hash(1) + MAC(2))'],
                    channelHash: '',
                    cipherMac: '',
                    ciphertext: '',
                    ciphertextLength: 0
                };
                if (options?.includeSegments) {
                    result.segments = [{
                            name: 'Invalid GroupText Data',
                            description: 'GroupText payload too short (minimum 3 bytes required)',
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
            // channel hash (1 byte) - first byte of SHA256 of channel's shared key
            const channelHash = (0, hex_1.byteToHex)(payload[offset]);
            if (options?.includeSegments) {
                segments.push({
                    name: 'Channel Hash',
                    description: 'First byte of SHA256 of channel\'s shared key',
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset,
                    value: channelHash
                });
            }
            offset += 1;
            // MAC (2 bytes) - message authentication code
            const cipherMac = (0, hex_1.bytesToHex)(payload.subarray(offset, offset + 2));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Cipher MAC',
                    description: 'MAC for encrypted data',
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset + 1,
                    value: cipherMac
                });
            }
            offset += 2;
            // ciphertext (remaining bytes) - encrypted message
            const ciphertext = (0, hex_1.bytesToHex)(payload.subarray(offset));
            if (options?.includeSegments && payload.length > offset) {
                segments.push({
                    name: 'Ciphertext',
                    description: 'Encrypted message content (timestamp + flags + message)',
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + payload.length - 1,
                    value: ciphertext
                });
            }
            const groupText = {
                type: enums_1.PayloadType.GroupText,
                version: enums_1.PayloadVersion.Version1,
                isValid: true,
                channelHash,
                cipherMac,
                ciphertext,
                ciphertextLength: payload.length - 3
            };
            // attempt decryption if key store is provided
            if (options?.keyStore && options.keyStore.hasChannelKey(channelHash)) {
                // try all possible keys for this hash (handles collisions)
                const channelKeys = options.keyStore.getChannelKeys(channelHash);
                for (const channelKey of channelKeys) {
                    const decryptionResult = channel_crypto_1.ChannelCrypto.decryptGroupTextMessage(ciphertext, cipherMac, channelKey);
                    if (decryptionResult.success && decryptionResult.data) {
                        groupText.decrypted = {
                            timestamp: decryptionResult.data.timestamp,
                            flags: decryptionResult.data.flags,
                            sender: decryptionResult.data.sender,
                            message: decryptionResult.data.message
                        };
                        break; // stop trying keys once we find one that works
                    }
                }
            }
            if (options?.includeSegments) {
                groupText.segments = segments;
            }
            return groupText;
        }
        catch (error) {
            return {
                type: enums_1.PayloadType.GroupText,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Failed to decode GroupText payload'],
                channelHash: '',
                cipherMac: '',
                ciphertext: '',
                ciphertextLength: 0
            };
        }
    }
}
exports.GroupTextPayloadDecoder = GroupTextPayloadDecoder;
//# sourceMappingURL=group-text.js.map