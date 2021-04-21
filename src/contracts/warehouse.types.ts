import {
    BigMapAbstraction,
    Contract,
    ContractMethod,
    ContractProvider,
    MichelsonMap
} from "@taquito/taquito";

export interface WarehouseStorage {
    owner: string;
    version: string;
    warehouse: BigMapAbstraction;
}

export interface WarehouseContract extends Contract {
    storage: <WarehouseStorage>() => Promise<WarehouseStorage>;
    methods: {
        add_item(
            available_quantity: number,
            data: MichelsonMap<string, string>,
            item_id: number,
            name: string,
            no_update_after: string | undefined,
            quantity: number
        ): ContractMethod<ContractProvider>;

        update_item(
            available_quantity: number,
            data: MichelsonMap<string, string>,
            item_id: number,
            name: string,
            no_update_after: string | undefined,
            quantity: number
        ): ContractMethod<ContractProvider>;

        assign_item(
            user_id : number,
            item_id : number
        ): ContractMethod<ContractProvider>;
        
        freeze_item(item_id: number): ContractMethod<ContractProvider>;
    };
}
