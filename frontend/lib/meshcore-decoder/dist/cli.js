#!/usr/bin/env node
"use strict";
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const packet_decoder_1 = require("./decoder/packet-decoder");
const enums_1 = require("./types/enums");
const enum_names_1 = require("./utils/enum-names");
const index_1 = require("./index");
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const packageJson = __importStar(require("../package.json"));
commander_1.program
    .name('meshcore-decoder')
    .description('CLI tool for decoding MeshCore packets')
    .version(packageJson.version);
// Default decode command
commander_1.program
    .command('decode', { isDefault: true })
    .description('Decode a MeshCore packet')
    .argument('<hex>', 'Hex string of the packet to decode')
    .option('-k, --key <keys...>', 'Channel secret keys for decryption (hex)')
    .option('-j, --json', 'Output as JSON instead of formatted text')
    .option('-s, --structure', 'Show detailed packet structure analysis')
    .action(async (hex, options) => {
    try {
        // Clean up hex input
        const cleanHex = hex.replace(/\s+/g, '').replace(/^0x/i, '');
        // Create key store if keys provided
        let keyStore;
        if (options.key && options.key.length > 0) {
            keyStore = packet_decoder_1.MeshCorePacketDecoder.createKeyStore({
                channelSecrets: options.key
            });
        }
        // Decode packet with signature verification
        const packet = await packet_decoder_1.MeshCorePacketDecoder.decodeWithVerification(cleanHex, { keyStore });
        if (options.json) {
            // JSON output
            if (options.structure) {
                const structure = await packet_decoder_1.MeshCorePacketDecoder.analyzeStructureWithVerification(cleanHex, { keyStore });
                console.log(JSON.stringify({ packet, structure }, null, 2));
            }
            else {
                console.log(JSON.stringify(packet, null, 2));
            }
        }
        else {
            // Formatted output
            console.log(chalk_1.default.cyan('=== MeshCore Packet Analysis ===\n'));
            if (!packet.isValid) {
                console.log(chalk_1.default.red('❌ Invalid Packet'));
                if (packet.errors) {
                    packet.errors.forEach(error => console.log(chalk_1.default.red(`   ${error}`)));
                }
            }
            else {
                console.log(chalk_1.default.green('✅ Valid Packet'));
            }
            console.log(`${chalk_1.default.bold('Message Hash:')} ${packet.messageHash}`);
            console.log(`${chalk_1.default.bold('Route Type:')} ${(0, enum_names_1.getRouteTypeName)(packet.routeType)}`);
            console.log(`${chalk_1.default.bold('Payload Type:')} ${(0, enum_names_1.getPayloadTypeName)(packet.payloadType)}`);
            console.log(`${chalk_1.default.bold('Total Bytes:')} ${packet.totalBytes}`);
            if (packet.path && packet.path.length > 0) {
                console.log(`${chalk_1.default.bold('Path:')} ${packet.path.join(' → ')}`);
            }
            // Show payload details (even for invalid packets)
            if (packet.payload.decoded) {
                console.log(chalk_1.default.cyan('\n=== Payload Details ==='));
                showPayloadDetails(packet.payload.decoded);
            }
            // Exit with error code if packet is invalid
            if (!packet.isValid) {
                process.exit(1);
            }
            // Show structure if requested
            if (options.structure) {
                const structure = await packet_decoder_1.MeshCorePacketDecoder.analyzeStructureWithVerification(cleanHex, { keyStore });
                console.log(chalk_1.default.cyan('\n=== Packet Structure ==='));
                console.log(chalk_1.default.yellow('\nMain Segments:'));
                structure.segments.forEach((seg, i) => {
                    console.log(`${i + 1}. ${chalk_1.default.bold(seg.name)} (bytes ${seg.startByte}-${seg.endByte}): ${seg.value}`);
                    if (seg.description) {
                        console.log(`   ${chalk_1.default.dim(seg.description)}`);
                    }
                });
                if (structure.payload.segments.length > 0) {
                    console.log(chalk_1.default.yellow('\nPayload Segments:'));
                    structure.payload.segments.forEach((seg, i) => {
                        console.log(`${i + 1}. ${chalk_1.default.bold(seg.name)} (bytes ${seg.startByte}-${seg.endByte}): ${seg.value}`);
                        console.log(`   ${chalk_1.default.dim(seg.description)}`);
                    });
                }
            }
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('Error:'), error.message);
        process.exit(1);
    }
});
function showPayloadDetails(payload) {
    switch (payload.type) {
        case enums_1.PayloadType.Advert:
            const advert = payload;
            console.log(`${chalk_1.default.bold('Device Role:')} ${(0, enum_names_1.getDeviceRoleName)(advert.appData.deviceRole)}`);
            if (advert.appData.name) {
                console.log(`${chalk_1.default.bold('Device Name:')} ${advert.appData.name}`);
            }
            if (advert.appData.location) {
                console.log(`${chalk_1.default.bold('Location:')} ${advert.appData.location.latitude}, ${advert.appData.location.longitude}`);
            }
            console.log(`${chalk_1.default.bold('Timestamp:')} ${new Date(advert.timestamp * 1000).toISOString()}`);
            // Show signature verification status
            if (advert.signatureValid !== undefined) {
                if (advert.signatureValid) {
                    console.log(`${chalk_1.default.bold('Signature:')} ${chalk_1.default.green('✅ Valid Ed25519 signature')}`);
                }
                else {
                    console.log(`${chalk_1.default.bold('Signature:')} ${chalk_1.default.red('❌ Invalid Ed25519 signature')}`);
                    if (advert.signatureError) {
                        console.log(`${chalk_1.default.bold('Error:')} ${chalk_1.default.red(advert.signatureError)}`);
                    }
                }
            }
            else {
                console.log(`${chalk_1.default.bold('Signature:')} ${chalk_1.default.yellow('⚠️ Not verified (use async verification)')}`);
            }
            break;
        case enums_1.PayloadType.GroupText:
            const groupText = payload;
            console.log(`${chalk_1.default.bold('Channel Hash:')} ${groupText.channelHash}`);
            if (groupText.decrypted) {
                console.log(chalk_1.default.green('🔓 Decrypted Message:'));
                if (groupText.decrypted.sender) {
                    console.log(`${chalk_1.default.bold('Sender:')} ${groupText.decrypted.sender}`);
                }
                console.log(`${chalk_1.default.bold('Message:')} ${groupText.decrypted.message}`);
                console.log(`${chalk_1.default.bold('Timestamp:')} ${new Date(groupText.decrypted.timestamp * 1000).toISOString()}`);
            }
            else {
                console.log(chalk_1.default.yellow('🔒 Encrypted (no key available)'));
                console.log(`${chalk_1.default.bold('Ciphertext:')} ${groupText.ciphertext.substring(0, 32)}...`);
            }
            break;
        case enums_1.PayloadType.Trace:
            const trace = payload;
            console.log(`${chalk_1.default.bold('Trace Tag:')} ${trace.traceTag}`);
            console.log(`${chalk_1.default.bold('Auth Code:')} ${trace.authCode}`);
            if (trace.snrValues && trace.snrValues.length > 0) {
                console.log(`${chalk_1.default.bold('SNR Values:')} ${trace.snrValues.map(snr => `${snr.toFixed(1)}dB`).join(', ')}`);
            }
            break;
        default:
            console.log(`${chalk_1.default.bold('Type:')} ${(0, enum_names_1.getPayloadTypeName)(payload.type)}`);
            console.log(`${chalk_1.default.bold('Valid:')} ${payload.isValid ? '✅' : '❌'}`);
    }
}
// Add key derivation command
commander_1.program
    .command('derive-key')
    .description('Derive Ed25519 public key from MeshCore private key')
    .argument('<private-key>', '64-byte private key in hex format')
    .option('-v, --validate <public-key>', 'Validate against expected public key')
    .option('-j, --json', 'Output as JSON')
    .action(async (privateKeyHex, options) => {
    try {
        // Clean up hex input
        const cleanPrivateKey = privateKeyHex.replace(/\s+/g, '').replace(/^0x/i, '');
        if (cleanPrivateKey.length !== 128) {
            console.error(chalk_1.default.red('❌ Error: Private key must be exactly 64 bytes (128 hex characters)'));
            process.exit(1);
        }
        if (options.json) {
            // JSON output
            const result = {
                privateKey: cleanPrivateKey,
                derivedPublicKey: await index_1.Utils.derivePublicKey(cleanPrivateKey)
            };
            if (options.validate) {
                const cleanExpectedKey = options.validate.replace(/\s+/g, '').replace(/^0x/i, '');
                result.expectedPublicKey = cleanExpectedKey;
                result.isValid = await index_1.Utils.validateKeyPair(cleanPrivateKey, cleanExpectedKey);
                result.match = result.derivedPublicKey.toLowerCase() === cleanExpectedKey.toLowerCase();
            }
            console.log(JSON.stringify(result, null, 2));
        }
        else {
            // Formatted output
            console.log(chalk_1.default.cyan('=== MeshCore Ed25519 Key Derivation ===\n'));
            console.log(chalk_1.default.bold('Private Key (64 bytes):'));
            console.log(chalk_1.default.gray(cleanPrivateKey));
            console.log();
            console.log(chalk_1.default.bold('Derived Public Key (32 bytes):'));
            const derivedKey = await index_1.Utils.derivePublicKey(cleanPrivateKey);
            console.log(chalk_1.default.green(derivedKey));
            console.log();
            if (options.validate) {
                const cleanExpectedKey = options.validate.replace(/\s+/g, '').replace(/^0x/i, '');
                console.log(chalk_1.default.bold('Expected Public Key:'));
                console.log(chalk_1.default.gray(cleanExpectedKey));
                console.log();
                const match = derivedKey.toLowerCase() === cleanExpectedKey.toLowerCase();
                console.log(chalk_1.default.bold('Validation:'));
                console.log(match ? chalk_1.default.green('Keys match') : chalk_1.default.red('Keys do not match'));
                if (!match) {
                    process.exit(1);
                }
            }
            console.log(chalk_1.default.green('Key derivation completed successfully'));
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (options.json) {
            console.log(JSON.stringify({ error: errorMessage }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`Error: ${errorMessage}`));
        }
        process.exit(1);
    }
});
// Add auth-token command
commander_1.program
    .command('auth-token')
    .description('Generate JWT authentication token signed with Ed25519 private key')
    .argument('<public-key>', '32-byte public key in hex format')
    .argument('<private-key>', '64-byte private key in hex format')
    .option('-e, --exp <seconds>', 'Token expiration in seconds from now (default: 86400 = 24 hours)', '86400')
    .option('-c, --claims <json>', 'Additional claims as JSON object (e.g., \'{"aud":"mqtt.example.com","sub":"device-123"}\')')
    .option('-j, --json', 'Output as JSON')
    .action(async (publicKeyHex, privateKeyHex, options) => {
    try {
        const { createAuthToken } = await Promise.resolve().then(() => __importStar(require('./utils/auth-token')));
        // Clean up hex inputs
        const cleanPublicKey = publicKeyHex.replace(/\s+/g, '').replace(/^0x/i, '');
        const cleanPrivateKey = privateKeyHex.replace(/\s+/g, '').replace(/^0x/i, '');
        if (cleanPublicKey.length !== 64) {
            console.error(chalk_1.default.red('❌ Error: Public key must be exactly 32 bytes (64 hex characters)'));
            process.exit(1);
        }
        if (cleanPrivateKey.length !== 128) {
            console.error(chalk_1.default.red('❌ Error: Private key must be exactly 64 bytes (128 hex characters)'));
            process.exit(1);
        }
        const expSeconds = parseInt(options.exp);
        const iat = Math.floor(Date.now() / 1000);
        const exp = iat + expSeconds;
        const payload = {
            publicKey: cleanPublicKey.toUpperCase(),
            iat,
            exp
        };
        // Parse and merge additional claims if provided
        if (options.claims) {
            try {
                const additionalClaims = JSON.parse(options.claims);
                Object.assign(payload, additionalClaims);
            }
            catch (e) {
                console.error(chalk_1.default.red('❌ Error: Invalid JSON in --claims option'));
                process.exit(1);
            }
        }
        const token = await createAuthToken(payload, cleanPrivateKey, cleanPublicKey.toUpperCase());
        if (options.json) {
            console.log(JSON.stringify({
                token,
                payload
            }, null, 2));
        }
        else {
            console.log(token);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (options.json) {
            console.log(JSON.stringify({ error: errorMessage }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`Error: ${errorMessage}`));
        }
        process.exit(1);
    }
});
// Add verify-token command
commander_1.program
    .command('verify-token')
    .description('Verify JWT authentication token')
    .argument('<token>', 'JWT token to verify')
    .option('-p, --public-key <key>', 'Expected public key in hex format (optional)')
    .option('-j, --json', 'Output as JSON')
    .action(async (token, options) => {
    try {
        const { verifyAuthToken } = await Promise.resolve().then(() => __importStar(require('./utils/auth-token')));
        const cleanToken = token.trim();
        let expectedPublicKey;
        if (options.publicKey) {
            const cleanKey = options.publicKey.replace(/\s+/g, '').replace(/^0x/i, '').toUpperCase();
            if (cleanKey.length !== 64) {
                console.error(chalk_1.default.red('❌ Error: Public key must be exactly 32 bytes (64 hex characters)'));
                process.exit(1);
            }
            expectedPublicKey = cleanKey;
        }
        const payload = await verifyAuthToken(cleanToken, expectedPublicKey);
        if (payload) {
            const now = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp && now > payload.exp;
            const timeToExpiry = payload.exp ? payload.exp - now : null;
            if (options.json) {
                console.log(JSON.stringify({
                    valid: true,
                    expired: isExpired,
                    payload,
                    timeToExpiry
                }, null, 2));
            }
            else {
                console.log(chalk_1.default.green('✅ Token is valid'));
                console.log(chalk_1.default.cyan('\nPayload:'));
                console.log(`  Public Key: ${payload.publicKey}`);
                console.log(`  Issued At:  ${new Date(payload.iat * 1000).toISOString()} (${payload.iat})`);
                if (payload.exp) {
                    console.log(`  Expires At: ${new Date(payload.exp * 1000).toISOString()} (${payload.exp})`);
                    if (isExpired) {
                        console.log(chalk_1.default.red(`  Status:     EXPIRED`));
                    }
                    else {
                        console.log(chalk_1.default.green(`  Status:     Valid for ${timeToExpiry} more seconds`));
                    }
                }
                // Show any additional claims
                const standardClaims = ['publicKey', 'iat', 'exp'];
                const customClaims = Object.keys(payload).filter(k => !standardClaims.includes(k));
                if (customClaims.length > 0) {
                    console.log(chalk_1.default.cyan('\nCustom Claims:'));
                    customClaims.forEach(key => {
                        console.log(`  ${key}: ${JSON.stringify(payload[key])}`);
                    });
                }
            }
        }
        else {
            if (options.json) {
                console.log(JSON.stringify({
                    valid: false,
                    error: 'Token verification failed'
                }, null, 2));
            }
            else {
                console.error(chalk_1.default.red('❌ Token verification failed'));
                console.error(chalk_1.default.yellow('Possible reasons:'));
                console.error('  - Invalid signature');
                console.error('  - Token format is incorrect');
                console.error('  - Public key mismatch (if --public-key was provided)');
            }
            process.exit(1);
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (options.json) {
            console.log(JSON.stringify({ valid: false, error: errorMessage }, null, 2));
        }
        else {
            console.error(chalk_1.default.red(`Error: ${errorMessage}`));
        }
        process.exit(1);
    }
});
commander_1.program.parse();
//# sourceMappingURL=cli.js.map