import { connect, NatsConnection, Subscription, JSONCodec } from "nats";
import { NATS_URL } from "../config";

type JSONValue =
    | string
    | number
    | boolean
    | null
    | JSONValue[]
    | { [key: string]: JSONValue };

export type PrivateNatsHandler = [
    topic: string,
    handler: (subscription: Subscription) => Promise<void>
];

export type PublicNatsHandler = [
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    topic: string,
    handler: (subscription: Subscription) => Promise<void>
];

export interface AirlockPayload {
    body: JSONValue;
    query: JSONValue;
}

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

export function registerPrivateHandlers(
    prefix: string,
    handlers: PrivateNatsHandler[]
): void {
    handlers.map(([subject, handler]) => {
        const fullSubject = `${prefix}.${subject}`;
        console.log(
            `[TOKENIZATION-SERVICE] Registering handler ${fullSubject}`
        );
        handler(natsConnection.subscribe(fullSubject));
    });
}

export function registerPublicHandlers(
    prefix: string,
    handlers: PublicNatsHandler[]
): void {
    handlers.map(([method, subject, handler]) => {
        const fullSubject = `${method}:${prefix}.${subject}`;
        console.log(
            `[TOKENIZATION-SERVICE] Registering public handler ${fullSubject}`
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
