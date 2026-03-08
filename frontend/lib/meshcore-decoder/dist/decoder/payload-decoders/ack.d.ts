import { AckPayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class AckPayloadDecoder {
    static decode(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): AckPayload & {
        segments?: PayloadSegment[];
    } | null;
}
//# sourceMappingURL=ack.d.ts.map