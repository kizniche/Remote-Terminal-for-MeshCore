import { DecodedPacket, PacketStructure } from '../types/packet';
import { DecryptionOptions, ValidationResult, CryptoKeyStore } from '../types/crypto';
export declare class MeshCorePacketDecoder {
    /**
     * Decode a raw packet from hex string
     */
    static decode(hexData: string, options?: DecryptionOptions): DecodedPacket;
    /**
     * Decode a raw packet from hex string with signature verification for advertisements
     */
    static decodeWithVerification(hexData: string, options?: DecryptionOptions): Promise<DecodedPacket>;
    /**
     * Analyze packet structure for detailed breakdown
     */
    static analyzeStructure(hexData: string, options?: DecryptionOptions): PacketStructure;
    /**
     * Analyze packet structure for detailed breakdown with signature verification for advertisements
     */
    static analyzeStructureWithVerification(hexData: string, options?: DecryptionOptions): Promise<PacketStructure>;
    /**
     * Internal unified parsing method
     */
    private static parseInternal;
    /**
     * Internal unified parsing method with signature verification for advertisements
     */
    private static parseInternalAsync;
    /**
     * Validate packet format without full decoding
     */
    static validate(hexData: string): ValidationResult;
    /**
     * Calculate message hash for a packet
     */
    static calculateMessageHash(bytes: Uint8Array, routeType: number, payloadType: number, payloadVersion: number): string;
    /**
     * Create a key store for decryption
     */
    static createKeyStore(initialKeys?: {
        channelSecrets?: string[];
        nodeKeys?: Record<string, string>;
    }): CryptoKeyStore;
    /**
     * Decode a path_len byte into hash size, hop count, and total byte length.
     * Firmware reference: Packet.h lines 79-83
     *   Bits 7:6 = hash size selector: (path_len >> 6) + 1 = 1, 2, or 3 bytes per hop
     *   Bits 5:0 = hop count (0-63)
     */
    private static decodePathLenByte;
}
//# sourceMappingURL=packet-decoder.d.ts.map