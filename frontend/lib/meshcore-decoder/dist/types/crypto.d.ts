export interface CryptoKeyStore {
    nodeKeys: Map<string, string>;
    addNodeKey(publicKey: string, privateKey: string): void;
    hasChannelKey(channelHash: string): boolean;
    hasNodeKey(publicKey: string): boolean;
    getChannelKeys(channelHash: string): string[];
}
export interface DecryptionOptions {
    keyStore?: CryptoKeyStore;
    attemptDecryption?: boolean;
    includeRawCiphertext?: boolean;
}
export interface DecryptionResult {
    success: boolean;
    data?: any;
    error?: string;
}
export interface ValidationResult {
    isValid: boolean;
    errors?: string[];
}
//# sourceMappingURL=crypto.d.ts.map