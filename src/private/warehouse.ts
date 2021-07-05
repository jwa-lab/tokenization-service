import {
    JSONWarehouseItem,
    MichelsonWarehouseItem,
    WarehouseItem,
    WarehouseStorage
} from "@jwalab/tokenization-service-contracts";
import { Subscription } from "nats";
import * as yup from "yup";

import { SERVICE_NAME } from "../config";
import { PrivateNatsHandler, jsonCodec } from "../services/nats";

import {
    add_item,
    update_item,
    freeze_item,
    warehouseContract
} from "../services/warehouse";

const WarehouseItemSchema = yup.object({
    available_quantity: yup
        .number()
        .typeError("available_quantity must be a number.")
        .required("The available_quantity (integer) must be provided."),
    item_id: yup
        .number()
        .typeError("item_id must be a number.")
        .positive("item_id must be a positive number.")
        .required("The item_id (integer) must be provided."),
    name: yup
        .string()
        .strict()
        .typeError("name must be a string.")
        .required("The name (string) must be provided."),
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
    }),
    total_quantity: yup
        .number()
        .typeError("total_quantity must be a number.")
        .required("The total_quantity (integer) must be provided.")
});

const ItemN = yup.object({
    item_id: yup
        .number()
        .typeError("item_id must be a number.")
        .positive("item_id must be a positive number.")
        .required("The item_id (integer) must be provided.")
});

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
                    await WarehouseItemSchema.validate(warehouseItem);
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
        },
        {
            queue: SERVICE_NAME
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
                    WarehouseItemSchema.validate(warehouseItem);
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
                    const number_item_id = Number(item_id);
                    ItemN.validate({ number_item_id });
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
        },
        {
            queue: SERVICE_NAME
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
                    const string_item_id = String(item_id);
                    ItemN.validate(string_item_id);
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
