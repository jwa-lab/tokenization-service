"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log(`Starting Tokenization Service...`);
const nats_1 = require("./nats");
const tezos_1 = require("./tezos");
const registry_1 = require("./handlers/registry");
async function start() {
    let cleanUp;
    try {
        await nats_1.init();
        await tezos_1.init();
        const natsSubscriptions = await nats_1.registerHandlers(registry_1.registryHandlers);
        cleanUp = () => {
            nats_1.natsUnsubscribe(natsSubscriptions);
            nats_1.close();
        };
        process.on('SIGINT', () => {
            console.log('Gracefully shutting down...');
            cleanUp();
        });
    }
    catch (err) {
        console.error(`Tokenization Service exited with error: ${err}`);
        process.exit(1);
    }
}
start();
