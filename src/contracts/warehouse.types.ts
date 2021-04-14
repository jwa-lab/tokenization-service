import {
    Contract,
    ContractMethod,
    ContractProvider,
    MichelsonMap
} from "@taquito/taquito";
import { MichelsonWarehouseItem } from "./warehouseItem";

export type WarehouseBigMap = MichelsonMap<string, MichelsonWarehouseItem>;

export interface WarehouseStorage {
    owner: string;
    version: string;
    warehouse: WarehouseBigMap;
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
            total_quantity: number
        ): ContractMethod<ContractProvider>;

        update_item(
            available_quantity: number,
            data: MichelsonMap<string, string>,
            item_id: number,
            name: string,
            no_update_after: string | undefined,
            total_quantity: number
        ): ContractMethod<ContractProvider>;

        freeze_item(item_id: number): ContractMethod<ContractProvider>;

        assign_item_proxy(
            inventory_address: string,
            item_id: number,
            instance_number: number
        ): ContractMethod<ContractProvider>;
    };
}
