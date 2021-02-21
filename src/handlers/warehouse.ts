import { Subscription } from "nats";
import { NatsHandler, jsonCodec } from "../nats";
import { WarehouseStorage } from "../contracts/warehouse.types";
import {
    add_item,
    update_item,
    freeze_item,
    warehouseContract
} from "../contracts/warehouse";
import {
    Collectible,
    MichelsonCollectible,
    JSONCollectible
} from "../contracts/collectible";

export const warehouseHandlers: NatsHandler[] = [
    [
        "add_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const collectible = new Collectible(
                    jsonCodec.decode(message.data) as JSONCollectible
                );

                console.info(`Adding item with id ${collectible.item_id}`);

                let operation;

                try {
                    operation = await add_item(collectible);
                    await operation.confirmation(1, 1);

                    message.respond(
                        jsonCodec.encode({
                            item_id: collectible.item_id
                        })
                    );
                } catch (err) {
                    console.error(err);
                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],
    [
        "update_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const collectible = new Collectible(
                    jsonCodec.decode(message.data) as JSONCollectible
                );

                console.info(`Updating item with id ${collectible.item_id}`);

                let operation;

                try {
                    operation = await update_item(collectible);

                    await operation.confirmation(1, 1);

                    message.respond(
                        jsonCodec.encode({
                            item_id: collectible.item_id
                        })
                    );
                } catch (err) {
                    console.error(err);
                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],

    [
        "freeze_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONCollectible;

                console.info(`Freezing item with id ${item_id}`);

                let operation;

                try {
                    operation = await freeze_item(Number(item_id));
                    await operation.confirmation(1, 1);

                    message.respond(
                        jsonCodec.encode({
                            item_id: item_id
                        })
                    );
                } catch (err) {
                    console.error(err);
                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],

    [
        "get_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const storage = await warehouseContract.storage<
                    WarehouseStorage
                >();
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONCollectible;

                try {
                    const collectible = (await storage.warehouse.get(
                        String(item_id)
                    )) as MichelsonCollectible;
                    const jsonCollectible = Collectible.fromMichelson(
                        collectible
                    );

                    message.respond(jsonCodec.encode(jsonCollectible));
                } catch (err) {
                    console.error(err);
                }
            }
        }
    ]
];
