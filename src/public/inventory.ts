import { Subscription } from "nats";
import { JSONInventoryItem } from "../contracts/inventoryItem";

import { getConnection, jsonCodec, PublicNatsHandler } from "../services/nats";

export const inventoryPublicHandlers: PublicNatsHandler[] = [
    [
        "GET",
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const natsConnection = getConnection();
                const urlParameter = String(message.subject).split(".")[2];

                try {
                    const itemStoreGetInventoryItemResponse = await natsConnection.request(
                        "item-store.get_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: urlParameter
                        })
                    );

                    const inventoryItem = jsonCodec.decode(
                        itemStoreGetInventoryItemResponse.data
                    ) as JSONInventoryItem;

                    const getUserResponse = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id: inventoryItem.user_id
                        })
                    );

                    const user = jsonCodec.decode(getUserResponse.data) as {
                        inventory_address: string;
                    };

                    const tokenizationServiceGetInventoryItemReponse = await natsConnection.request(
                        "tokenization-service.get_inventory_item",
                        jsonCodec.encode({
                            inventory_address: user.inventory_address,
                            item_id: inventoryItem.item_id,
                            instance_number: inventoryItem.instance_number
                        })
                    );

                    message.respond(
                        tokenizationServiceGetInventoryItemReponse.data
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
        }
    ]
];
