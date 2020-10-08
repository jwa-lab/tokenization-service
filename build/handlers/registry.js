"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registryHandlers = void 0;
const tezos_1 = require("../tezos");
const config_1 = require("../config");
const registry_1 = require("../contracts/registry");
const collectible_1 = require("../contracts/collectible");
exports.registryHandlers = [
    [
        "registry.add_token",
        async (err, msg) => {
            const registryContract = await tezos_1.getContract(
                config_1.REGISTRY_CONTRACT_ADDRESS
            );
            await registry_1.add_token(
                registryContract,
                new collectible_1.Collectible(msg.data)
            );
        },
    ],
    [
        "registry.update_token",
        async (err, msg) => {
            const registryContract = await tezos_1.getContract(
                config_1.REGISTRY_CONTRACT_ADDRESS
            );
            await registry_1.update_token(
                registryContract,
                new collectible_1.Collectible(msg.data)
            );
        },
    ],
];
