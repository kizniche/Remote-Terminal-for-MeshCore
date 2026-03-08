import { DecryptionResult } from '../types/crypto';
export declare class ChannelCrypto {
    /**
     * Decrypt GroupText message using MeshCore algorithm:
     * - HMAC-SHA256 verification with 2-byte MAC
     * - AES-128 ECB decryption
     */
    static decryptGroupTextMessage(ciphertext: string, cipherMac: string, channelKey: string): DecryptionResult;
    /**
     * Calculate MeshCore channel hash from secret key
     * Returns the first byte of SHA256(secret) as hex string
     */
    static calculateChannelHash(secretKeyHex: string): string;
}
//# sourceMappingURL=channel-crypto.d.ts.map