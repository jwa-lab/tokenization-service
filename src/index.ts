console.log(`[TOKENIZATION-SERVICE] Starting Tokenization Service...`);

import { SERVICE_NAME } from "./config";
import { init as initNats, registerHandlers, drain } from "./services/nats";
import { init as initTezos } from "./services/tezos";

import { warehouseHandlers } from "./private/warehouse";
import { inventoryHandlers } from "./private/inventory";
import { tokenizeHandlers } from "./public/tokenize";
import { initWarehouseContract } from "./services/warehouse";

async function start() {
    async function shutdown(exitCode: number) {
        await drain();
        process.exit(exitCode);
    }

    try {
        await initNats();
        await initTezos();
        await initWarehouseContract();

        registerHandlers(SERVICE_NAME, warehouseHandlers);
        registerHandlers(SERVICE_NAME, tokenizeHandlers);
        registerHandlers(SERVICE_NAME, inventoryHandlers);

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
