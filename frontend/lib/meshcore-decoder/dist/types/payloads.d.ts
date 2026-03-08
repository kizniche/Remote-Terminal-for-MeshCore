import { PayloadType, PayloadVersion, DeviceRole, RequestType, ControlSubType } from './enums';
export interface BasePayload {
    type: PayloadType;
    version: PayloadVersion;
    isValid: boolean;
    errors?: string[];
}
export interface AdvertPayload extends BasePayload {
    publicKey: string;
    timestamp: number;
    signature: string;
    signatureValid?: boolean;
    signatureError?: string;
    appData: {
        flags: number;
        deviceRole: DeviceRole;
        hasLocation: boolean;
        hasName: boolean;
        location?: {
            latitude: number;
            longitude: number;
        };
        name?: string;
    };
}
export interface TracePayload extends BasePayload {
    traceTag: string;
    authCode: number;
    flags: number;
    pathHashes: string[];
    snrValues?: number[];
}
export interface GroupTextPayload extends BasePayload {
    channelHash: string;
    cipherMac: string;
    ciphertext: string;
    ciphertextLength: number;
    decrypted?: {
        timestamp: number;
        flags: number;
        sender?: string;
        message: string;
    };
}
export interface RequestPayload extends BasePayload {
    destinationHash: string;
    sourceHash: string;
    cipherMac: string;
    ciphertext: string;
    timestamp: number;
    requestType: RequestType;
    requestData?: string;
    decrypted?: {
        timestamp: number;
        requestType: RequestType;
        requestData?: string;
    };
}
export interface TextMessagePayload extends BasePayload {
    destinationHash: string;
    sourceHash: string;
    cipherMac: string;
    ciphertext: string;
    ciphertextLength: number;
    decrypted?: {
        timestamp: number;
        flags: number;
        attempt: number;
        message: string;
    };
}
export interface AnonRequestPayload extends BasePayload {
    destinationHash: string;
    senderPublicKey: string;
    cipherMac: string;
    ciphertext: string;
    ciphertextLength: number;
    decrypted?: {
        timestamp: number;
        syncTimestamp?: number;
        password: string;
    };
}
export interface AckPayload extends BasePayload {
    checksum: string;
}
export interface PathPayload extends BasePayload {
    pathLength: number;
    pathHashSize?: number;
    pathHashes: string[];
    extraType: number;
    extraData: string;
}
export interface ResponsePayload extends BasePayload {
    destinationHash: string;
    sourceHash: string;
    cipherMac: string;
    ciphertext: string;
    ciphertextLength: number;
    decrypted?: {
        tag: number;
        content: string;
    };
}
export interface ControlPayloadBase extends BasePayload {
    subType: ControlSubType;
    rawFlags: number;
}
export interface ControlDiscoverReqPayload extends ControlPayloadBase {
    subType: ControlSubType.NodeDiscoverReq;
    prefixOnly: boolean;
    typeFilter: number;
    typeFilterNames: string[];
    tag: number;
    since: number;
}
export interface ControlDiscoverRespPayload extends ControlPayloadBase {
    subType: ControlSubType.NodeDiscoverResp;
    nodeType: DeviceRole;
    nodeTypeName: string;
    snr: number;
    tag: number;
    publicKey: string;
    publicKeyLength: number;
}
export type ControlPayload = ControlDiscoverReqPayload | ControlDiscoverRespPayload;
export type PayloadData = AdvertPayload | TracePayload | GroupTextPayload | RequestPayload | TextMessagePayload | AnonRequestPayload | AckPayload | PathPayload | ResponsePayload | ControlPayload;
//# sourceMappingURL=payloads.d.ts.map