import {
    JSONWarehouseItem,
    MichelsonWarehouseItem,
    WarehouseItem,
    WarehouseStorage
} from "@jwalab/tokenization-service-contracts";
import { Subscription } from "nats";

import { SERVICE_NAME } from "../config";
import { PrivateNatsHandler, jsonCodec } from "../services/nats";

import {
    add_item,
    update_item,
    freeze_item,
    warehouseContract
} from "../services/warehouse";

export const warehousePrivateHandlers: PrivateNatsHandler[] = [
    [
        "add_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const warehouseItem = jsonCodec.decode(
                        message.data
                    ) as JSONWarehouseItem;

                    console.info(
                        `[TOKENIZATION-SERVICE] Adding item with id ${warehouseItem.item_id}`
                    );

                    await add_item(new WarehouseItem(warehouseItem));

                    message.respond(jsonCodec.encode(warehouseItem));
                } catch (err) {
                    console.error(err);

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        },
        {
            queue: SERVICE_NAME
        }
    ],
    [
        "update_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const warehouseItem = jsonCodec.decode(
                        message.data
                    ) as JSONWarehouseItem;

                    console.info(
                        `[TOKENIZATION-SERVICE] Updating item with id ${warehouseItem.item_id}`
                    );

                    await update_item(new WarehouseItem(warehouseItem));

                    message.respond(jsonCodec.encode(warehouseItem));
                } catch (err) {
                    console.error(err);

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        },
        {
            queue: SERVICE_NAME
        }
    ],
    [
        "freeze_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONWarehouseItem;

                console.info(
                    `[TOKENIZATION-SERVICE] Freezing item with id ${item_id}`
                );

                try {
                    await freeze_item(Number(item_id));

                    message.respond(
                        jsonCodec.encode({
                            item_id: item_id
                        })
                    );
                } catch (err) {
                    console.error(err);

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        },
        {
            queue: SERVICE_NAME
        }
    ],
    [
        "get_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const { item_id } = jsonCodec.decode(
                        message.data
                    ) as JSONWarehouseItem;

                    const storage =
                        await warehouseContract.storage<WarehouseStorage>();

                    const warehouseItem = (await storage.warehouse.get(
                        String(item_id)
                    )) as MichelsonWarehouseItem;

                    if (!warehouseItem) {
                        throw new Error(
                            `Warehouse Item with id ${item_id} doesn't exit`
                        );
                    }

                    const jsonWarehouseItem =
                        WarehouseItem.fromMichelson(warehouseItem);

                    message.respond(jsonCodec.encode(jsonWarehouseItem));
                } catch (err) {
                    console.error(err);

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        }
    ]
];
