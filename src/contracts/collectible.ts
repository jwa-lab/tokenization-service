import { MichelsonMap } from "@taquito/taquito";

export interface MichelsonCollectible {
    data: MichelsonMap<string, string>;
    item_id: number;
    no_update_after: string | undefined;
    quantity: number;
    [key: string]: number | MichelsonMap<string, string> | string | undefined;
}

export interface CollectibleData {
    [k: string]: string;
}

type LinearCollectible = [
    MichelsonMap<string, string>,
    number,
    string | undefined,
    number
];

export class Collectible {
    readonly data: CollectibleData;
    readonly item_id: number;
    readonly no_update_after: string | undefined;
    readonly quantity: number;

    constructor(object: { [k: string]: unknown }) {
        this.data = getKey(object, "data") as CollectibleData;
        this.item_id = getKey(object, "item_id") as number;
        this.no_update_after = object.no_update_after as string | undefined;
        this.quantity = getKey(object, "quantity") as number;

        this.validateData(this.data);
    }

    toMichelsonArguments(): LinearCollectible {
        const collectible = {
            data: MichelsonMap.fromLiteral(this.data),
            item_id: this.item_id,
            no_update_after: this.no_update_after,
            quantity: this.quantity,
        } as MichelsonCollectible;

        return Object.keys(collectible)
            .sort()
            .map((key: string) => collectible[key]) as LinearCollectible;
    }

    static fromMichelson(michelson: MichelsonCollectible): Collectible {
        return new Collectible({
            ...michelson,
            data: mapToObj(michelson.data),
        });
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

function mapToObj(map: MichelsonMap<string, string>) {
    const obj = Object.create(null);

    map.forEach(([k, v]) => (obj[k] = v));

    return obj;
}
