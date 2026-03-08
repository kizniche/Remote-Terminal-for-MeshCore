import { RequestPayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class RequestPayloadDecoder {
    static decode(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): RequestPayload & {
        segments?: PayloadSegment[];
    } | null;
}
//# sourceMappingURL=request.d.ts.map