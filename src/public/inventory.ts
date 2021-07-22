import { Subscription } from "nats";

import { getConnection, jsonCodec, PublicNatsHandler } from "../services/nats";
import { inventoryIdValidator } from "../utils/validators";

interface UserResponse {
    inventory_address: string;
}

interface GetInventoryItemResponse {
    item_id: number;
    user_id: number;
    instance_number: number;
}

export const inventoryPublicHandlers: PublicNatsHandler[] = [
    [
        "GET",
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const natsConnection = getConnection();
                const inventory_item_id = String(message.subject).split(".")[2];

                try {
                    await inventoryIdValidator.validate(inventory_item_id);

                    const itemStoreGetInventoryItemResponse = await natsConnection.request(
                        "item-store.get_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id
                        })
                    );

                    const {
                        user_id,
                        instance_number,
                        item_id
                    } = jsonCodec.decode(
                        itemStoreGetInventoryItemResponse.data
                    ) as GetInventoryItemResponse;

                    const getUserResponse = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id
                        })
                    );

                    const { inventory_address } = jsonCodec.decode(
                        getUserResponse.data
                    ) as UserResponse;

                    const tokenizationServiceGetInventoryItemResponse = await natsConnection.request(
                        "tokenization-service.get_inventory_item",
                        jsonCodec.encode({
                            inventory_address,
                            item_id,
                            instance_number
                        })
                    );

                    message.respond(
                        tokenizationServiceGetInventoryItemResponse.data
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
