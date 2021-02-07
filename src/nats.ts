import { connect, NatsConnection, Subscription, JSONCodec } from "nats";
import { NATS_URL } from "./config";

export type NatsHandler = [
    topic: string,
    handler: (subscription: Subscription) => void
];

let natsConnection: NatsConnection;

export async function init(): Promise<void> {
    try {
        natsConnection = await connect({
            servers: NATS_URL
        });
    } catch (err) {
        console.log(`error connecting to nats: ${err.message}`);
        return;
    }

    console.info(`[TOKENIZATION-SERVICE] connected to ${natsConnection.getServer()}`);

    (async () => {
        for await (const status of natsConnection.status()) {
            console.info(`${status.type}: ${JSON.stringify(status.data)}`);
        }
    })().then();
}

export function registerHandlers(handlers: NatsHandler[]): void {
    handlers.forEach(([subject, handler]: NatsHandler) => {
        const sub = natsConnection.subscribe(subject);

        try {
            handler(sub);
        } catch (err) {
            console.error(err);
        }
    });
}

export function drain(): Promise<void> {
    console.log(`Draining connection to NATS server ${NATS_URL}`);
    return natsConnection.drain();
}

export function getConnection(): NatsConnection {
    return natsConnection;
}

export const jsonCodec = JSONCodec();
