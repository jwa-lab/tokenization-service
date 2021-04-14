import { Subscription } from "nats";

import { JSONWarehouseItem } from "../contracts/warehouseItem";
import { getConnection, jsonCodec, NatsHandler } from "../services/nats";

export const tokenizeHandlers: NatsHandler[] = [
    [
        "tokenize_warehouse_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const natsConnection = getConnection();
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONWarehouseItem;

                try {
                    const response = await natsConnection.request(
                        "item-store.get_warehouse_item",
                        jsonCodec.encode({
                            item_id
                        })
                    );

                    const wrappedItem = jsonCodec.decode(response.data) as {
                        item: JSONWarehouseItem;
                    };

                    const addItemResponse = await natsConnection.request(
                        "tokenization-service.add_warehouse_item",
                        jsonCodec.encode(wrappedItem.item),
                        { timeout: 10000 }
                    );

                    message.respond(addItemResponse.data);
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
