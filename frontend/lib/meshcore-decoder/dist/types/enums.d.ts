export declare enum RouteType {
    TransportFlood = 0,
    Flood = 1,
    Direct = 2,
    TransportDirect = 3
}
export declare enum PayloadType {
    Request = 0,
    Response = 1,
    TextMessage = 2,
    Ack = 3,
    Advert = 4,
    GroupText = 5,
    GroupData = 6,
    AnonRequest = 7,
    Path = 8,
    Trace = 9,
    Multipart = 10,
    Control = 11,
    RawCustom = 15
}
export declare enum ControlSubType {
    NodeDiscoverReq = 128,
    NodeDiscoverResp = 144
}
export declare enum PayloadVersion {
    Version1 = 0,
    Version2 = 1,
    Version3 = 2,
    Version4 = 3
}
export declare enum DeviceRole {
    Unknown = 0,
    ChatNode = 1,
    Repeater = 2,
    RoomServer = 3,
    Sensor = 4
}
export declare enum AdvertFlags {
    HasLocation = 16,
    HasFeature1 = 32,
    HasFeature2 = 64,
    HasName = 128
}
export declare enum RequestType {
    GetStats = 1,
    Keepalive = 2,// deprecated
    GetTelemetryData = 3,
    GetMinMaxAvgData = 4,
    GetAccessList = 5
}
//# sourceMappingURL=enums.d.ts.map