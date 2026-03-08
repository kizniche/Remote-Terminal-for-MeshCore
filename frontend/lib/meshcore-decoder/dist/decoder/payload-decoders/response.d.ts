import { ResponsePayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class ResponsePayloadDecoder {
    static decode(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): ResponsePayload & {
        segments?: PayloadSegment[];
    } | null;
}
//# sourceMappingURL=response.d.ts.map