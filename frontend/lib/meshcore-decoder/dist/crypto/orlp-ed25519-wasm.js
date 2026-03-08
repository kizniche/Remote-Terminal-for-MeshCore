"use strict";
// WebAssembly wrapper for orlp/ed25519 key derivation
// This provides the exact orlp algorithm for JavaScript
Object.defineProperty(exports, "__esModule", { value: true });
exports.derivePublicKey = derivePublicKey;
exports.validateKeyPair = validateKeyPair;
exports.sign = sign;
exports.verify = verify;
const hex_1 = require("../utils/hex");
// Import the generated WASM module
const OrlpEd25519 = require('../../lib/orlp-ed25519.js');
/**
 * Get a fresh WASM instance
 * Loads a fresh instance each time because the WASM module could behave unpredictably otherwise
 */
async function getWasmInstance() {
    return await OrlpEd25519();
}
/**
 * Derive Ed25519 public key from private key using the exact orlp/ed25519 algorithm
 *
 * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
 * @returns 32-byte public key in hex format
 */
async function derivePublicKey(privateKeyHex) {
    const wasmModule = await getWasmInstance();
    const privateKeyBytes = (0, hex_1.hexToBytes)(privateKeyHex);
    if (privateKeyBytes.length !== 64) {
        throw new Error(`Invalid private key length: expected 64 bytes, got ${privateKeyBytes.length}`);
    }
    // Allocate memory buffers directly in WASM heap
    const privateKeyPtr = 1024; // Use fixed memory locations
    const publicKeyPtr = 1024 + 64;
    // Copy private key to WASM memory
    wasmModule.HEAPU8.set(privateKeyBytes, privateKeyPtr);
    // Call the orlp key derivation function
    const result = wasmModule.ccall('orlp_derive_public_key', 'number', ['number', 'number'], [publicKeyPtr, privateKeyPtr]);
    if (result !== 0) {
        throw new Error('orlp key derivation failed: invalid private key');
    }
    // Read the public key from WASM memory
    const publicKeyBytes = new Uint8Array(32);
    publicKeyBytes.set(wasmModule.HEAPU8.subarray(publicKeyPtr, publicKeyPtr + 32));
    return (0, hex_1.bytesToHex)(publicKeyBytes);
}
/**
 * Validate that a private key and public key pair match using orlp/ed25519
 *
 * @param privateKeyHex - 64-byte private key in hex format
 * @param expectedPublicKeyHex - 32-byte public key in hex format
 * @returns true if the keys match, false otherwise
 */
async function validateKeyPair(privateKeyHex, expectedPublicKeyHex) {
    try {
        const wasmModule = await getWasmInstance();
        const privateKeyBytes = (0, hex_1.hexToBytes)(privateKeyHex);
        const expectedPublicKeyBytes = (0, hex_1.hexToBytes)(expectedPublicKeyHex);
        if (privateKeyBytes.length !== 64) {
            return false;
        }
        if (expectedPublicKeyBytes.length !== 32) {
            return false;
        }
        // Allocate memory buffers directly in WASM heap
        const privateKeyPtr = 2048; // Use different fixed memory locations
        const publicKeyPtr = 2048 + 64;
        // Copy keys to WASM memory
        wasmModule.HEAPU8.set(privateKeyBytes, privateKeyPtr);
        wasmModule.HEAPU8.set(expectedPublicKeyBytes, publicKeyPtr);
        // Call the validation function (note: C function expects public_key first, then private_key)
        const result = wasmModule.ccall('orlp_validate_keypair', 'number', ['number', 'number'], [publicKeyPtr, privateKeyPtr]);
        return result === 1;
    }
    catch (error) {
        // Invalid hex strings or other errors should return false
        return false;
    }
}
/**
 * Sign a message using Ed25519 with orlp/ed25519 implementation
 *
 * @param messageHex - Message to sign in hex format
 * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
 * @param publicKeyHex - 32-byte public key in hex format
 * @returns 64-byte signature in hex format
 */
async function sign(messageHex, privateKeyHex, publicKeyHex) {
    const wasmModule = await getWasmInstance();
    const messageBytes = (0, hex_1.hexToBytes)(messageHex);
    const privateKeyBytes = (0, hex_1.hexToBytes)(privateKeyHex);
    const publicKeyBytes = (0, hex_1.hexToBytes)(publicKeyHex);
    if (privateKeyBytes.length !== 64) {
        throw new Error(`Invalid private key length: expected 64 bytes, got ${privateKeyBytes.length}`);
    }
    if (publicKeyBytes.length !== 32) {
        throw new Error(`Invalid public key length: expected 32 bytes, got ${publicKeyBytes.length}`);
    }
    // Allocate memory buffers with large gaps to avoid conflicts with scratch space
    const messagePtr = 100000;
    const privateKeyPtr = 200000;
    const publicKeyPtr = 300000;
    const signaturePtr = 400000;
    // Copy data to WASM memory
    wasmModule.HEAPU8.set(messageBytes, messagePtr);
    wasmModule.HEAPU8.set(privateKeyBytes, privateKeyPtr);
    wasmModule.HEAPU8.set(publicKeyBytes, publicKeyPtr);
    // Call orlp_sign
    wasmModule.ccall('orlp_sign', 'void', ['number', 'number', 'number', 'number', 'number'], [signaturePtr, messagePtr, messageBytes.length, publicKeyPtr, privateKeyPtr]);
    // Read signature
    const signatureBytes = new Uint8Array(64);
    signatureBytes.set(wasmModule.HEAPU8.subarray(signaturePtr, signaturePtr + 64));
    return (0, hex_1.bytesToHex)(signatureBytes);
}
/**
 * Verify an Ed25519 signature using orlp/ed25519 implementation
 *
 * @param signatureHex - 64-byte signature in hex format
 * @param messageHex - Message that was signed in hex format
 * @param publicKeyHex - 32-byte public key in hex format
 * @returns true if signature is valid, false otherwise
 */
async function verify(signatureHex, messageHex, publicKeyHex) {
    try {
        const wasmModule = await getWasmInstance();
        const signatureBytes = (0, hex_1.hexToBytes)(signatureHex);
        const messageBytes = (0, hex_1.hexToBytes)(messageHex);
        const publicKeyBytes = (0, hex_1.hexToBytes)(publicKeyHex);
        if (signatureBytes.length !== 64) {
            return false;
        }
        if (publicKeyBytes.length !== 32) {
            return false;
        }
        // Allocate memory buffers with large gaps to avoid conflicts with scratch space
        const messagePtr = 500000;
        const signaturePtr = 600000;
        const publicKeyPtr = 700000;
        // Copy data to WASM memory
        wasmModule.HEAPU8.set(signatureBytes, signaturePtr);
        wasmModule.HEAPU8.set(messageBytes, messagePtr);
        wasmModule.HEAPU8.set(publicKeyBytes, publicKeyPtr);
        // Call the orlp verify function
        const result = wasmModule.ccall('orlp_verify', 'number', ['number', 'number', 'number', 'number'], [signaturePtr, messagePtr, messageBytes.length, publicKeyPtr]);
        return result === 1;
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=orlp-ed25519-wasm.js.map