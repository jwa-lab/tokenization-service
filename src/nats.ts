import { connect, Client, MsgCallback, Subscription, NatsError, Msg } from 'ts-nats'
import { NATS_URL } from './config';

export type NatsHandler = [topic: string, handler: MsgCallback];

let natsClient: Client;

export async function init(): Promise<void> {
    console.log(`Connecting to NATS server ${ NATS_URL }...`);

    natsClient = await connect({
        url: NATS_URL
    });

    natsClient.on('connect', () => {
        console.log('Connected')
    });

    natsClient.on('disconnected', () => {
        console.log('Disconnected')
    })

    natsClient.on('reconnecting', () => {
        console.log('client reconnecting');
    });
    
    natsClient.on('reconnect', () => {
        console.log('client reconnected');
    });

    natsClient.on('error', (err) => {
        console.error('Err', err)
        shutdown()
    })
}

export async function registerHandlers(handlers: NatsHandler[]): Promise<Subscription[]> {
    return await Promise.all(
        handlers.map(([topic, handler]: NatsHandler) => natsClient.subscribe(topic, handleErrors(handler) as MsgCallback))
    );
}

export function natsUnsubscribe(natsSubscriptions: Subscription[]): void {
    natsSubscriptions.forEach((sub: Subscription) => sub.unsubscribe());
}

export function close(): void {
    console.log(`Closing connection to NATS server ${ NATS_URL }`);
    natsClient.close()
}

export function getClient(): Client {
    return natsClient;
}

export function shutdown(): void {
    natsClient.close();
    process.exit(1)
}

function handleErrors(handler: MsgCallback) {
    return async function wrappedHandler(wrappedNatsError: NatsError, wrappedMsg: Msg): Promise<void> {
        try {
            await handler(wrappedNatsError, wrappedMsg)
        } catch (err) {
            console.error(err)
            shutdown()
        }
    }
}

