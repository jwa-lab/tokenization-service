import { Subscription } from "nats";
import { SERVICE_NAME } from "../config";
import * as yup from "yup";

import {
    AirlockPayload,
    getConnection,
    jsonCodec,
    PublicNatsHandler
} from "../services/nats";
import { UserSchema } from "./inventory";

interface CreateInventoryRequest {
    user_id: string;
}

interface CreateInventoryResponse {
    inventory_address: string;
}

interface GetInventoryItemResponse {
    user_id: string;
    item_id: number;
    instance_number: number;
}

interface GetInventoryItemResponse {
    user_id: string;
    item_id: number;
    instance_number: number;
    data: { [k: string]: string };
}

export const SearchByUserIdRequest = yup.object({
    item_id: yup
        .number()
        .strict()
        .typeError("item_id must be an integer.")
        .min(0)
        .defined("The item_id (positive integer) must be provided.")
});

const InventorySchema = yup.object({
    inventory_item_id: yup
        .string()
        .strict()
        .typeError("inventory_item_id must be a string.")
        .defined("The inventory_item_id (string) must be provided.")
});

export const tokenizePublicHandlers: PublicNatsHandler[] = [
    [
        "PUT",
        "warehouse.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const urlParameter = String(message.subject).split(".")[2];

                    const item_id = urlParameter;
                    await SearchByUserIdRequest.validate({ item_id });
                    const response = await natsConnection.request(
                        "item-store.get_warehouse_item",
                        jsonCodec.encode({
                            item_id: urlParameter
                        })
                    );

                    const wrappedItem = jsonCodec.decode(response.data);

                    const addItemResponse = await natsConnection.request(
                        "tokenization-service.add_warehouse_item",
                        jsonCodec.encode(wrappedItem),
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
        },
        {
            queue: SERVICE_NAME
        }
    ],
    [
        "POST",
        "inventory",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();

                    const data = jsonCodec.decode(
                        message.data
                    ) as AirlockPayload;
                    const {
                        user_id
                    } = (data.body as unknown) as CreateInventoryRequest;

                    await UserSchema.validate({ user_id });
                    const getUserResponse = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id
                        })
                    );

                    const user = jsonCodec.decode(getUserResponse.data) as {
                        user_id: number;
                        inventory_address?: string;
                    };

                    if (user.inventory_address) {
                        throw new Error(
                            `User ${user_id} already has an inventory assigned. Assigning a new inventory will result in permanent loss of collectibles.`
                        );
                    }

                    const newInventoryResponse = await natsConnection.request(
                        "tokenization-service.create_inventory",
                        undefined,
                        { timeout: 10000 }
                    );

                    const inventoryAddress = (jsonCodec.decode(
                        newInventoryResponse.data
                    ) as CreateInventoryResponse).inventory_address;

                    await UserSchema.validate({ user_id });
                    const updateUserResponse = await natsConnection.request(
                        "item-store.update_user",
                        jsonCodec.encode({
                            user_id: user_id,
                            user: {
                                ...user,
                                inventory_address: inventoryAddress
                            }
                        })
                    );

                    message.respond(updateUserResponse.data);
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
        "PUT",
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const [, , itemDocumentId] = String(message.subject).split(
                        "."
                    );

                    const inventory_item_id = itemDocumentId;
                    await InventorySchema.validate({ inventory_item_id });
                    const getInventoryItemResponse = await natsConnection.request(
                        "item-store.get_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: itemDocumentId
                        })
                    );

                    const {
                        item_id,
                        user_id,
                        instance_number
                    } = jsonCodec.decode(
                        getInventoryItemResponse.data
                    ) as GetInventoryItemResponse;

                    await UserSchema.validate({ user_id });
                    const getUserResponse = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id
                        })
                    );

                    const { inventory_address } = jsonCodec.decode(
                        getUserResponse.data
                    ) as { inventory_address: string };

                    const assignInventoryItemResponse = await natsConnection.request(
                        "tokenization-service.assign_inventory_item",
                        jsonCodec.encode({
                            item_id,
                            instance_number,
                            inventory_address
                        }),
                        { timeout: 10000 }
                    );

                    message.respond(assignInventoryItemResponse.data);
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
        "PATCH",
        "inventory.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const [, , itemDocumentId] = String(message.subject).split(
                        "."
                    );

                    const inventory_item_id = itemDocumentId;
                    await InventorySchema.validate({ inventory_item_id });
                    const getInventoryItemResponse = await natsConnection.request(
                        "item-store.get_inventory_item",
                        jsonCodec.encode({
                            inventory_item_id: itemDocumentId
                        })
                    );

                    const {
                        item_id,
                        user_id,
                        instance_number,
                        data
                    } = jsonCodec.decode(
                        getInventoryItemResponse.data
                    ) as GetInventoryItemResponse;

                    await UserSchema.validate({ user_id });
                    const getUserResponse = await natsConnection.request(
                        "item-store.get_user",
                        jsonCodec.encode({
                            user_id
                        })
                    );

                    const { inventory_address } = jsonCodec.decode(
                        getUserResponse.data
                    ) as { inventory_address: string };

                    const updateInventoryItemResponse = await natsConnection.request(
                        "tokenization-service.update_inventory_item",
                        jsonCodec.encode({
                            item_id,
                            instance_number,
                            inventory_address,
                            data
                        }),
                        { timeout: 10000 }
                    );

                    message.respond(updateInventoryItemResponse.data);
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
    ]
];
