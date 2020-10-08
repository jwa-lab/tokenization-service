"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REGISTRY_CONTRACT_ADDRESS = exports.REGISTRY_TEZOS_SECRET_KEY = exports.NATS_URL = exports.TEZOS_RPC_URI = void 0;
const utils_1 = require("@taquito/utils");
const { NATS_URL = '', TEZOS_RPC_URI = '', REGISTRY_TEZOS_SECRET_KEY = '', REGISTRY_CONTRACT_ADDRESS = '' } = process.env;
exports.NATS_URL = NATS_URL;
exports.TEZOS_RPC_URI = TEZOS_RPC_URI;
exports.REGISTRY_TEZOS_SECRET_KEY = REGISTRY_TEZOS_SECRET_KEY;
exports.REGISTRY_CONTRACT_ADDRESS = REGISTRY_CONTRACT_ADDRESS;
if (!TEZOS_RPC_URI) {
    throw new Error(`Please provide a valid Tezos node URI via "TEZOS_RPC_URI", for instance https://api.tez.ie/rpc/mainnet`);
}
if (typeof NATS_URL === 'undefined') {
    throw new Error(`Please provide a valid NATS_URL so the service can connect to NATS. For example, use nats://nats:4222`);
}
if (!REGISTRY_TEZOS_SECRET_KEY) {
    throw new Error(`Please provide an uncrypted private key to sign transactions with via REGISTRY_SECRET_KEY.`);
}
if (!utils_1.validateAddress(REGISTRY_CONTRACT_ADDRESS)) {
    throw new Error(`Please provide a valid KT1 address to access the registry via REGISTRY_CONTRACT_ADDRESS`);
}
