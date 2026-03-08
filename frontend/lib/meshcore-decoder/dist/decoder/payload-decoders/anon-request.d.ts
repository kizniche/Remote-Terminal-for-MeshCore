import { AnonRequestPayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class AnonRequestPayloadDecoder {
    static decode(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): AnonRequestPayload & {
        segments?: PayloadSegment[];
    } | null;
}
//# sourceMappingURL=anon-request.d.ts.map