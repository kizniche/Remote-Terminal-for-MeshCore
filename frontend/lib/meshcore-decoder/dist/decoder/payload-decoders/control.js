"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlPayloadDecoder = void 0;
const enums_1 = require("../../types/enums");
const hex_1 = require("../../utils/hex");
const enum_names_1 = require("../../utils/enum-names");
class ControlPayloadDecoder {
    static decode(payload, options) {
        try {
            if (payload.length < 1) {
                return this.createErrorPayload('Control payload too short (minimum 1 byte required)', payload, options);
            }
            const rawFlags = payload[0];
            const subType = rawFlags & 0xF0; // upper 4 bits
            switch (subType) {
                case enums_1.ControlSubType.NodeDiscoverReq:
                    return this.decodeDiscoverReq(payload, options);
                case enums_1.ControlSubType.NodeDiscoverResp:
                    return this.decodeDiscoverResp(payload, options);
                default:
                    return this.createErrorPayload(`Unknown control sub-type: 0x${subType.toString(16).padStart(2, '0')}`, payload, options);
            }
        }
        catch (error) {
            return this.createErrorPayload(error instanceof Error ? error.message : 'Failed to decode control payload', payload, options);
        }
    }
    static decodeDiscoverReq(payload, options) {
        const segments = [];
        const segmentOffset = options?.segmentOffset ?? 0;
        // Minimum size: flags(1) + type_filter(1) + tag(4) = 6 bytes
        if (payload.length < 6) {
            const result = {
                type: enums_1.PayloadType.Control,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: ['DISCOVER_REQ payload too short (minimum 6 bytes required)'],
                subType: enums_1.ControlSubType.NodeDiscoverReq,
                rawFlags: payload[0],
                prefixOnly: false,
                typeFilter: 0,
                typeFilterNames: [],
                tag: 0,
                since: 0
            };
            if (options?.includeSegments) {
                result.segments = [{
                        name: 'Invalid DISCOVER_REQ Data',
                        description: 'DISCOVER_REQ payload too short (minimum 6 bytes required)',
                        startByte: segmentOffset,
                        endByte: segmentOffset + payload.length - 1,
                        value: (0, hex_1.bytesToHex)(payload)
                    }];
            }
            return result;
        }
        let offset = 0;
        // Byte 0: flags - upper 4 bits is sub_type (0x8), lowest bit is prefix_only
        const rawFlags = payload[offset];
        const prefixOnly = (rawFlags & 0x01) !== 0;
        if (options?.includeSegments) {
            segments.push({
                name: 'Flags',
                description: `Sub-type: DISCOVER_REQ (0x8) | Prefix Only: ${prefixOnly}`,
                startByte: segmentOffset + offset,
                endByte: segmentOffset + offset,
                value: rawFlags.toString(16).padStart(2, '0').toUpperCase()
            });
        }
        offset += 1;
        // Byte 1: type_filter - bit for each ADV_TYPE_*
        const typeFilter = payload[offset];
        const typeFilterNames = this.parseTypeFilter(typeFilter);
        if (options?.includeSegments) {
            segments.push({
                name: 'Type Filter',
                description: `Filter mask: 0b${typeFilter.toString(2).padStart(8, '0')} | Types: ${typeFilterNames.length > 0 ? typeFilterNames.join(', ') : 'None'}`,
                startByte: segmentOffset + offset,
                endByte: segmentOffset + offset,
                value: typeFilter.toString(16).padStart(2, '0').toUpperCase()
            });
        }
        offset += 1;
        // Bytes 2-5: tag (uint32, little endian)
        const tag = this.readUint32LE(payload, offset);
        if (options?.includeSegments) {
            segments.push({
                name: 'Tag',
                description: `Random tag for response matching: 0x${tag.toString(16).padStart(8, '0')}`,
                startByte: segmentOffset + offset,
                endByte: segmentOffset + offset + 3,
                value: (0, hex_1.bytesToHex)(payload.slice(offset, offset + 4))
            });
        }
        offset += 4;
        // Optional: Bytes 6-9: since (uint32, little endian) - epoch timestamp
        let since = 0;
        if (payload.length >= offset + 4) {
            since = this.readUint32LE(payload, offset);
            if (options?.includeSegments) {
                const sinceDate = since > 0 ? new Date(since * 1000).toISOString().slice(0, 19) + 'Z' : 'N/A';
                segments.push({
                    name: 'Since',
                    description: `Filter timestamp: ${since} (${sinceDate})`,
                    startByte: segmentOffset + offset,
                    endByte: segmentOffset + offset + 3,
                    value: (0, hex_1.bytesToHex)(payload.slice(offset, offset + 4))
                });
            }
        }
        const result = {
            type: enums_1.PayloadType.Control,
            version: enums_1.PayloadVersion.Version1,
            isValid: true,
            subType: enums_1.ControlSubType.NodeDiscoverReq,
            rawFlags,
            prefixOnly,
            typeFilter,
            typeFilterNames,
            tag,
            since
        };
        if (options?.includeSegments) {
            result.segments = segments;
        }
        return result;
    }
    static decodeDiscoverResp(payload, options) {
        const segments = [];
        const segmentOffset = options?.segmentOffset ?? 0;
        // Minimum size: flags(1) + snr(1) + tag(4) + pubkey(8 for prefix) = 14 bytes
        if (payload.length < 14) {
            const result = {
                type: enums_1.PayloadType.Control,
                version: enums_1.PayloadVersion.Version1,
                isValid: false,
                errors: ['DISCOVER_RESP payload too short (minimum 14 bytes required)'],
                subType: enums_1.ControlSubType.NodeDiscoverResp,
                rawFlags: payload.length > 0 ? payload[0] : 0,
                nodeType: enums_1.DeviceRole.Unknown,
                nodeTypeName: 'Unknown',
                snr: 0,
                tag: 0,
                publicKey: '',
                publicKeyLength: 0
            };
            if (options?.includeSegments) {
                result.segments = [{
                        name: 'Invalid DISCOVER_RESP Data',
                        description: 'DISCOVER_RESP payload too short (minimum 14 bytes required)',
                        startByte: segmentOffset,
                        endByte: segmentOffset + payload.length - 1,
                        value: (0, hex_1.bytesToHex)(payload)
                    }];
            }
            return result;
        }
        let offset = 0;
        // Byte 0: flags - upper 4 bits is sub_type (0x9), lower 4 bits is node_type
        const rawFlags = payload[offset];
        const nodeType = (rawFlags & 0x0F);
        const nodeTypeName = (0, enum_names_1.getDeviceRoleName)(nodeType);
        if (options?.includeSegments) {
            segments.push({
                name: 'Flags',
                description: `Sub-type: DISCOVER_RESP (0x9) | Node Type: ${nodeTypeName}`,
                startByte: segmentOffset + offset,
                endByte: segmentOffset + offset,
                value: rawFlags.toString(16).padStart(2, '0').toUpperCase()
            });
        }
        offset += 1;
        // Byte 1: snr (signed int8, represents SNR * 4)
        const snrRaw = payload[offset];
        const snrSigned = snrRaw > 127 ? snrRaw - 256 : snrRaw;
        const snr = snrSigned / 4.0;
        if (options?.includeSegments) {
            segments.push({
                name: 'SNR',
                description: `Inbound SNR: ${snr.toFixed(2)} dB (raw: ${snrRaw}, signed: ${snrSigned})`,
                startByte: segmentOffset + offset,
                endByte: segmentOffset + offset,
                value: snrRaw.toString(16).padStart(2, '0').toUpperCase()
            });
        }
        offset += 1;
        // Bytes 2-5: tag (uint32, little endian) - reflected from request
        const tag = this.readUint32LE(payload, offset);
        if (options?.includeSegments) {
            segments.push({
                name: 'Tag',
                description: `Reflected tag from request: 0x${tag.toString(16).padStart(8, '0')}`,
                startByte: segmentOffset + offset,
                endByte: segmentOffset + offset + 3,
                value: (0, hex_1.bytesToHex)(payload.slice(offset, offset + 4))
            });
        }
        offset += 4;
        // Remaining bytes: public key (8 bytes for prefix, 32 bytes for full)
        const remainingBytes = payload.length - offset;
        const publicKeyLength = remainingBytes;
        const publicKeyBytes = payload.slice(offset, offset + publicKeyLength);
        const publicKey = (0, hex_1.bytesToHex)(publicKeyBytes);
        if (options?.includeSegments) {
            const keyType = publicKeyLength === 32 ? 'Full Public Key' : 'Public Key Prefix';
            segments.push({
                name: keyType,
                description: `${keyType} (${publicKeyLength} bytes)`,
                startByte: segmentOffset + offset,
                endByte: segmentOffset + offset + publicKeyLength - 1,
                value: publicKey
            });
        }
        const result = {
            type: enums_1.PayloadType.Control,
            version: enums_1.PayloadVersion.Version1,
            isValid: true,
            subType: enums_1.ControlSubType.NodeDiscoverResp,
            rawFlags,
            nodeType,
            nodeTypeName,
            snr,
            tag,
            publicKey,
            publicKeyLength
        };
        if (options?.includeSegments) {
            result.segments = segments;
        }
        return result;
    }
    static parseTypeFilter(filter) {
        const types = [];
        if (filter & (1 << enums_1.DeviceRole.ChatNode))
            types.push('Chat');
        if (filter & (1 << enums_1.DeviceRole.Repeater))
            types.push('Repeater');
        if (filter & (1 << enums_1.DeviceRole.RoomServer))
            types.push('Room');
        if (filter & (1 << enums_1.DeviceRole.Sensor))
            types.push('Sensor');
        return types;
    }
    static createErrorPayload(error, payload, options) {
        const result = {
            type: enums_1.PayloadType.Control,
            version: enums_1.PayloadVersion.Version1,
            isValid: false,
            errors: [error],
            subType: enums_1.ControlSubType.NodeDiscoverReq,
            rawFlags: payload.length > 0 ? payload[0] : 0,
            prefixOnly: false,
            typeFilter: 0,
            typeFilterNames: [],
            tag: 0,
            since: 0
        };
        if (options?.includeSegments) {
            result.segments = [{
                    name: 'Invalid Control Data',
                    description: error,
                    startByte: options.segmentOffset ?? 0,
                    endByte: (options.segmentOffset ?? 0) + payload.length - 1,
                    value: (0, hex_1.bytesToHex)(payload)
                }];
        }
        return result;
    }
    static readUint32LE(buffer, offset) {
        return (buffer[offset] |
            (buffer[offset + 1] << 8) |
            (buffer[offset + 2] << 16) |
            (buffer[offset + 3] << 24)) >>> 0; // >>> 0 to ensure unsigned
    }
}
exports.ControlPayloadDecoder = ControlPayloadDecoder;
//# sourceMappingURL=control.js.map