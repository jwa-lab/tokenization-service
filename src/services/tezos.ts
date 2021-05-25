import {
    ContractAbstraction,
    ContractProvider,
    TezosToolkit
} from "@taquito/taquito";
import { importKey } from "@taquito/signer";
import tokenizationServiceContracts from "@jwalab/tokenization-service-contracts";

import { TEZOS_RPC_URI, WAREHOUSE_TEZOS_SECRET_KEY } from "../config";

let tezosClient: TezosToolkit;

export async function init(): Promise<void> {
    console.log(`[TOKENIZATION-SERVICE] Using Tezos RPC URI ${TEZOS_RPC_URI}`);

    tezosClient = new TezosToolkit(TEZOS_RPC_URI);
    tezosClient.setProvider({
        config: {
            // I wish I could override this confirmation in config.json but this currently doesn't work, resorting to calling
            // operation.confirmation(1, 1) instead everywhere in my code. will debug and submit a Taquito bug fix on GitHub if necessary
            confirmationPollingIntervalSecond: 1,
            confirmationPollingTimeoutSecond: 180
        }
    });

    await importKey(tezosClient, WAREHOUSE_TEZOS_SECRET_KEY);
}

export async function getContract<
    T extends ContractAbstraction<ContractProvider>
>(address: string): Promise<T> {
    try {
        return (await tezosClient.contract.at(address)) as T;
    } catch (err) {
        throw new Error(
            `[TOKENIZATION-SERVICE] No contract at address ${address}`
        );
    }
}

export async function deployContract<
    T extends ContractAbstraction<ContractProvider>,
    S
>(contractName: string, storage: S): Promise<T> {
    if (!(contractName in tokenizationServiceContracts)) {
        throw new Error(`Contract ${contractName} doesn't exist.`);
    }

    const originationOperation = await tezosClient.contract.originate({
        code: tokenizationServiceContracts[contractName].michelson,
        storage
    });

    const contract = await originationOperation.contract(1, 1);

    console.log(
        `[TOKENIZATION-SERVICE] ${contractName} contract deployed at ${contract.address}`
    );

    return contract as T;
}
