import { deployContract, getContract } from "../services/tezos";

import {
    InventoryContract,
    InventoryStorage
} from "../contracts/inventory.types";
import {
    fromMichelsonInventoryItem,
    JSONInventoryItem,
    toMichelsonInventoryItem
} from "../contracts/inventoryItem";

import { getWarehouseContract } from "./warehouse";
import { MichelsonMap } from "@taquito/michelson-encoder";

export async function initInventoryContract(): Promise<string> {
    const inventoryContract = await deployContract<
        InventoryContract,
        InventoryStorage
    >("inventory", MichelsonMap.fromLiteral({}) as InventoryStorage);

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
    const warehouseContract = await getContract<InventoryContract>(
        inventory_address
    );

    const operation = await warehouseContract.methods
        .update_item(toMichelsonInventoryItem(data), item_id, instance_number)
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
