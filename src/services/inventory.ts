import {
    fromMichelsonInventoryItem,
    InventoryContract,
    InventoryStorage,
    JSONInventoryItem,
    toMichelsonInventoryItem
} from "@jwalab/tokenization-service-contracts";
import { MichelsonMap } from "@taquito/michelson-encoder";

import { deployContract, getContract } from "../services/tezos";

import { getWarehouseContract } from "./warehouse";

export async function initInventoryContract(): Promise<string> {
    const inventoryContract = await deployContract<
        InventoryContract,
        InventoryStorage
    >("inventory", MichelsonMap.fromLiteral({}) as unknown as InventoryStorage);

    return inventoryContract.address;
}

export async function assign_item(
    inventory_address: string,
    item_id: number,
    instance_number: number
): Promise<void> {
    const warehouseContract = getWarehouseContract();

    const operation = await warehouseContract.methods
        .assign_item_proxy(inventory_address, item_id, instance_number)
        .send();

    await operation.confirmation(1, 1);
}

export async function update_item(
    inventory_address: string,
    data: JSONInventoryItem,
    item_id: number,
    instance_number: number
): Promise<void> {
    const inventoryContract = await getContract<InventoryContract>(
        inventory_address
    );

    const operation = await inventoryContract.methods
        .update_item(toMichelsonInventoryItem(data), instance_number, item_id)
        .send();

    await operation.confirmation(1, 1);
}

export async function transfer_item(
    old_inventory_address: string,
    new_inventory_address: string,
    instance_number: number,
    item_id: number
): Promise<void> {
    const inventoryContract = await getContract<InventoryContract>(
        old_inventory_address
    );

    const operation = await inventoryContract.methods
        .transfer_item(instance_number, item_id, new_inventory_address)
        .send();

    await operation.confirmation(1, 1);
}

export async function get_item(
    inventory_address: string,
    item_id: number,
    instance_number: number
): Promise<JSONInventoryItem> {
    const inventoryContract = await getContract<InventoryContract>(
        inventory_address
    );
    const storage = await inventoryContract.storage<InventoryStorage>();

    const itemInstances = await storage.get(String(item_id));

    let item;

    if (!itemInstances) {
        throw new Error(
            `Contract ${inventory_address} doesn't have an item with id ${item_id}`
        );
    } else {
        item = itemInstances.get(String(instance_number));

        if (!item) {
            throw new Error(
                `Contract ${inventory_address} doesn't have an instance ${instance_number} for item id ${item_id}`
            );
        }
    }

    return fromMichelsonInventoryItem(item);
}
