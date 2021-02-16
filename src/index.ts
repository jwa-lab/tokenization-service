console.log(`[TOKENIZATION-SERVICE] Starting Tokenization Service...`);

import { init as initNats, registerHandlers, drain } from "./nats";
import { init as initTezos } from "./tezos";

import { warehouseHandlers } from "./handlers/warehouse";

async function start() {
    async function shutdown(exitCode: number) {
        await drain();
        process.exit(exitCode);
    }

    try {
        await initNats();
        await initTezos();

        await registerHandlers(warehouseHandlers);

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
