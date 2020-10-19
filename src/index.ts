console.log(`[TOKENIZATION-SERVICE] Starting Tokenization Service...`);

import {
    init as initNats,
    registerHandlers,
    natsUnsubscribe,
    close as closeNats,
} from "./nats";
import { init as initTezos } from "./tezos";
import { init as initES, close as closeES } from "./elasticsearch";

import { registryHandlers } from "./handlers/registry";

async function start() {
    let cleanUp: () => void;

    function shutdown(exitCode: number) {
        cleanUp()
        closeNats()
        closeES()
        process.exit(exitCode)
    }

    try {
        await initNats()
        await initTezos();
        await initES();

        const natsSubscriptions = await registerHandlers(registryHandlers);

        cleanUp = () => {
            natsUnsubscribe(natsSubscriptions);
        };

        process.on("SIGINT", () => {
            console.log("[TOKENIZATION-SERVICE] Gracefully shutting down...");
            shutdown(0);
        });
        process.on("SIGTERM", () => {
            console.log("[TOKENIZATION-SERVICE] Gracefully shutting down...");
            shutdown(0);
        });
    } catch (err) {
        console.error(`[TOKENIZATION-SERVICE] Tokenization Service exited with error: ${err}`);
        console.error(err);
        shutdown(1)
    }   
}

start();