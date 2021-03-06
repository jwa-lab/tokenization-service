console.log(`[TOKENIZATION-SERVICE] Starting Tokenization Service...`);

import { SERVICE_NAME } from "./config";
import {
    init as initNats,
    registerPrivateHandlers,
    drain,
    registerPublicHandlers
} from "./services/nats";
import { init as initTezos } from "./services/tezos";

import { warehousePrivateHandlers } from "./private/warehouse";
import { inventoryPrivateHandlers } from "./private/inventory";
import { tokenizePublicHandlers } from "./public/tokenize";
import { warehousePublicHandlers } from "./public/warehouse";
import { inventoryPublicHandlers } from "./public/inventory";
import { infoPublicHandlers } from "./public/info";
import { initWarehouseContract } from "./services/warehouse";
import { init as initDocs } from "./services/docs";

async function start() {
    async function shutdown(exitCode: number) {
        await drain();
        process.exit(exitCode);
    }

    try {
        await initNats();
        await initTezos();
        await initWarehouseContract();
        await initDocs();

        registerPrivateHandlers(SERVICE_NAME, warehousePrivateHandlers);
        registerPrivateHandlers(SERVICE_NAME, inventoryPrivateHandlers);

        registerPublicHandlers(SERVICE_NAME, tokenizePublicHandlers);
        registerPublicHandlers(SERVICE_NAME, infoPublicHandlers);
        registerPublicHandlers(SERVICE_NAME, warehousePublicHandlers);
        registerPublicHandlers(SERVICE_NAME, inventoryPublicHandlers);

        process.on("SIGINT", () => {
            console.log("[TOKENIZATION-SERVICE] Gracefully shutting down...");
            shutdown(0);
        });

        process.on("SIGTERM", () => {
            console.log("[TOKENIZATION-SERVICE] Gracefully shutting down...");
            shutdown(0);
        });
    } catch (err) {
        console.error(
            `[TOKENIZATION-SERVICE] Tokenization Service exited with error: ${err}`
        );
        console.error(err);
        shutdown(1);
    }
}

start();
