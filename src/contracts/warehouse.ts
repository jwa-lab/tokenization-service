import { TransactionOperation } from "@taquito/taquito/dist/types/operations/transaction-operation";

import { WAREHOUSE_CONTRACT_ADDRESS } from "../config";
import { getContract, deployContract } from "../tezos";

import { WarehouseContract } from "./warehouse.types";
import { Collectible } from "./collectible";

export let warehouseContract: WarehouseContract;

export async function initWarehouseContract(): Promise<void> {
    if (WAREHOUSE_CONTRACT_ADDRESS) {
        warehouseContract = await getContract<WarehouseContract>(
            WAREHOUSE_CONTRACT_ADDRESS
        );
    } else {
        warehouseContract = await deployContract<WarehouseContract>(
            "warehouse"
        );
    }
}

export function add_item(
    collectible: Collectible
): Promise<TransactionOperation> {
    return warehouseContract.methods
        .add_item(...collectible.toMichelsonArguments())
        .send();
}

export async function update_item(
    collectible: Collectible
): Promise<TransactionOperation> {
    return await warehouseContract.methods
        .update_item(...collectible.toMichelsonArguments())
        .send();
}

export async function freeze_item(
    item_id: number
): Promise<TransactionOperation> {
    return await warehouseContract.methods.freeze_item(item_id).send();
}
