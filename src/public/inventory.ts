import { JSONInventoryItem } from "@jwalab/tokenization-service-contracts";
import { Subscription } from "nats";
import * as yup from "yup";
import { getConnection, jsonCodec, PublicNatsHandler } from "../services/nats";
import { InventoryItemSchema } from "../private/inventory";

const InventorySchema = yup.object({
    inventory_item_id: yup
        .string()
        .strict()
        .typeError("inventory_item_id must be a string.")
        .defined("The inventory_item_id (string) must be provided.")
});

export const UserSchema = yup.object({
    user_id: yup
        .string()
        .strict()
        .typeError("user_id must be a string.")
        .defined("The user_id (string) must be provided.")
});

export const inventoryPublicHandlers: PublicNatsHandler[] = [
    [
        "GET",
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const natsConnection = getConnection();
                const urlParameter = String(message.subject).split(".")[2];

                try {
                    const inventory_item_id = urlParameter;
                    await InventorySchema.validate({ inventory_item_id });
                    const itemStoreGetInventoryItemResponse = await natsConnection.request(
                        "item-store.get_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: urlParameter
                        })
                    );

                    const inventoryItem = jsonCodec.decode(
                        itemStoreGetInventoryItemResponse.data
                    ) as JSONInventoryItem;

                    const user_id = inventoryItem.user_id;
                    await UserSchema.validate({ user_id });
                    const getUserResponse = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id: inventoryItem.user_id
                        })
                    );

                    const user = jsonCodec.decode(getUserResponse.data) as {
                        inventory_address: string;
                    };

                    const tokenizationServiceGetInventoryItemResponse = await natsConnection.request(
                        "tokenization-service.get_inventory_item",
                        jsonCodec.encode({
                            inventory_address: user.inventory_address,
                            item_id: inventoryItem.item_id,
                            instance_number: inventoryItem.instance_number
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
