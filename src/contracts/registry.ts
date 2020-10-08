import { TransactionOperation } from "@taquito/taquito/dist/types/operations/transaction-operation";
import { RegistryContract } from "./registry.types";
import { Collectible } from "./collectible";

export function add_token(
    contract: RegistryContract,
    collectible: Collectible
): Promise<TransactionOperation> {
    return contract.methods
        .add_token(...collectible.toMichelsonArguments())
        .send();
}

export async function update_token(
    contract: RegistryContract,
    collectible: Collectible
): Promise<TransactionOperation> {
    return await contract.methods
        .update_token(...collectible.toMichelsonArguments())
        .send();
}
