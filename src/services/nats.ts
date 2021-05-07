import { connect, NatsConnection, Subscription, JSONCodec } from "nats";
import { NATS_URL } from "../config";

export type NatsHandler = [
    topic: string,
    handler: (subscription: Subscription) => Promise<void>
];

let natsConnection: NatsConnection;

export async function init(): Promise<void> {
    natsConnection = await connect({
        servers: NATS_URL
    });

    console.info(
        `[TOKENIZATION-SERVICE] connected to Nats ${natsConnection.getServer()}`
    );

    (async () => {
        for await (const status of natsConnection.status()) {
            console.info(`${status.type}: ${JSON.stringify(status.data)}`);
        }
    })().then();
}

export function registerHandlers(
    prefix: string,
    handlers: NatsHandler[]
): void {
    handlers.map(([subject, handler]) => {
        const fullSubject = `${prefix}.${subject}`;
        console.log(
            `[TOKENIZATION-SERVICE] Registering handler ${fullSubject}`
        );
        handler(natsConnection.subscribe(fullSubject));
    });
}

export function drain(): Promise<void> {
    console.log(
        `[TOKENIZATION-SERVICE] Draining connection to NATS server ${NATS_URL}`
    );
    return natsConnection.drain();
}

export function getConnection(): NatsConnection {
    return natsConnection;
}

export const jsonCodec = JSONCodec();
