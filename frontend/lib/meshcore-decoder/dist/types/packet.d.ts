import { RouteType, PayloadType, PayloadVersion } from './enums';
import { PayloadData } from './payloads';
export interface DecodedPacket {
    messageHash: string;
    routeType: RouteType;
    payloadType: PayloadType;
    payloadVersion: PayloadVersion;
    transportCodes?: [number, number];
    pathLength: number;
    pathHashSize?: number;
    path: string[] | null;
    payload: {
        raw: string;
        decoded: PayloadData | null;
    };
    totalBytes: number;
    isValid: boolean;
    errors?: string[];
}
export interface PacketStructure {
    segments: PacketSegment[];
    totalBytes: number;
    rawHex: string;
    messageHash: string;
    payload: {
        segments: PayloadSegment[];
        hex: string;
        startByte: number;
        type: string;
    };
}
export interface PacketSegment {
    name: string;
    description: string;
    startByte: number;
    endByte: number;
    value: string;
    headerBreakdown?: HeaderBreakdown;
}
export interface PayloadSegment {
    name: string;
    description: string;
    startByte: number;
    endByte: number;
    value: string;
    decryptedMessage?: string;
}
export interface HeaderBreakdown {
    fullBinary: string;
    fields: Array<{
        bits: string;
        field: string;
        value: string;
        binary: string;
    }>;
}
//# sourceMappingURL=packet.d.ts.map