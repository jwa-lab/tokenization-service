import { validateAddress } from "@taquito/utils";

const {
    NATS_URL = "",
    TEZOS_RPC_URI = "",
    WAREHOUSE_TEZOS_SECRET_KEY = "",
    WAREHOUSE_CONTRACT_ADDRESS = "",
    ELASTICSEARCH_URI = ""
} = process.env;

if (!TEZOS_RPC_URI) {
    throw new Error(
        `Please provide a valid Tezos node URI via "TEZOS_RPC_URI", for instance https://api.tez.ie/rpc/mainnet`
    );
}

if (typeof NATS_URL === "undefined") {
    throw new Error(
        `Please provide a valid NATS_URL so the service can connect to NATS. For example, use nats://nats:4222`
    );
}

if (!WAREHOUSE_TEZOS_SECRET_KEY) {
    throw new Error(
        `Please provide an uncrypted private key to sign transactions with via WAREHOUSE_SECRET_KEY.`
    );
}

if (!validateAddress(WAREHOUSE_CONTRACT_ADDRESS)) {
    throw new Error(
        `Please provide a valid KT1 address to access the WAREHOUSE via WAREHOUSE_CONTRACT_ADDRESS`
    );
}

if (typeof ELASTICSEARCH_URI === "undefined") {
    throw new Error(
        `Please provide a valid ELASTICSEARCH_URI so the service can connect to Elasticsearch. For example, use http://localhost:9200`
    )
}

export {
    ELASTICSEARCH_URI,
    NATS_URL,
    WAREHOUSE_CONTRACT_ADDRESS,
    WAREHOUSE_TEZOS_SECRET_KEY,
    TEZOS_RPC_URI
};
