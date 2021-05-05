import { Subscription } from "nats";
import { PrivateNatsHandler, jsonCodec } from "../services/nats";
import { WarehouseStorage } from "../contracts/warehouse.types";
import {
    add_item,
    update_item,
    freeze_item,
    warehouseContract
} from "../services/warehouse";
import {
    WarehouseItem,
    MichelsonWarehouseItem,
    JSONWarehouseItem
} from "../contracts/warehouseItem";

export const warehousePrivateHandlers: PrivateNatsHandler[] = [
    [
        "add_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const warehouseItem = new WarehouseItem(
                        jsonCodec.decode(message.data) as JSONWarehouseItem
                    );

                    console.info(
                        `[TOKENIZATION-SERVICE] Adding item with id ${warehouseItem.item_id}`
                    );

                    await add_item(warehouseItem);

                    message.respond(jsonCodec.encode(warehouseItem));
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
        "update_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const warehouseItem = new WarehouseItem(
                    jsonCodec.decode(message.data) as JSONWarehouseItem
                );

                console.info(
                    `[TOKENIZATION-SERVICE] Updating item with id ${warehouseItem.item_id}`
                );

                try {
                    await update_item(warehouseItem);

                    message.respond(jsonCodec.encode(warehouseItem));
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
                            error: err
                        })
                    );
                }
            }
        }
    ],
    [
        "get_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const storage = await warehouseContract.storage<
                    WarehouseStorage
                >();
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONWarehouseItem;

                try {
                    const warehouseItem = (await storage.warehouse.get(
                        String(item_id)
                    )) as MichelsonWarehouseItem;

                    const jsonWarehouseItem = WarehouseItem.fromMichelson(
                        warehouseItem
                    );

                    message.respond(jsonCodec.encode(jsonWarehouseItem));
                } catch (err) {
                    console.error(err);
                }
            }
        }
    ]
];
