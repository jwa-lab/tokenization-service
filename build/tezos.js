"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContract = exports.init = void 0;
const taquito_1 = __importDefault(require("@taquito/taquito"));
const signer_1 = require("@taquito/signer");
const config_1 = require("./config");
let tezosClient;
async function init() {
    console.log(`Using Tezos RPC URI ${config_1.TEZOS_RPC_URI}`);
    tezosClient = new taquito_1.default.TezosToolkit();
    tezosClient.setProvider({
        rpc: config_1.TEZOS_RPC_URI,
        config: {
            // I wish I could override this confirmation in config.json but this currently doesn't work, resorting to calling
            // operation.confirmation(1, 1) instead everywhere in my code. will debug and submit a Taquito bug fix on GitHub if necessary
            confirmationPollingIntervalSecond: 1,
            confirmationPollingTimeoutSecond: 180
        }
    });
    await signer_1.importKey(tezosClient, config_1.REGISTRY_TEZOS_SECRET_KEY);
}
exports.init = init;
async function getContract(address) {
    return await tezosClient.contract.at(address);
}
exports.getContract = getContract;
