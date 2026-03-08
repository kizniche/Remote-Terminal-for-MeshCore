"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChannelCrypto = void 0;
const crypto_js_1 = require("crypto-js");
const hex_1 = require("../utils/hex");
class ChannelCrypto {
    /**
     * Decrypt GroupText message using MeshCore algorithm:
     * - HMAC-SHA256 verification with 2-byte MAC
     * - AES-128 ECB decryption
     */
    static decryptGroupTextMessage(ciphertext, cipherMac, channelKey) {
        try {
            // convert hex strings to byte arrays
            const channelKey16 = (0, hex_1.hexToBytes)(channelKey);
            const macBytes = (0, hex_1.hexToBytes)(cipherMac);
            // MeshCore uses 32-byte channel secret: 16-byte key + 16 zero bytes
            const channelSecret = new Uint8Array(32);
            channelSecret.set(channelKey16, 0);
            // Step 1: Verify HMAC-SHA256 using full 32-byte channel secret
            const calculatedMac = (0, crypto_js_1.HmacSHA256)(crypto_js_1.enc.Hex.parse(ciphertext), crypto_js_1.enc.Hex.parse((0, hex_1.bytesToHex)(channelSecret)));
            const calculatedMacBytes = (0, hex_1.hexToBytes)(calculatedMac.toString(crypto_js_1.enc.Hex));
            const calculatedMacFirst2 = calculatedMacBytes.slice(0, 2);
            if (calculatedMacFirst2[0] !== macBytes[0] || calculatedMacFirst2[1] !== macBytes[1]) {
                return { success: false, error: 'MAC verification failed' };
            }
            // Step 2: Decrypt using AES-128 ECB with first 16 bytes of channel secret
            const keyWords = crypto_js_1.enc.Hex.parse(channelKey);
            const ciphertextWords = crypto_js_1.enc.Hex.parse(ciphertext);
            const decrypted = crypto_js_1.AES.decrypt(crypto_js_1.lib.CipherParams.create({ ciphertext: ciphertextWords }), keyWords, { mode: crypto_js_1.mode.ECB, padding: crypto_js_1.pad.NoPadding });
            const decryptedBytes = (0, hex_1.hexToBytes)(decrypted.toString(crypto_js_1.enc.Hex));
            if (!decryptedBytes || decryptedBytes.length < 5) {
                return { success: false, error: 'Decrypted content too short' };
            }
            // parse MeshCore format: timestamp(4) + flags(1) + message_text
            const timestamp = decryptedBytes[0] |
                (decryptedBytes[1] << 8) |
                (decryptedBytes[2] << 16) |
                (decryptedBytes[3] << 24);
            const flagsAndAttempt = decryptedBytes[4];
            // extract message text with UTF-8 decoding
            const messageBytes = decryptedBytes.slice(5);
            const decoder = new TextDecoder('utf-8');
            let messageText = decoder.decode(messageBytes);
            // remove null terminator if present
            const nullIndex = messageText.indexOf('\0');
            if (nullIndex >= 0) {
                messageText = messageText.substring(0, nullIndex);
            }
            // parse sender and message (format: "sender: message")
            const colonIndex = messageText.indexOf(': ');
            let sender;
            let content;
            if (colonIndex > 0 && colonIndex < 50) {
                const potentialSender = messageText.substring(0, colonIndex);
                if (!/[:\[\]]/.test(potentialSender)) {
                    sender = potentialSender;
                    content = messageText.substring(colonIndex + 2);
                }
                else {
                    content = messageText;
                }
            }
            else {
                content = messageText;
            }
            return {
                success: true,
                data: {
                    timestamp,
                    flags: flagsAndAttempt,
                    sender,
                    message: content
                }
            };
        }
        catch (error) {
            return { success: false, error: error instanceof Error ? error.message : 'Decryption failed' };
        }
    }
    /**
     * Calculate MeshCore channel hash from secret key
     * Returns the first byte of SHA256(secret) as hex string
     */
    static calculateChannelHash(secretKeyHex) {
        const hash = (0, crypto_js_1.SHA256)(crypto_js_1.enc.Hex.parse(secretKeyHex));
        const hashBytes = (0, hex_1.hexToBytes)(hash.toString(crypto_js_1.enc.Hex));
        return hashBytes[0].toString(16).padStart(2, '0');
    }
}
exports.ChannelCrypto = ChannelCrypto;
//# sourceMappingURL=channel-crypto.js.map