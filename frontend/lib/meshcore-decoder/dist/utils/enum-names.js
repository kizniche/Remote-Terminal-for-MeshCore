"use strict";
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteTypeName = getRouteTypeName;
exports.getPayloadTypeName = getPayloadTypeName;
exports.getPayloadVersionName = getPayloadVersionName;
exports.getDeviceRoleName = getDeviceRoleName;
exports.getRequestTypeName = getRequestTypeName;
exports.getControlSubTypeName = getControlSubTypeName;
const enums_1 = require("../types/enums");
/**
 * Get human-readable name for RouteType enum value
 */
function getRouteTypeName(routeType) {
    switch (routeType) {
        case enums_1.RouteType.Flood: return 'Flood';
        case enums_1.RouteType.Direct: return 'Direct';
        case enums_1.RouteType.TransportFlood: return 'TransportFlood';
        case enums_1.RouteType.TransportDirect: return 'TransportDirect';
        default: return `Unknown (${routeType})`;
    }
}
/**
 * Get human-readable name for PayloadType enum value
 */
function getPayloadTypeName(payloadType) {
    switch (payloadType) {
        case enums_1.PayloadType.RawCustom: return 'RawCustom';
        case enums_1.PayloadType.Trace: return 'Trace';
        case enums_1.PayloadType.Advert: return 'Advert';
        case enums_1.PayloadType.GroupText: return 'GroupText';
        case enums_1.PayloadType.GroupData: return 'GroupData';
        case enums_1.PayloadType.Request: return 'Request';
        case enums_1.PayloadType.Response: return 'Response';
        case enums_1.PayloadType.TextMessage: return 'TextMessage';
        case enums_1.PayloadType.AnonRequest: return 'AnonRequest';
        case enums_1.PayloadType.Ack: return 'Ack';
        case enums_1.PayloadType.Path: return 'Path';
        case enums_1.PayloadType.Multipart: return 'Multipart';
        case enums_1.PayloadType.Control: return 'Control';
        default: return `Unknown (0x${payloadType.toString(16)})`;
    }
}
/**
 * Get human-readable name for PayloadVersion enum value
 */
function getPayloadVersionName(version) {
    switch (version) {
        case enums_1.PayloadVersion.Version1: return 'Version 1';
        case enums_1.PayloadVersion.Version2: return 'Version 2';
        case enums_1.PayloadVersion.Version3: return 'Version 3';
        case enums_1.PayloadVersion.Version4: return 'Version 4';
        default: return `Unknown (${version})`;
    }
}
/**
 * Get human-readable name for DeviceRole enum value
 */
function getDeviceRoleName(role) {
    switch (role) {
        case enums_1.DeviceRole.Unknown: return 'Unknown';
        case enums_1.DeviceRole.ChatNode: return 'Chat Node';
        case enums_1.DeviceRole.Repeater: return 'Repeater';
        case enums_1.DeviceRole.RoomServer: return 'Room Server';
        case enums_1.DeviceRole.Sensor: return 'Sensor';
        default: return `Unknown (${role})`;
    }
}
/**
 * Get human-readable name for RequestType enum value
 */
function getRequestTypeName(requestType) {
    switch (requestType) {
        case enums_1.RequestType.GetStats: return 'Get Stats';
        case enums_1.RequestType.Keepalive: return 'Keepalive (deprecated)';
        case enums_1.RequestType.GetTelemetryData: return 'Get Telemetry Data';
        case enums_1.RequestType.GetMinMaxAvgData: return 'Get Min/Max/Avg Data';
        case enums_1.RequestType.GetAccessList: return 'Get Access List';
        default: return `Unknown (${requestType})`;
    }
}
/**
 * Get human-readable name for ControlSubType enum value
 */
function getControlSubTypeName(subType) {
    switch (subType) {
        case enums_1.ControlSubType.NodeDiscoverReq: return 'Node Discover Request';
        case enums_1.ControlSubType.NodeDiscoverResp: return 'Node Discover Response';
        default: return `Unknown (0x${subType.toString(16)})`;
    }
}
//# sourceMappingURL=enum-names.js.map