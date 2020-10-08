import {
    BigMapAbstraction,
    Contract,
    ContractMethod,
    ContractProvider,
    MichelsonMap,
} from "@taquito/taquito";

export interface RegistryStorage {
    last_token_id: number;
    registry: BigMapAbstraction;
}

export interface RegistryContract extends Contract {
    storage: <RegistryStorage>() => Promise<RegistryStorage>;
    methods: {
        add_token(
            decimals: number,
            extras: MichelsonMap<string, string>,
            name: string,
            symbol: string,
            token_id: number
        ): ContractMethod<ContractProvider>;

        update_token(
            decimals: number,
            extras: MichelsonMap<string, string>,
            name: string,
            symbol: string,
            token_id: number
        ): ContractMethod<ContractProvider>;
    };
}
