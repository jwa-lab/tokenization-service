import { MichelsonMap } from "@taquito/michelson-encoder";

export type JSONInventoryItem = { [k: string]: string };

export function toMichelsonInventoryItem(
    data: JSONInventoryItem
): MichelsonMap<string, string> {
    return MichelsonMap.fromLiteral(data) as MichelsonMap<string, string>;
}

export function fromMichelsonInventoryItem(
    data: MichelsonMap<string, string>
): JSONInventoryItem {
    return Object.fromEntries(data.entries());
}
