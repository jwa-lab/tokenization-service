import { Contract, ContractMethod, ContractProvider, MichelsonMap } from "@taquito/taquito";

export interface RegistryContract extends Contract {
   methods: {
    add_token(
        decimals: number,
        extras: MichelsonMap<string, string>,
        name: string,
        symbol: string,
        token_id: number
    ): ContractMethod<ContractProvider>

    update_token(
        decimals: number,
        extras: MichelsonMap<string, string>,
        name: string,
        symbol: string,
        token_id: number
    ): ContractMethod<ContractProvider>
   }
}