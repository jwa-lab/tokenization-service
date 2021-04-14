import { MichelsonMap } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";

export interface MichelsonWarehouseItem {
    available_quantity: BigNumber;
    data: MichelsonMap<string, string>;
    item_id: BigNumber;
    name: string;
    no_update_after: string | undefined;
    total_quantity: BigNumber;
    [key: string]:
        | MichelsonMap<string, string>
        | string
        | string
        | BigNumber
        | undefined;
}

export interface WarehouseData {
    [k: string]: string;
}

export interface JSONWarehouseItem {
    available_quantity: number;
    no_update_after: string | undefined;
    item_id: number;
    name: string;
    data: { [k: string]: string };
    total_quantity: number;
    [key: string]: unknown;
}

type LinearWarehouseItem = [
    number,
    MichelsonMap<string, string>,
    number,
    string,
    string | undefined,
    number
];

export class WarehouseItem {
    readonly available_quantity: BigNumber;
    readonly data: WarehouseData;
    readonly item_id: BigNumber;
    readonly name: string;
    readonly no_update_after: string | undefined;
    readonly total_quantity: BigNumber;

    constructor(object: { [k: string]: unknown }) {
        this.available_quantity = getKey(
            object,
            "available_quantity"
        ) as BigNumber;
        this.data = getKey(object, "data") as WarehouseData;
        this.item_id = getKey(object, "item_id") as BigNumber;
        this.name = object.name as string;
        this.no_update_after = object.no_update_after as string | undefined;
        this.total_quantity = getKey(object, "total_quantity") as BigNumber;

        this.validateData(this.data);
    }

    toMichelsonArguments(): LinearWarehouseItem {
        const warehouseItem = {
            available_quantity: this.available_quantity,
            data: MichelsonMap.fromLiteral(this.data),
            item_id: this.item_id,
            name: this.name,
            no_update_after: this.no_update_after,
            total_quantity: this.total_quantity
        } as MichelsonWarehouseItem;

        return Object.keys(warehouseItem)
            .sort()
            .map((key: string) => warehouseItem[key]) as LinearWarehouseItem;
    }

    static fromMichelson(michelson: MichelsonWarehouseItem): JSONWarehouseItem {
        return {
            available_quantity: michelson.available_quantity.toNumber(),
            no_update_after: michelson.no_update_after
                ? getISODateNoMs(new Date(michelson.no_update_after))
                : undefined,
            name: michelson.name.toString(),
            item_id: michelson.item_id.toNumber(),
            total_quantity: michelson.total_quantity.toNumber(),
            data: Object.fromEntries(michelson.data.entries())
        };
    }

    private validateData(data: WarehouseData): void {
        if (Object.values(data).some((datum) => typeof datum !== "string")) {
            throw new Error(`WarehouseItem: Data must be 'string'`);
        }
    }
}

function getKey(object: { [k: string]: unknown }, key: string) {
    if (!(key in object)) {
        throw new Error(
            `WarehouseItem: Key ${key} is not present in warehouseItem`
        );
    } else {
        return object[key];
    }
}

function getISODateNoMs(date = new Date()) {
    date.setMilliseconds(0);
    return date.toISOString();
}
