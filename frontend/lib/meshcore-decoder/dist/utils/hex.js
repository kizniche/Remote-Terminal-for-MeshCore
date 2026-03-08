"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.byteToHex = byteToHex;
exports.bytesToHex = bytesToHex;
exports.numberToHex = numberToHex;
exports.hexToBytes = hexToBytes;
/**
 * Convert a single byte to uppercase hex string
 */
function byteToHex(byte) {
    return byte.toString(16).padStart(2, '0').toUpperCase();
}
/**
 * Convert a Uint8Array to uppercase hex string
 */
function bytesToHex(bytes) {
    return Array.from(bytes).map(byteToHex).join('');
}
/**
 * Convert a number to uppercase hex string with specified padding
 */
function numberToHex(num, padLength = 8) {
    return (num >>> 0).toString(16).padStart(padLength, '0').toUpperCase();
}
/**
 * Convert hex string to Uint8Array
 */
function hexToBytes(hex) {
    // Remove any whitespace and convert to uppercase
    const cleanHex = hex.replace(/\s/g, '').toUpperCase();
    // Validate hex string
    if (!/^[0-9A-F]*$/.test(cleanHex)) {
        throw new Error(`Invalid hex string: invalid characters at position 0`);
    }
    if (cleanHex.length % 2 !== 0) {
        throw new Error('Invalid hex string: odd length');
    }
    const bytes = new Uint8Array(cleanHex.length / 2);
    for (let i = 0; i < cleanHex.length; i += 2) {
        bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
    }
    return bytes;
}
//# sourceMappingURL=hex.js.map