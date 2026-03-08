/**
 * Derive Ed25519 public key from private key using the exact orlp/ed25519 algorithm
 *
 * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
 * @returns 32-byte public key in hex format
 */
export declare function derivePublicKey(privateKeyHex: string): Promise<string>;
/**
 * Validate that a private key and public key pair match using orlp/ed25519
 *
 * @param privateKeyHex - 64-byte private key in hex format
 * @param expectedPublicKeyHex - 32-byte public key in hex format
 * @returns true if the keys match, false otherwise
 */
export declare function validateKeyPair(privateKeyHex: string, expectedPublicKeyHex: string): Promise<boolean>;
/**
 * Sign a message using Ed25519 with orlp/ed25519 implementation
 *
 * @param messageHex - Message to sign in hex format
 * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
 * @param publicKeyHex - 32-byte public key in hex format
 * @returns 64-byte signature in hex format
 */
export declare function sign(messageHex: string, privateKeyHex: string, publicKeyHex: string): Promise<string>;
/**
 * Verify an Ed25519 signature using orlp/ed25519 implementation
 *
 * @param signatureHex - 64-byte signature in hex format
 * @param messageHex - Message that was signed in hex format
 * @param publicKeyHex - 32-byte public key in hex format
 * @returns true if signature is valid, false otherwise
 */
export declare function verify(signatureHex: string, messageHex: string, publicKeyHex: string): Promise<boolean>;
//# sourceMappingURL=orlp-ed25519-wasm.d.ts.map