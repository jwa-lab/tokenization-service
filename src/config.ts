import { validateAddress } from '@taquito/utils'

const {
    NATS_URL = '',
    TEZOS_RPC_URI = '',
    REGISTRY_TEZOS_SECRET_KEY = '',
    REGISTRY_CONTRACT_ADDRESS = ''
} = process.env;

if (!TEZOS_RPC_URI) {
    throw new Error(`Please provide a valid Tezos node URI via "TEZOS_RPC_URI", for instance https://api.tez.ie/rpc/mainnet`);
}

if (typeof NATS_URL === 'undefined') {
    throw new Error(`Please provide a valid NATS_URL so the service can connect to NATS. For example, use nats://nats:4222`);
}

if (!REGISTRY_TEZOS_SECRET_KEY) {
    throw new Error(`Please provide an uncrypted private key to sign transactions with via REGISTRY_SECRET_KEY.`);
}

if (!validateAddress(REGISTRY_CONTRACT_ADDRESS)) {
    throw new Error(`Please provide a valid KT1 address to access the registry via REGISTRY_CONTRACT_ADDRESS`)
}

export {
    TEZOS_RPC_URI,
    NATS_URL,
    REGISTRY_TEZOS_SECRET_KEY,
    REGISTRY_CONTRACT_ADDRESS
};

