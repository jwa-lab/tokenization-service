import { TransactionOperation } from "@taquito/taquito/dist/types/operations/transaction-operation";
import { WarehouseContract } from "./warehouse.types";
import { Collectible } from "./collectible";

export function add_token(
    contract: WarehouseContract,
    collectible: Collectible
): Promise<TransactionOperation> {
    return contract.methods
        .add_item(...collectible.toMichelsonArguments())
        .send();
}

export async function update_item(
    contract: WarehouseContract,
    collectible: Collectible
): Promise<TransactionOperation> {
    return await contract.methods
        .update_item(...collectible.toMichelsonArguments())
        .send();
}

export async function freeze_item(
    contract: WarehouseContract,
    collectible: Collectible
    
): Promise<TransactionOperation> {
    return await contract.methods
        .freeze_item(...collectible.toMichelsonArguments())
        .send();
}
