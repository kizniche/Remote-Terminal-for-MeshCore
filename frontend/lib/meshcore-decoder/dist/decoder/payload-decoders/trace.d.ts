import { TracePayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class TracePayloadDecoder {
    static decode(payload: Uint8Array, pathData?: string[] | null, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): TracePayload & {
        segments?: PayloadSegment[];
    } | null;
    private static readUint32LE;
}
//# sourceMappingURL=trace.d.ts.map