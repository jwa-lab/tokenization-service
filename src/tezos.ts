import {
    ContractAbstraction,
    ContractProvider,
    TezosToolkit,
} from "@taquito/taquito";
import { importKey } from "@taquito/signer";

import { TEZOS_RPC_URI, WAREHOUSE_TEZOS_SECRET_KEY } from "./config";

let tezosClient: TezosToolkit;

export async function init(): Promise<void> {
    console.log(`[TEZOS] Using Tezos RPC URI ${TEZOS_RPC_URI}`);

    tezosClient = new TezosToolkit();
    tezosClient.setProvider({
        rpc: TEZOS_RPC_URI,
        config: {
            // I wish I could override this confirmation in config.json but this currently doesn't work, resorting to calling
            // operation.confirmation(1, 1) instead everywhere in my code. will debug and submit a Taquito bug fix on GitHub if necessary
            confirmationPollingIntervalSecond: 1,
            confirmationPollingTimeoutSecond: 180,
        },
    });

    await importKey(tezosClient, WAREHOUSE_TEZOS_SECRET_KEY);
}

export async function getContract<
    T extends ContractAbstraction<ContractProvider>
>(address: string): Promise<T> {
    return (await tezosClient.contract.at(address)) as T;
}
