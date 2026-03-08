"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ed25519SignatureVerifier = void 0;
const ed25519 = __importStar(require("@noble/ed25519"));
const hex_1 = require("../utils/hex");
const orlp_ed25519_wasm_1 = require("./orlp-ed25519-wasm");
// Cross-platform SHA-512 implementation
async function sha512Hash(data) {
    // Browser environment - use Web Crypto API
    if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.subtle) {
        const hashBuffer = await globalThis.crypto.subtle.digest('SHA-512', data);
        return new Uint8Array(hashBuffer);
    }
    // Node.js environment - use crypto module
    if (typeof require !== 'undefined') {
        try {
            const { createHash } = require('crypto');
            return createHash('sha512').update(data).digest();
        }
        catch (error) {
            // Fallback for environments where require is not available
        }
    }
    throw new Error('No SHA-512 implementation available');
}
function sha512HashSync(data) {
    // Node.js environment - use crypto module
    if (typeof require !== 'undefined') {
        try {
            const { createHash } = require('crypto');
            return createHash('sha512').update(data).digest();
        }
        catch (error) {
            // Fallback
        }
    }
    // Browser environment fallback - use crypto-js for sync operation
    try {
        const CryptoJS = require('crypto-js');
        const wordArray = CryptoJS.lib.WordArray.create(data);
        const hash = CryptoJS.SHA512(wordArray);
        const hashBytes = new Uint8Array(64);
        // Convert CryptoJS hash to Uint8Array
        for (let i = 0; i < 16; i++) {
            const word = hash.words[i] || 0;
            hashBytes[i * 4] = (word >>> 24) & 0xff;
            hashBytes[i * 4 + 1] = (word >>> 16) & 0xff;
            hashBytes[i * 4 + 2] = (word >>> 8) & 0xff;
            hashBytes[i * 4 + 3] = word & 0xff;
        }
        return hashBytes;
    }
    catch (error) {
        // Final fallback - this should not happen since crypto-js is a dependency
        throw new Error('No SHA-512 implementation available for synchronous operation');
    }
}
// Set up SHA-512 for @noble/ed25519
ed25519.etc.sha512Async = sha512Hash;
// Always set up sync version - @noble/ed25519 requires it
// It will throw in browser environments, which @noble/ed25519 can handle
try {
    ed25519.etc.sha512Sync = sha512HashSync;
}
catch (error) {
    console.debug('Could not set up synchronous SHA-512:', error);
}
class Ed25519SignatureVerifier {
    /**
     * Verify an Ed25519 signature for MeshCore advertisement packets
     *
     * According to MeshCore protocol, the signed message for advertisements is:
     * timestamp (4 bytes LE) + flags (1 byte) + location (8 bytes LE, if present) + name (variable, if present)
     */
    static async verifyAdvertisementSignature(publicKeyHex, signatureHex, timestamp, appDataHex) {
        try {
            // Convert hex strings to Uint8Arrays
            const publicKey = (0, hex_1.hexToBytes)(publicKeyHex);
            const signature = (0, hex_1.hexToBytes)(signatureHex);
            const appData = (0, hex_1.hexToBytes)(appDataHex);
            // Construct the signed message according to MeshCore format
            const message = this.constructAdvertSignedMessage(publicKeyHex, timestamp, appData);
            // Verify the signature using noble-ed25519
            return await ed25519.verify(signature, message, publicKey);
        }
        catch (error) {
            console.error('Ed25519 signature verification failed:', error);
            return false;
        }
    }
    /**
     * Construct the signed message for MeshCore advertisements
     * According to MeshCore source (Mesh.cpp lines 242-248):
     * Format: public_key (32 bytes) + timestamp (4 bytes LE) + app_data (variable length)
     */
    static constructAdvertSignedMessage(publicKeyHex, timestamp, appData) {
        const publicKey = (0, hex_1.hexToBytes)(publicKeyHex);
        // Timestamp (4 bytes, little-endian)
        const timestampBytes = new Uint8Array(4);
        timestampBytes[0] = timestamp & 0xFF;
        timestampBytes[1] = (timestamp >> 8) & 0xFF;
        timestampBytes[2] = (timestamp >> 16) & 0xFF;
        timestampBytes[3] = (timestamp >> 24) & 0xFF;
        // Concatenate: public_key + timestamp + app_data
        const message = new Uint8Array(32 + 4 + appData.length);
        message.set(publicKey, 0);
        message.set(timestampBytes, 32);
        message.set(appData, 36);
        return message;
    }
    /**
     * Get a human-readable description of what was signed
     */
    static getSignedMessageDescription(publicKeyHex, timestamp, appDataHex) {
        return `Public Key: ${publicKeyHex} + Timestamp: ${timestamp} (${new Date(timestamp * 1000).toISOString()}) + App Data: ${appDataHex}`;
    }
    /**
     * Get the hex representation of the signed message for debugging
     */
    static getSignedMessageHex(publicKeyHex, timestamp, appDataHex) {
        const appData = (0, hex_1.hexToBytes)(appDataHex);
        const message = this.constructAdvertSignedMessage(publicKeyHex, timestamp, appData);
        return (0, hex_1.bytesToHex)(message);
    }
    /**
     * Derive Ed25519 public key from orlp/ed25519 private key format
     * This implements the same algorithm as orlp/ed25519's ed25519_derive_pub()
     *
     * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
     * @returns 32-byte public key in hex format
     */
    static async derivePublicKey(privateKeyHex) {
        try {
            const privateKeyBytes = (0, hex_1.hexToBytes)(privateKeyHex);
            if (privateKeyBytes.length !== 64) {
                throw new Error(`Invalid private key length: expected 64 bytes, got ${privateKeyBytes.length}`);
            }
            // Use the orlp/ed25519 WebAssembly implementation
            return await (0, orlp_ed25519_wasm_1.derivePublicKey)(privateKeyHex);
        }
        catch (error) {
            throw new Error(`Failed to derive public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Derive Ed25519 public key from orlp/ed25519 private key format (synchronous version)
     * This implements the same algorithm as orlp/ed25519's ed25519_derive_pub()
     *
     * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
     * @returns 32-byte public key in hex format
     */
    static derivePublicKeySync(privateKeyHex) {
        try {
            const privateKeyBytes = (0, hex_1.hexToBytes)(privateKeyHex);
            if (privateKeyBytes.length !== 64) {
                throw new Error(`Invalid private key length: expected 64 bytes, got ${privateKeyBytes.length}`);
            }
            // Note: WASM operations are async, so this sync version throws an error
            throw new Error('Synchronous key derivation not supported with WASM. Use derivePublicKey() instead.');
        }
        catch (error) {
            throw new Error(`Failed to derive public key: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    /**
     * Validate that a private key correctly derives to the expected public key
     *
     * @param privateKeyHex - 64-byte private key in hex format
     * @param expectedPublicKeyHex - Expected 32-byte public key in hex format
     * @returns true if the private key derives to the expected public key
     */
    static async validateKeyPair(privateKeyHex, expectedPublicKeyHex) {
        try {
            return await (0, orlp_ed25519_wasm_1.validateKeyPair)(privateKeyHex, expectedPublicKeyHex);
        }
        catch (error) {
            return false;
        }
    }
}
exports.Ed25519SignatureVerifier = Ed25519SignatureVerifier;
//# sourceMappingURL=ed25519-verifier.js.map