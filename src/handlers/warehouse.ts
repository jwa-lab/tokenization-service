import { Msg, NatsError } from "ts-nats";
import { NatsHandler } from "../nats";
import { getContract } from "../tezos";
import { WAREHOUSE_CONTRACT_ADDRESS } from "../config";
import {WarehouseContract,WarehouseStorage} from "../contracts/warehouse.types";
import { add_item, update_item, freeze_item } from "../contracts/warehouse";
import { Collectible, MichelsonCollectible } from "../contracts/collectible";
import { getClient } from "../nats";

export const warehouseHandlers: NatsHandler[] = [
    [
        "add_item",
        async (
            err: NatsError | null,
            msg: Msg,
            replyTo: string
        ): Promise<void> => {
            const client = getClient();
            const warehouseContract = await getContract<WarehouseContract>(
                WAREHOUSE_CONTRACT_ADDRESS
            );

            const collectible = new Collectible(JSON.parse(msg.data));

            console.log(`Adding item with id ${collectible.item_id}`);

            const operation = await add_item(warehouseContract, collectible);

            await operation.confirmation(1, 1);

            client.publish(
                replyTo,
                `add_item is running, got ${collectible.item_id}`
            );
        },
    ],
    [
        "update_item",
        async (
            err: NatsError | null,
            msg: Msg,
            replyTo: string
        ): Promise<void> => {
            const client = getClient();
            const warehouseContract = await getContract<WarehouseContract>(
                WAREHOUSE_CONTRACT_ADDRESS
            );

            const collectible = new Collectible(JSON.parse(msg.data));

            console.log(`Updating item with id ${collectible.item_id}`);

            const operation = await update_item(warehouseContract, collectible);

            await operation.confirmation(1, 1);

            client.publish(
                replyTo,
                `update_item is running, got ${collectible.item_id}`
            );
        },
    ],

    [
        "freeze_item",
        async (
            err: NatsError | null,
            msg: Msg,
            replyTo: string
        ): Promise<void> => {
            const client = getClient();
            const warehouseContract = await getContract<WarehouseContract>(
                WAREHOUSE_CONTRACT_ADDRESS
            );

            const collectible = new Collectible(JSON.parse(msg.data));

            console.log(`Freezing item with id ${collectible.item_id}`);

            const operation = await freeze_item(warehouseContract, collectible);

            await operation.confirmation(1, 1);

            client.publish(
                replyTo,
                `freeze_item is running, got ${collectible.item_id}`
            );
        },
    ],

    [
        "get_item",
        async (
            err: NatsError | null,
            msg: Msg,
            replyTo: string
        ): Promise<void> => {
            const client = getClient();
            const warehouseContract = await getContract<WarehouseContract>(
                WAREHOUSE_CONTRACT_ADDRESS
            );

            const storage = await warehouseContract.storage<WarehouseStorage>();

            try {
                const collectible = (await storage.warehouse.get(
                    msg.data
                )) as MichelsonCollectible;
                client.publish(replyTo, Collectible.fromMichelson(collectible));
            } catch (err) {
                console.error(err);
            }
        },
    ],
];
