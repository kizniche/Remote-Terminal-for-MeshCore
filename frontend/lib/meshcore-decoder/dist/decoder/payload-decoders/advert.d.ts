import { AdvertPayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class AdvertPayloadDecoder {
    static decode(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): AdvertPayload & {
        segments?: PayloadSegment[];
    } | null;
    /**
     * Decode advertisement payload with signature verification
     */
    static decodeWithVerification(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): Promise<AdvertPayload & {
        segments?: PayloadSegment[];
    } | null>;
    private static parseDeviceRole;
    private static readUint32LE;
    private static readInt32LE;
    private static sanitizeControlCharacters;
}
//# sourceMappingURL=advert.d.ts.map