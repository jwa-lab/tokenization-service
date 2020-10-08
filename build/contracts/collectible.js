"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Collectible = void 0;
const taquito_1 = require("@taquito/taquito");
class Collectible {
    constructor(object) {
        this.decimals = getKey(object, 'decimals');
        this.extras = getKey(object, 'extras');
        this.name = getKey(object, 'name');
        this.symbol = getKey(object, 'symbol');
        this.token_id = getKey(object, 'token_id');
    }
    toMichelsonArguments() {
        const collectible = {
            decimals: this.decimals,
            extras: taquito_1.MichelsonMap.fromLiteral(this.extras),
            name: this.name,
            symbol: this.symbol,
            token_id: this.token_id
        };
        return Object.keys(collectible)
            .sort()
            .map((key) => collectible[key]);
    }
    static fromMichelson(michelson) {
        return new Collectible({
            ...michelson,
            extras: mapToObj(michelson.extras)
        });
    }
}
exports.Collectible = Collectible;
function getKey(object, key) {
    if (!(key in object)) {
        throw new Error(`Collectible: Key ${key} is not present in collectible`);
    }
    else {
        return object[key];
    }
}
function mapToObj(map) {
    const obj = Object.create(null);
    map.forEach(([k, v]) => obj[k] = v);
    return obj;
}
