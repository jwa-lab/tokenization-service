import { Subscription } from "nats";
import { NatsHandler, jsonCodec, getConnection } from "../nats";
import { WarehouseStorage } from "../contracts/warehouse.types";
import {
    add_item,
    update_item,
    freeze_item,
    assign_item,
    warehouseContract
} from "../contracts/warehouse";
import {
    Collectible,
    MichelsonCollectible,
    JSONCollectible
} from "../contracts/collectible";

export const warehouseHandlers: NatsHandler[] = [
    [
        "tokenization-service_add_item",
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

                    message.respond(jsonCodec.encode(collectible));
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
        "tokenization-service_update_item",
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
        "tokenization-service_freeze_item",
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
        "tokenization-service_get_item",
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
    ],

    [
        "tokenization-service_tokenize_existing_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const natsConnection = getConnection();
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONCollectible;

                try {
                    const response = await natsConnection.request(
                        "item-store_get_item",
                        jsonCodec.encode({
                            item_id
                        })
                    );

                    const wrappedItem = jsonCodec.decode(response.data) as {
                        item: JSONCollectible;
                    };

                    const addItemResponse = await natsConnection.request(
                        "tokenization-service_add_item",
                        jsonCodec.encode(wrappedItem.item),
                        { timeout: 10000 }
                    );

                    message.respond(addItemResponse.data);
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
        "tokenization-service_assign_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { item_id , user_id } = jsonCodec.decode(
                    message.data
                ) as JSONCollectible;

                console.info(`Assigning item with id ${item_id}, to player with id ${user_id}`);

                let operation;
                let instance_number;

                try {
                    operation = await assign_item(item_id, user_id);
                    await operation.confirmation(1, 1);

                    message.respond(jsonCodec.encode(instance_number));

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
        "tokenization-service_update_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const natsConnection = getConnection();
                const item = jsonCodec.decode(message.data) as JSONCollectible;

                try {
                    const response = await natsConnection.request(
                        "item_store_add_item",
                        jsonCodec.encode({
                            item
                        })
                    );

                    message.respond(response.data)

                    const updatedItem = await natsConnection.request(
                        "tokenization-service_assign_item",
                        jsonCodec.encode(
                            item.item_id,
                            user_id
                        )
                    );

                    message.respond(updatedItem.data)
                    
                } catch (err) {
                    console.error(err);
                }
            }
        }
    ]
];
