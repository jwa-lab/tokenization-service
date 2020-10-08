import { MichelsonMap } from "@taquito/taquito";

export interface MichelsonCollectible {
    decimals: number;
    extras: MichelsonMap<string, string>;
    name: string;
    symbol: string;
    token_id: number;
    [key: string]: number | MichelsonMap<string, string> | string;
}

export interface CollectibleExtras {
    [k: string]: string
}

type LinearCollectible = [number, MichelsonMap<string, string>, string, string, number];

export class Collectible {
    readonly decimals: number;
    readonly extras: CollectibleExtras;
    readonly name: string;
    readonly symbol: string;
    readonly token_id: number;

    constructor(object: { [k: string]: unknown}) {
        this.decimals = getKey(object, 'decimals') as number;
        this.extras = getKey(object, 'extras') as CollectibleExtras;
        this.name = getKey(object, 'name') as string;
        this.symbol = getKey(object, 'symbol') as string;
        this.token_id = getKey(object, 'token_id') as number;

        this.validateExtras(this.extras);
    }

    toMichelsonArguments(): LinearCollectible {
        const collectible = {
            decimals: this.decimals,
            extras: MichelsonMap.fromLiteral(this.extras),
            name: this.name,
            symbol: this.symbol,
            token_id: this.token_id
        } as MichelsonCollectible;

        return Object.keys(collectible)
                    .sort()
                    .map((key: string) => collectible[key]) as LinearCollectible;
    }

    static fromMichelson(michelson: MichelsonCollectible): Collectible {
        return new Collectible({
            ...michelson,
            extras: mapToObj(michelson.extras)
        })
    }

    private validateExtras(extras: CollectibleExtras): void {
        if (Object.values(extras).some(extra => typeof extra !== "string")) {
            throw new Error(`Collectible: Extras must be 'string'`)
        }
    }
}

function getKey(object: {[k: string]: unknown}, key: string) {
    if (!(key in object)) {
        throw new Error(`Collectible: Key ${ key } is not present in collectible`);
    } else {
        return object[key];
    }
}

function mapToObj(map: MichelsonMap<string, string>) {
    const obj = Object.create(null);

    map.forEach(([k, v]) => obj[k] = v)

    return obj;
}