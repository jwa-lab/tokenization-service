import { Client } from "@elastic/elasticsearch"
import { ELASTICSEARCH_URI } from "./config"

let client: Client

export function init() {
    console.log(`[ELASTICSEARCH] Connecting to Elasticsearch ${ ELASTICSEARCH_URI }`)
    client = new Client({ node: ELASTICSEARCH_URI })
}

export function getClient(): Client {
    return client;
}

export function close():void {
    console.log(`[ELASTICSEARCH] Closing connection to Elasticsearch ${ ELASTICSEARCH_URI }`)
    client.close()
}
