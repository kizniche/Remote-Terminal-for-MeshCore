import { TextMessagePayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
export declare class TextMessagePayloadDecoder {
    static decode(payload: Uint8Array, options?: {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): TextMessagePayload & {
        segments?: PayloadSegment[];
    } | null;
}
//# sourceMappingURL=text-message.d.ts.map