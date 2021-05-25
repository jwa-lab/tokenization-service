import { MichelsonMap } from "@taquito/taquito";

import {
    WAREHOUSE_CONTRACT_ADDRESS,
    WAREHOUSE_TEZOS_PUBLIC_KEY_HASH
} from "../config";
import { getContract, deployContract } from "./tezos";

import {
    WarehouseContract,
    WarehouseStorage,
    WarehouseBigMap,
    LinearWarehouseItem,
    WarehouseItem
} from "@jwalab/tokenization-service-contracts";

export let warehouseContract: WarehouseContract;

export async function initWarehouseContract(): Promise<void> {
    if (WAREHOUSE_CONTRACT_ADDRESS) {
        warehouseContract = await getContract<WarehouseContract>(
            WAREHOUSE_CONTRACT_ADDRESS
        );
    } else {
        warehouseContract = await deployContract<
            WarehouseContract,
            WarehouseStorage
        >("warehouse", {
            owner: WAREHOUSE_TEZOS_PUBLIC_KEY_HASH,
            version: "1",
            warehouse: (MichelsonMap.fromLiteral(
                {}
            ) as unknown) as WarehouseBigMap
        });
    }
}

export async function add_item(
    warehouseItem: WarehouseItem
): Promise<WarehouseItem> {
    const operation = await warehouseContract.methods
        .add_item(
            ...(warehouseItem.toMichelsonArguments() as LinearWarehouseItem)
        )
        .send();

    await operation.confirmation(1, 1);

    return warehouseItem;
}

export async function update_item(
    warehouseItem: WarehouseItem
): Promise<WarehouseItem> {
    const operation = await warehouseContract.methods
        .update_item(
            ...(warehouseItem.toMichelsonArguments() as LinearWarehouseItem)
        )
        .send();

    await operation.confirmation(1, 1);

    return warehouseItem;
}

export async function freeze_item(item_id: number): Promise<number> {
    const operation = await warehouseContract.methods
        .freeze_item(item_id)
        .send();

    await operation.confirmation(1, 1);

    return item_id;
}

export function getWarehouseContract(): WarehouseContract {
    return warehouseContract;
}
