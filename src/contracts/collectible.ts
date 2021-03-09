import { MichelsonMap } from "@taquito/taquito";
import { BigNumber } from "bignumber.js";

export interface MichelsonCollectible {
    data: MichelsonMap<string, string>;
    item_id: BigNumber;
    name: string;
    no_update_after: string | undefined;
    quantity: BigNumber;
    [key: string]:
        | MichelsonMap<string, string>
        | string
        | string
        | BigNumber
        | undefined;
}

export interface CollectibleData {
    [k: string]: string;
}

export interface JSONCollectible {
    no_update_after: string | undefined;
    item_id: number;
    name: string;
    data: { [k: string]: string };
    quantity: number;
    [key: string]: unknown;
}

type LinearCollectible = [
    MichelsonMap<string, string>,
    number,
    string,
    string | undefined,
    number
];

export class Collectible {
    readonly data: CollectibleData;
    readonly item_id: BigNumber;
    readonly name: string;
    readonly no_update_after: string | undefined;
    readonly quantity: BigNumber;

    constructor(object: { [k: string]: unknown }) {
        this.data = getKey(object, "data") as CollectibleData;
        this.item_id = getKey(object, "item_id") as BigNumber;
        this.name = object.name as string;
        this.no_update_after = object.no_update_after as string | undefined;
        this.quantity = getKey(object, "quantity") as BigNumber;

        this.validateData(this.data);
    }

    toMichelsonArguments(): LinearCollectible {
        const collectible = {
            data: MichelsonMap.fromLiteral(this.data),
            item_id: this.item_id,
            name: this.name,
            no_update_after: this.no_update_after,
            quantity: this.quantity
        } as MichelsonCollectible;

        return Object.keys(collectible)
            .sort()
            .map((key: string) => collectible[key]) as LinearCollectible;
    }

    static fromMichelson(michelson: MichelsonCollectible): JSONCollectible {
        return {
            no_update_after: michelson.no_update_after
                ? getISODateNoMs(new Date(michelson.no_update_after))
                : undefined,
            name: michelson.name.toString(),
            item_id: michelson.item_id.toNumber(),
            quantity: michelson.quantity.toNumber(),
            data: Object.fromEntries(michelson.data.entries())
        };
    }

    private validateData(data: CollectibleData): void {
        if (Object.values(data).some((datum) => typeof datum !== "string")) {
            throw new Error(`Collectible: Data must be 'string'`);
        }
    }
}

function getKey(object: { [k: string]: unknown }, key: string) {
    if (!(key in object)) {
        throw new Error(
            `Collectible: Key ${key} is not present in collectible`
        );
    } else {
        return object[key];
    }
}

function getISODateNoMs(date = new Date()) {
    date.setMilliseconds(0);
    return date.toISOString();
}
