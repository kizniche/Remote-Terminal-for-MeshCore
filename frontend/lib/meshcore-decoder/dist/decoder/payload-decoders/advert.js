"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvertPayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const hex_1 = require("../../utils/hex");
const enum_names_1 = require("../../utils/enum-names");
const ed25519_verifier_1 = require("../../crypto/ed25519-verifier");
class AdvertPayloadDecoder {
    static decode(payload, options) {
        try {
            // start of appdata section: public_key(32) + timestamp(4) + signature(64) + flags(1) = 101 bytes
            if (payload.length < 101) {
                const result = {
                    type: enums_1.PayloadType.Advert,
                    version: enums_1.PayloadVersion.Version1,
                    isValid: false,
                    errors: ['Advertisement payload too short'],
                    publicKey: '',
                    timestamp: 0,
                    signature: '',
                    appData: {
                        flags: 0,
                        deviceRole: enums_1.DeviceRole.ChatNode,
                        hasLocation: false,
                        hasName: false
                    }
                };
                if (options?.includeSegments) {
                    result.segments = [{
                            name: 'Invalid Advert Data',
                            description: 'Advert payload too short (minimum 101 bytes required)',
                            startByte: options.segmentOffset || 0,
                            endByte: (options.segmentOffset || 0) + payload.length - 1,
                            value: (0, hex_1.bytesToHex)(payload)
                        }];
                }
                return result;
            }
            const segments = [];
            const segmentOffset = options?.segmentOffset || 0;
            let currentOffset = 0;
            // parse advertisement structure from payloads.md
            const publicKey = (0, hex_1.bytesToHex)(payload.subarray(currentOffset, currentOffset + 32));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Public Key',
                    description: 'Ed25519 public key',
                    startByte: segmentOffset + currentOffset,
                    endByte: segmentOffset + currentOffset + 31,
                    value: publicKey
                });
            }
            currentOffset += 32;
            const timestamp = this.readUint32LE(payload, currentOffset);
            if (options?.includeSegments) {
                const timestampDate = new Date(timestamp * 1000);
                segments.push({
                    name: 'Timestamp',
                    description: `${timestamp} (${timestampDate.toISOString().slice(0, 19)}Z)`,
                    startByte: segmentOffset + currentOffset,
                    endByte: segmentOffset + currentOffset + 3,
                    value: (0, hex_1.bytesToHex)(payload.subarray(currentOffset, currentOffset + 4))
                });
            }
            currentOffset += 4;
            const signature = (0, hex_1.bytesToHex)(payload.subarray(currentOffset, currentOffset + 64));
            if (options?.includeSegments) {
                segments.push({
                    name: 'Signature',
                    description: 'Ed25519 signature',
                    startByte: segmentOffset + currentOffset,
                    endByte: segmentOffset + currentOffset + 63,
                    value: signature
                });
            }
            currentOffset += 64;
            const flags = payload[currentOffset];
            if (options?.includeSegments) {
                const binaryStr = flags.toString(2).padStart(8, '0');
                const deviceRole = this.parseDeviceRole(flags);
                const roleName = (0, enum_names_1.getDeviceRoleName)(deviceRole);
                const flagDesc = ` | Bits 0-3 (Role): ${roleName} | Bit 4 (Location): ${!!(flags & enums_1.AdvertFlags.HasLocation) ? 'Yes' : 'No'} | Bit 7 (Name): ${!!(flags & enums_1.AdvertFlags.HasName) ? 'Yes' : 'No'}`;
                segments.push({
                    name: 'App Flags',
                    description: `Binary: ${binaryStr}${flagDesc}`,
                    startByte: segmentOffset + currentOffset,
                    endByte: segmentOffset + currentOffset,
                    value: flags.toString(16).padStart(2, '0').toUpperCase()
                });
            }
            currentOffset += 1;
            const advert = {
                type: enums_1.PayloadType.Advert,
                version: enums_1.PayloadVersion.Version1,
                isValid: true,
                publicKey,
                timestamp,
                signature,
                appData: {
                    flags,
                    deviceRole: this.parseDeviceRole(flags),
                    hasLocation: !!(flags & enums_1.AdvertFlags.HasLocation),
                    hasName: !!(flags & enums_1.AdvertFlags.HasName)
                }
            };
            let offset = currentOffset;
            // location data (if HasLocation flag is set)
            if (flags & enums_1.AdvertFlags.HasLocation && payload.length >= offset + 8) {
                const lat = this.readInt32LE(payload, offset) / 1000000;
                const lon = this.readInt32LE(payload, offset + 4) / 1000000;
                advert.appData.location = {
                    latitude: Math.round(lat * 1000000) / 1000000, // Keep precision
                    longitude: Math.round(lon * 1000000) / 1000000
                };
                if (options?.includeSegments) {
                    segments.push({
                        name: 'Latitude',
                        description: `${lat}° (${lat})`,
                        startByte: segmentOffset + offset,
                        endByte: segmentOffset + offset + 3,
                        value: (0, hex_1.bytesToHex)(payload.subarray(offset, offset + 4))
                    });
                    segments.push({
                        name: 'Longitude',
                        description: `${lon}° (${lon})`,
                        startByte: segmentOffset + offset + 4,
                        endByte: segmentOffset + offset + 7,
                        value: (0, hex_1.bytesToHex)(payload.subarray(offset + 4, offset + 8))
                    });
                }
                offset += 8;
            }
            // skip feature fields for now (HasFeature1, HasFeature2)
            if (flags & enums_1.AdvertFlags.HasFeature1)
                offset += 2;
            if (flags & enums_1.AdvertFlags.HasFeature2)
                offset += 2;
            // name data (if HasName flag is set)
            if (flags & enums_1.AdvertFlags.HasName && payload.length > offset) {
                const nameBytes = payload.subarray(offset);
                const rawName = new TextDecoder('utf-8').decode(nameBytes).replace(/\0.*$/, '');
                advert.appData.name = this.sanitizeControlCharacters(rawName) || rawName;
                if (options?.includeSegments) {
                    segments.push({
                        name: 'Node Name',
                        description: `Node name: "${advert.appData.name}"`,
                        startByte: segmentOffset + offset,
                        endByte: segmentOffset + payload.length - 1,
                        value: (0, hex_1.bytesToHex)(nameBytes)
                    });
                }
            }
            if (options?.includeSegments) {
                advert.segments = segments;
            }
            return advert;
        }
        catch (error) {
            return {
                type: enums_1.PayloadType.Advert,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Failed to decode advertisement payload'],
                publicKey: '',
                timestamp: 0,
                signature: '',
                appData: {
                    flags: 0,
                    deviceRole: enums_1.DeviceRole.ChatNode,
                    hasLocation: false,
                    hasName: false
                }
            };
        }
    }
    /**
     * Decode advertisement payload with signature verification
     */
    static async decodeWithVerification(payload, options) {
        // First decode normally
        const advert = this.decode(payload, options);
        if (!advert || !advert.isValid) {
            return advert;
        }
        // Perform signature verification
        try {
            // Extract app_data from the payload (everything after public_key + timestamp + signature)
            const appDataStart = 32 + 4 + 64; // public_key + timestamp + signature
            const appDataBytes = payload.subarray(appDataStart);
            const appDataHex = (0, hex_1.bytesToHex)(appDataBytes);
            const signatureValid = await ed25519_verifier_1.Ed25519SignatureVerifier.verifyAdvertisementSignature(advert.publicKey, advert.signature, advert.timestamp, appDataHex);
            advert.signatureValid = signatureValid;
            if (!signatureValid) {
                advert.signatureError = 'Ed25519 signature verification failed';
                advert.isValid = false;
                if (!advert.errors) {
                    advert.errors = [];
                }
                advert.errors.push('Invalid Ed25519 signature');
            }
        }
        catch (error) {
            advert.signatureValid = false;
            advert.signatureError = error instanceof Error ? error.message : 'Signature verification error';
            advert.isValid = false;
            if (!advert.errors) {
                advert.errors = [];
            }
            advert.errors.push('Signature verification failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
        }
        return advert;
    }
    static parseDeviceRole(flags) {
        const roleValue = flags & 0x0F;
        switch (roleValue) {
            case 0x01: return enums_1.DeviceRole.ChatNode;
            case 0x02: return enums_1.DeviceRole.Repeater;
            case 0x03: return enums_1.DeviceRole.RoomServer;
            case 0x04: return enums_1.DeviceRole.Sensor;
            default: return enums_1.DeviceRole.ChatNode;
        }
    }
    static readUint32LE(buffer, offset) {
        return buffer[offset] |
            (buffer[offset + 1] << 8) |
            (buffer[offset + 2] << 16) |
            (buffer[offset + 3] << 24);
    }
    static readInt32LE(buffer, offset) {
        const value = this.readUint32LE(buffer, offset);
        // convert unsigned to signed
        return value > 0x7FFFFFFF ? value - 0x100000000 : value;
    }
    static sanitizeControlCharacters(value) {
        if (!value)
            return null;
        const sanitized = value.trim().replace(/[\x00-\x1F\x7F]/g, '');
        return sanitized || null;
    }
}
exports.AdvertPayloadDecoder = AdvertPayloadDecoder;
//# sourceMappingURL=advert.js.map