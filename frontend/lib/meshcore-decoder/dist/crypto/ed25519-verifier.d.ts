export declare class Ed25519SignatureVerifier {
    /**
     * Verify an Ed25519 signature for MeshCore advertisement packets
     *
     * According to MeshCore protocol, the signed message for advertisements is:
     * timestamp (4 bytes LE) + flags (1 byte) + location (8 bytes LE, if present) + name (variable, if present)
     */
    static verifyAdvertisementSignature(publicKeyHex: string, signatureHex: string, timestamp: number, appDataHex: string): Promise<boolean>;
    /**
     * Construct the signed message for MeshCore advertisements
     * According to MeshCore source (Mesh.cpp lines 242-248):
     * Format: public_key (32 bytes) + timestamp (4 bytes LE) + app_data (variable length)
     */
    private static constructAdvertSignedMessage;
    /**
     * Get a human-readable description of what was signed
     */
    static getSignedMessageDescription(publicKeyHex: string, timestamp: number, appDataHex: string): string;
    /**
     * Get the hex representation of the signed message for debugging
     */
    static getSignedMessageHex(publicKeyHex: string, timestamp: number, appDataHex: string): string;
    /**
     * Derive Ed25519 public key from orlp/ed25519 private key format
     * This implements the same algorithm as orlp/ed25519's ed25519_derive_pub()
     *
     * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
     * @returns 32-byte public key in hex format
     */
    static derivePublicKey(privateKeyHex: string): Promise<string>;
    /**
     * Derive Ed25519 public key from orlp/ed25519 private key format (synchronous version)
     * This implements the same algorithm as orlp/ed25519's ed25519_derive_pub()
     *
     * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
     * @returns 32-byte public key in hex format
     */
    static derivePublicKeySync(privateKeyHex: string): string;
    /**
     * Validate that a private key correctly derives to the expected public key
     *
     * @param privateKeyHex - 64-byte private key in hex format
     * @param expectedPublicKeyHex - Expected 32-byte public key in hex format
     * @returns true if the private key derives to the expected public key
     */
    static validateKeyPair(privateKeyHex: string, expectedPublicKeyHex: string): Promise<boolean>;
}
//# sourceMappingURL=ed25519-verifier.d.ts.map