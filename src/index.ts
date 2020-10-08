console.log(`Starting Tokenization Service...`);

import {
    init as initNats,
    registerHandlers,
    natsUnsubscribe,
    close,
    shutdown,
} from "./nats";
import { init as initTezos } from "./tezos";

import { registryHandlers } from "./handlers/registry";

async function start() {
    let cleanUp: () => void;

    try {
        await initNats();
        await initTezos();

        const natsSubscriptions = await registerHandlers(registryHandlers);

        cleanUp = () => {
            natsUnsubscribe(natsSubscriptions);
            close();
        };

        process.on("SIGINT", () => {
            console.log("Gracefully shutting down...");
            cleanUp();
            shutdown();
        });
    } catch (err) {
        console.error(`Tokenization Service exited with error: ${err}`);
        console.error(err);
        shutdown();
    }
}

start();
