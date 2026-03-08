"use strict";
// Reference: https://github.com/meshcore-dev/MeshCore/blob/main/docs/packet_structure.md
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestType = exports.AdvertFlags = exports.DeviceRole = exports.PayloadVersion = exports.ControlSubType = exports.PayloadType = exports.RouteType = void 0;
var RouteType;
(function (RouteType) {
    RouteType[RouteType["TransportFlood"] = 0] = "TransportFlood";
    RouteType[RouteType["Flood"] = 1] = "Flood";
    RouteType[RouteType["Direct"] = 2] = "Direct";
    RouteType[RouteType["TransportDirect"] = 3] = "TransportDirect";
})(RouteType || (exports.RouteType = RouteType = {}));
var PayloadType;
(function (PayloadType) {
    PayloadType[PayloadType["Request"] = 0] = "Request";
    PayloadType[PayloadType["Response"] = 1] = "Response";
    PayloadType[PayloadType["TextMessage"] = 2] = "TextMessage";
    PayloadType[PayloadType["Ack"] = 3] = "Ack";
    PayloadType[PayloadType["Advert"] = 4] = "Advert";
    PayloadType[PayloadType["GroupText"] = 5] = "GroupText";
    PayloadType[PayloadType["GroupData"] = 6] = "GroupData";
    PayloadType[PayloadType["AnonRequest"] = 7] = "AnonRequest";
    PayloadType[PayloadType["Path"] = 8] = "Path";
    PayloadType[PayloadType["Trace"] = 9] = "Trace";
    PayloadType[PayloadType["Multipart"] = 10] = "Multipart";
    PayloadType[PayloadType["Control"] = 11] = "Control";
    PayloadType[PayloadType["RawCustom"] = 15] = "RawCustom";
})(PayloadType || (exports.PayloadType = PayloadType = {}));
// Control packet sub-types (upper 4 bits of first payload byte)
var ControlSubType;
(function (ControlSubType) {
    ControlSubType[ControlSubType["NodeDiscoverReq"] = 128] = "NodeDiscoverReq";
    ControlSubType[ControlSubType["NodeDiscoverResp"] = 144] = "NodeDiscoverResp";
})(ControlSubType || (exports.ControlSubType = ControlSubType = {}));
var PayloadVersion;
(function (PayloadVersion) {
    PayloadVersion[PayloadVersion["Version1"] = 0] = "Version1";
    PayloadVersion[PayloadVersion["Version2"] = 1] = "Version2";
    PayloadVersion[PayloadVersion["Version3"] = 2] = "Version3";
    PayloadVersion[PayloadVersion["Version4"] = 3] = "Version4";
})(PayloadVersion || (exports.PayloadVersion = PayloadVersion = {}));
var DeviceRole;
(function (DeviceRole) {
    DeviceRole[DeviceRole["Unknown"] = 0] = "Unknown";
    DeviceRole[DeviceRole["ChatNode"] = 1] = "ChatNode";
    DeviceRole[DeviceRole["Repeater"] = 2] = "Repeater";
    DeviceRole[DeviceRole["RoomServer"] = 3] = "RoomServer";
    DeviceRole[DeviceRole["Sensor"] = 4] = "Sensor";
})(DeviceRole || (exports.DeviceRole = DeviceRole = {}));
var AdvertFlags;
(function (AdvertFlags) {
    AdvertFlags[AdvertFlags["HasLocation"] = 16] = "HasLocation";
    AdvertFlags[AdvertFlags["HasFeature1"] = 32] = "HasFeature1";
    AdvertFlags[AdvertFlags["HasFeature2"] = 64] = "HasFeature2";
    AdvertFlags[AdvertFlags["HasName"] = 128] = "HasName";
})(AdvertFlags || (exports.AdvertFlags = AdvertFlags = {}));
var RequestType;
(function (RequestType) {
    RequestType[RequestType["GetStats"] = 1] = "GetStats";
    RequestType[RequestType["Keepalive"] = 2] = "Keepalive";
    RequestType[RequestType["GetTelemetryData"] = 3] = "GetTelemetryData";
    RequestType[RequestType["GetMinMaxAvgData"] = 4] = "GetMinMaxAvgData";
    RequestType[RequestType["GetAccessList"] = 5] = "GetAccessList";
})(RequestType || (exports.RequestType = RequestType = {}));
//# sourceMappingURL=enums.js.map