import { GroupTextPayload } from '../../types/payloads';
import { PayloadSegment } from '../../types/packet';
import { DecryptionOptions } from '../../types/crypto';
export declare class GroupTextPayloadDecoder {
    static decode(payload: Uint8Array, options?: DecryptionOptions & {
        includeSegments?: boolean;
        segmentOffset?: number;
    }): GroupTextPayload & {
        segments?: PayloadSegment[];
    } | null;
}
//# sourceMappingURL=group-text.d.ts.map