import {
    Contract,
    ContractMethod,
    ContractProvider,
    MichelsonMap
} from "@taquito/taquito";

export type InventoryStorage = MichelsonMap<
    string,
    MichelsonMap<string, MichelsonMap<string, string>>
>;

export interface InventoryContract extends Contract {
    storage: <InventoryStorage>() => Promise<InventoryStorage>;
    methods: {
        assign_item(
            data: MichelsonMap<string, string>,
            instance_number: number,
            item_id: number
        ): ContractMethod<ContractProvider>;

        update_item(
            data: MichelsonMap<string, string>,
            instance_number: number,
            item_id: number
        ): ContractMethod<ContractProvider>;
    };
}
