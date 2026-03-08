"use strict";
// MeshCore Packet Decoder
// Copyright (c) 2025 Michael Hart: https://github.com/michaelhart/meshcore-decoder
// MIT License
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Utils = exports.decodeAuthTokenPayload = exports.parseAuthToken = exports.verifyAuthToken = exports.createAuthToken = exports.getControlSubTypeName = exports.getRequestTypeName = exports.getDeviceRoleName = exports.getPayloadVersionName = exports.getPayloadTypeName = exports.getRouteTypeName = exports.numberToHex = exports.byteToHex = exports.bytesToHex = exports.hexToBytes = exports.Ed25519SignatureVerifier = exports.ChannelCrypto = exports.MeshCoreKeyStore = exports.ControlSubType = exports.RequestType = exports.AdvertFlags = exports.DeviceRole = exports.PayloadVersion = exports.PayloadType = exports.RouteType = exports.MeshCoreDecoder = exports.MeshCorePacketDecoder = void 0;
var packet_decoder_1 = require("./decoder/packet-decoder");
Object.defineProperty(exports, "MeshCorePacketDecoder", { enumerable: true, get: function () { return packet_decoder_1.MeshCorePacketDecoder; } });
var packet_decoder_2 = require("./decoder/packet-decoder");
Object.defineProperty(exports, "MeshCoreDecoder", { enumerable: true, get: function () { return packet_decoder_2.MeshCorePacketDecoder; } });
// Enum exports
var enums_1 = require("./types/enums");
Object.defineProperty(exports, "RouteType", { enumerable: true, get: function () { return enums_1.RouteType; } });
Object.defineProperty(exports, "PayloadType", { enumerable: true, get: function () { return enums_1.PayloadType; } });
Object.defineProperty(exports, "PayloadVersion", { enumerable: true, get: function () { return enums_1.PayloadVersion; } });
Object.defineProperty(exports, "DeviceRole", { enumerable: true, get: function () { return enums_1.DeviceRole; } });
Object.defineProperty(exports, "AdvertFlags", { enumerable: true, get: function () { return enums_1.AdvertFlags; } });
Object.defineProperty(exports, "RequestType", { enumerable: true, get: function () { return enums_1.RequestType; } });
Object.defineProperty(exports, "ControlSubType", { enumerable: true, get: function () { return enums_1.ControlSubType; } });
// Crypto exports
var key_manager_1 = require("./crypto/key-manager");
Object.defineProperty(exports, "MeshCoreKeyStore", { enumerable: true, get: function () { return key_manager_1.MeshCoreKeyStore; } });
var channel_crypto_1 = require("./crypto/channel-crypto");
Object.defineProperty(exports, "ChannelCrypto", { enumerable: true, get: function () { return channel_crypto_1.ChannelCrypto; } });
var ed25519_verifier_1 = require("./crypto/ed25519-verifier");
Object.defineProperty(exports, "Ed25519SignatureVerifier", { enumerable: true, get: function () { return ed25519_verifier_1.Ed25519SignatureVerifier; } });
// Utility exports
var hex_1 = require("./utils/hex");
Object.defineProperty(exports, "hexToBytes", { enumerable: true, get: function () { return hex_1.hexToBytes; } });
Object.defineProperty(exports, "bytesToHex", { enumerable: true, get: function () { return hex_1.bytesToHex; } });
Object.defineProperty(exports, "byteToHex", { enumerable: true, get: function () { return hex_1.byteToHex; } });
Object.defineProperty(exports, "numberToHex", { enumerable: true, get: function () { return hex_1.numberToHex; } });
var enum_names_1 = require("./utils/enum-names");
Object.defineProperty(exports, "getRouteTypeName", { enumerable: true, get: function () { return enum_names_1.getRouteTypeName; } });
Object.defineProperty(exports, "getPayloadTypeName", { enumerable: true, get: function () { return enum_names_1.getPayloadTypeName; } });
Object.defineProperty(exports, "getPayloadVersionName", { enumerable: true, get: function () { return enum_names_1.getPayloadVersionName; } });
Object.defineProperty(exports, "getDeviceRoleName", { enumerable: true, get: function () { return enum_names_1.getDeviceRoleName; } });
Object.defineProperty(exports, "getRequestTypeName", { enumerable: true, get: function () { return enum_names_1.getRequestTypeName; } });
Object.defineProperty(exports, "getControlSubTypeName", { enumerable: true, get: function () { return enum_names_1.getControlSubTypeName; } });
var auth_token_1 = require("./utils/auth-token");
Object.defineProperty(exports, "createAuthToken", { enumerable: true, get: function () { return auth_token_1.createAuthToken; } });
Object.defineProperty(exports, "verifyAuthToken", { enumerable: true, get: function () { return auth_token_1.verifyAuthToken; } });
Object.defineProperty(exports, "parseAuthToken", { enumerable: true, get: function () { return auth_token_1.parseAuthToken; } });
Object.defineProperty(exports, "decodeAuthTokenPayload", { enumerable: true, get: function () { return auth_token_1.decodeAuthTokenPayload; } });
const EnumUtils = __importStar(require("./utils/enum-names"));
const HexUtils = __importStar(require("./utils/hex"));
const AuthTokenUtils = __importStar(require("./utils/auth-token"));
const orlp_ed25519_wasm_1 = require("./crypto/orlp-ed25519-wasm");
exports.Utils = {
    ...EnumUtils,
    ...HexUtils,
    ...AuthTokenUtils,
    derivePublicKey: orlp_ed25519_wasm_1.derivePublicKey,
    validateKeyPair: orlp_ed25519_wasm_1.validateKeyPair,
    sign: orlp_ed25519_wasm_1.sign,
    verify: orlp_ed25519_wasm_1.verify
};
//# sourceMappingURL=index.js.map