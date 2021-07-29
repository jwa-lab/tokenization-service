import { JSONInventoryItem } from "@jwalab/tokenization-service-contracts";
import { Subscription } from "nats";

import {
    assign_item,
    initInventoryContract,
    update_item,
    get_item,
    transfer_item
} from "../services/inventory";
import { jsonCodec, PrivateNatsHandler } from "../services/nats";
import { SERVICE_NAME } from "../config";

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

interface TransferItemRequest {
    old_inventory_address: string;
    new_inventory_address: string;
    instance_number: number;
    item_id: number;
}

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
                const { instance_number, inventory_address, item_id } =
                    jsonCodec.decode(message.data) as AssignItemRequest;

                try {
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
                const { instance_number, inventory_address, item_id, data } =
                    jsonCodec.decode(message.data) as UpdateItemRequest;

                try {
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
                const { instance_number, inventory_address, item_id } =
                    jsonCodec.decode(message.data) as GetItemRequest;

                try {
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
    ],
    [
        "transfer_inventory_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const {
                    old_inventory_address,
                    new_inventory_address,
                    instance_number,
                    item_id
                } = jsonCodec.decode(message.data) as TransferItemRequest;

                try {
                    await transfer_item(
                        old_inventory_address,
                        new_inventory_address,
                        instance_number,
                        item_id
                    );

                    console.log(
                        `[TOKENIZATION-SERVICE] Transfer item ${item_id}, instance number ${instance_number} from contract ${old_inventory_address} to ${new_inventory_address}`
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
        }
    ]
];
