import { ControlPayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class ControlPayloadDecoder {
    static decode(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): (ControlPayload & {
        segments?: PayloadSegment[];
    }) | null;
    private static decodeDiscoverReq;
    private static decodeDiscoverResp;
    private static parseTypeFilter;
    private static createErrorPayload;
    private static readUint32LE;
}
//# sourceMappingURL=control.d.ts.map