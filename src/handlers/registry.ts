import { Msg, NatsError } from 'ts-nats'
import { NatsHandler } from '../nats'
import { getContract } from '../tezos'
import { REGISTRY_CONTRACT_ADDRESS } from '../config'
import { RegistryContract } from '../contracts/registry.types'
import { add_token, update_token } from '../contracts/registry'
import { Collectible } from '../contracts/collectible'

export const registryHandlers: NatsHandler[] = [
    ['add_token', async (err: NatsError | null, msg: Msg): Promise<void> => {
        const registryContract = await getContract<RegistryContract>(REGISTRY_CONTRACT_ADDRESS);

        const collectible = new Collectible(JSON.parse(msg.data));

        console.log(`Adding token with id ${ collectible.token_id }`);

        const operation = await add_token(registryContract, collectible);

        await operation.confirmation(1, 1);
    }],
    ['update_token', async (err: NatsError | null, msg: Msg): Promise<void> => {
        const registryContract = await getContract<RegistryContract>(REGISTRY_CONTRACT_ADDRESS);

        const collectible = new Collectible(JSON.parse(msg.data));

        console.log(`Updating token with id ${ collectible.token_id }`);

        const operation = await update_token(registryContract, collectible);

        await operation.confirmation(1, 1)
    }],
    ['get_token', async (err: NatsError | null, msg: Msg): Promise<void> => {
        const registryContract = await getContract<RegistryContract>(REGISTRY_CONTRACT_ADDRESS);

        const storage = await registryContract.storage() as any;

        try {
            const collectible  = await storage.registry.get(msg.data)
            console.log(Collectible.fromMichelson(collectible))
        } catch (err) {
            console.error(err)
        }
    }]
]