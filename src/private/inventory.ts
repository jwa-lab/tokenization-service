import { JSONInventoryItem } from "@jwalab/tokenization-service-contracts";

import { Subscription } from "nats";
import { SERVICE_NAME } from "../config";
import {
    assign_item,
    initInventoryContract,
    update_item,
    get_item
} from "../services/inventory";
import { jsonCodec, PrivateNatsHandler } from "../services/nats";
import * as yup from "yup";

interface AssignItemRequest {
    inventory_address: string;
    item_id: number;
    instance_number: number;
}

interface UpdateItemRequest {
    inventory_address: string;
    data: JSONInventoryItem;
    item_id: number;
    instance_number: number;
}

interface GetItemRequest {
    inventory_address: string;
    item_id: number;
    instance_number: number;
}

const InventoryItemSchema = yup.object({
    inventory_address: yup
        .string()
        .strict()
        .typeError("inventory_address must be a string.")
        .required("The inventory_address (string) must be provided."),
    item_id: yup
        .number()
        .typeError("item_id must be a number.")
        .positive("item_id must be a positive number.")
        .required("The item_id (integer) must be provided."),
    instance_number: yup
        .number()
        .typeError("instance_number must be a number.")
        .positive("instance number must be a positive number.")
        .required("The instance_number (integer) must be provided.")
});

const Data = yup.object({
    data: yup.lazy((value) => {
        if (value === undefined || value === null) {
            return yup
                .object()
                .required("The data (object of string(s)) must be provided.");
        } else {
            const schema = Object.keys(value).reduce(
                (acc: any, curr: string) => {
                    acc[curr] = yup
                        .string()
                        .strict()
                        .typeError("data's field must be a string.")
                        .required(
                            "The data's field (string) must be provided."
                        );
                    return acc;
                },
                {}
            );
            return yup
                .object()
                .shape(schema)
                .required("The data (object of string(s)) must be provided.");
        }
    })
});

export const inventoryPrivateHandlers: PrivateNatsHandler[] = [
    [
        "create_inventory",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const inventoryAddress = await initInventoryContract();

                    console.log(
                        `[TOKENIZATION-SERVICE] Created inventory contract ${inventoryAddress}`
                    );

                    message.respond(
                        jsonCodec.encode({
                            inventory_address: inventoryAddress
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
        "assign_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const {
                    instance_number,
                    inventory_address,
                    item_id
                } = jsonCodec.decode(message.data) as AssignItemRequest;

                try {
                    await InventoryItemSchema.validate({
                        instance_number,
                        inventory_address,
                        item_id
                    });

                    await assign_item(
                        inventory_address,
                        item_id,
                        instance_number
                    );

                    console.log(
                        `[TOKENIZATION-SERVICE] Assigned item ${item_id}, instance number ${instance_number} to contract ${inventory_address}`
                    );

                    message.respond(message.data);
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
        "update_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const {
                    instance_number,
                    inventory_address,
                    item_id,
                    data
                } = jsonCodec.decode(message.data) as UpdateItemRequest;

                try {
                    await InventoryItemSchema.validate({
                        instance_number,
                        inventory_address,
                        item_id
                    });
                    await Data.validate({ data });
                    await update_item(
                        inventory_address,
                        data,
                        item_id,
                        instance_number
                    );

                    console.log(
                        `[TOKENIZATION-SERVICE] Updated item ${item_id}, instance number ${instance_number} in contract ${inventory_address}`
                    );

                    message.respond(message.data);
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
        "get_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const {
                    instance_number,
                    inventory_address,
                    item_id
                } = jsonCodec.decode(message.data) as GetItemRequest;

                try {
                    await InventoryItemSchema.validate({
                        instance_number,
                        inventory_address,
                        item_id
                    });
                    const item = await get_item(
                        inventory_address,
                        item_id,
                        instance_number
                    );

                    console.log(
                        `[TOKENIZATION-SERVICE] Get item ${item_id}, instance number ${instance_number} from contract ${inventory_address}`
                    );

                    message.respond(jsonCodec.encode(item));
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
