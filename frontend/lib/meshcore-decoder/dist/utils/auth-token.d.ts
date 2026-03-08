/**
 * JWT-style token payload for MeshCore authentication
 */
export interface AuthTokenPayload {
    /** Public key of the signer (32 bytes hex) */
    publicKey: string;
    /** Unix timestamp when token was issued */
    iat: number;
    /** Unix timestamp when token expires (optional) */
    exp?: number;
    /** Audience claim (optional) */
    aud?: string;
    /** Custom claims */
    [key: string]: any;
}
/**
 * Encoded auth token structure
 */
export interface AuthToken {
    /** Base64url-encoded header */
    header: string;
    /** Base64url-encoded payload */
    payload: string;
    /** Hex-encoded Ed25519 signature */
    signature: string;
}
/**
 * Create a signed authentication token
 *
 * @param payload - Token payload containing claims
 * @param privateKeyHex - 64-byte private key in hex format (orlp/ed25519 format)
 * @param publicKeyHex - 32-byte public key in hex format
 * @returns JWT-style token string in format: header.payload.signature
 */
export declare function createAuthToken(payload: AuthTokenPayload, privateKeyHex: string, publicKeyHex: string): Promise<string>;
/**
 * Verify and decode an authentication token
 *
 * @param token - JWT-style token string
 * @param expectedPublicKeyHex - Expected public key in hex format (optional, will check against payload if provided)
 * @returns Decoded payload if valid, null if invalid
 */
export declare function verifyAuthToken(token: string, expectedPublicKeyHex?: string): Promise<AuthTokenPayload | null>;
/**
 * Parse a token without verifying (useful for debugging)
 *
 * @param token - JWT-style token string
 * @returns Parsed token structure or null if invalid format
 */
export declare function parseAuthToken(token: string): AuthToken | null;
/**
 * Decode token payload without verification (useful for debugging)
 *
 * @param token - JWT-style token string
 * @returns Decoded payload or null if invalid format
 */
export declare function decodeAuthTokenPayload(token: string): AuthTokenPayload | null;
//# sourceMappingURL=auth-token.d.ts.map