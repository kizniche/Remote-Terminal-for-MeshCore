import { CryptoKeyStore } from '../types/crypto';
export declare class MeshCoreKeyStore implements CryptoKeyStore {
    nodeKeys: Map<string, string>;
    private channelHashToKeys;
    constructor(initialKeys?: {
        channelSecrets?: string[];
        nodeKeys?: Record<string, string>;
    });
    addNodeKey(publicKey: string, privateKey: string): void;
    hasChannelKey(channelHash: string): boolean;
    hasNodeKey(publicKey: string): boolean;
    /**
     * Get all channel keys that match the given channel hash (handles collisions)
     */
    getChannelKeys(channelHash: string): string[];
    getNodeKey(publicKey: string): string | undefined;
    /**
     * Add channel keys by secret keys (new simplified API)
     * Automatically calculates channel hashes
     */
    addChannelSecrets(secretKeys: string[]): void;
}
//# sourceMappingURL=key-manager.d.ts.map