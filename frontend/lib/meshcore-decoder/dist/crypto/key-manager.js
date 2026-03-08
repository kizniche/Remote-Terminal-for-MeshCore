"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeshCoreKeyStore = void 0;
const channel_crypto_1 = require("./channel-crypto");
class MeshCoreKeyStore {
    constructor(initialKeys) {
        this.nodeKeys = new Map();
        // internal map for hash -> multiple keys (collision handling)
        this.channelHashToKeys = new Map();
        if (initialKeys?.channelSecrets) {
            this.addChannelSecrets(initialKeys.channelSecrets);
        }
        if (initialKeys?.nodeKeys) {
            Object.entries(initialKeys.nodeKeys).forEach(([pubKey, privKey]) => {
                this.addNodeKey(pubKey, privKey);
            });
        }
    }
    addNodeKey(publicKey, privateKey) {
        const normalizedPubKey = publicKey.toUpperCase();
        this.nodeKeys.set(normalizedPubKey, privateKey);
    }
    hasChannelKey(channelHash) {
        const normalizedHash = channelHash.toLowerCase();
        return this.channelHashToKeys.has(normalizedHash);
    }
    hasNodeKey(publicKey) {
        const normalizedPubKey = publicKey.toUpperCase();
        return this.nodeKeys.has(normalizedPubKey);
    }
    /**
     * Get all channel keys that match the given channel hash (handles collisions)
     */
    getChannelKeys(channelHash) {
        const normalizedHash = channelHash.toLowerCase();
        return this.channelHashToKeys.get(normalizedHash) || [];
    }
    getNodeKey(publicKey) {
        const normalizedPubKey = publicKey.toUpperCase();
        return this.nodeKeys.get(normalizedPubKey);
    }
    /**
     * Add channel keys by secret keys (new simplified API)
     * Automatically calculates channel hashes
     */
    addChannelSecrets(secretKeys) {
        for (const secretKey of secretKeys) {
            const channelHash = channel_crypto_1.ChannelCrypto.calculateChannelHash(secretKey).toLowerCase();
            // Handle potential hash collisions
            if (!this.channelHashToKeys.has(channelHash)) {
                this.channelHashToKeys.set(channelHash, []);
            }
            this.channelHashToKeys.get(channelHash).push(secretKey);
        }
    }
}
exports.MeshCoreKeyStore = MeshCoreKeyStore;
//# sourceMappingURL=key-manager.js.map