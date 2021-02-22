import { Subscription } from "nats";
import { NatsHandler, jsonCodec } from "../nats";
import { WarehouseStorage } from "../contracts/warehouse.types";
import {
    add_item,
    update_item,
    freeze_item,
    warehouseContract
} from "../contracts/warehouse";
import {
    Collectible,
    MichelsonCollectible,
    JSONCollectible
} from "../contracts/collectible";
import { Client } from "@elastic/elasticsearch";
import { ELASTICSEARCH_URI } from "./config";


export const warehouseHandlers: NatsHandler[] = [
    [
        "tokenization-service_add_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const collectible = new Collectible(
                    jsonCodec.decode(message.data) as JSONCollectible
                );

                console.info(`Adding item with id ${collectible.item_id}`);

                let operation;

                try {
                    operation = await add_item(collectible);
                    await operation.confirmation(1, 1);

                    message.respond(
                        jsonCodec.encode({
                            item_id: collectible.item_id
                        })
                    );
                } catch (err) {
                    console.error(err);
                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],
    [
        "tokenization-service_update_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const collectible = new Collectible(
                    jsonCodec.decode(message.data) as JSONCollectible
                );

                console.info(`Updating item with id ${collectible.item_id}`);

                let operation;

                try {
                    operation = await update_item(collectible);

                    await operation.confirmation(1, 1);

                    message.respond(
                        jsonCodec.encode({
                            item_id: collectible.item_id
                        })
                    );
                } catch (err) {
                    console.error(err);
                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],

    [
        "tokenization-service_freeze_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONCollectible;

                console.info(`Freezing item with id ${item_id}`);

                let operation;

                try {
                    operation = await freeze_item(Number(item_id));
                    await operation.confirmation(1, 1);

                    message.respond(
                        jsonCodec.encode({
                            item_id: item_id
                        })
                    );
                } catch (err) {
                    console.error(err);
                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }
    ],

    [
        "tokenization-service_get_item",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                const storage = await warehouseContract.storage<
                    WarehouseStorage
                >();
                const { item_id } = jsonCodec.decode(
                    message.data
                ) as JSONCollectible;

                try {
                    const collectible = (await storage.warehouse.get(
                        String(item_id)
                    )) as MichelsonCollectible;
                    const jsonCollectible = Collectible.fromMichelson(
                        collectible
                    );

                    message.respond(jsonCodec.encode(jsonCollectible));
                } catch (err) {
                    console.error(err);
                }
            }
        }
    ],
    [
        "tokenisation-service_search_id_from_elasticsearch",
        async (subscription: Subscription): Promise<void> => {

            //I must initate the client here because there is no elasticsearch.ts file elsewhere
            let client: Client;

            async function initElasticSearch(): Promise<void> {
            client = new Client({ node: ELASTICSEARCH_URI });
            
            console.log(
                `[ITEM-STORE] Connected to ElasticSearch on ${ELASTICSEARCH_URI}`
            );
        }
            
 
          for await (const message of subscription) {
              const data = jsonCodec.decode(message.data) as JSONItem;
  
            try {
                const { body } = await client.search({
                    index: ELASTICSEARCH_INDEX_NAME,
                    body: {
                        item_id : data.item_id
                        doc: data
                    }
                });
    
                    message.respond(
                        jsonCodec.encode({
                            data
                        })
                    );
                    console.log(
                        `[ITEM-STORE] Item found in ${ELASTICSEARCH_INDEX_NAME}`,
                        data
                    );
                } catch (err) {
                    console.error(
                        `[ITEM-STORE] Error searching id from ${ELASTICSEARCH_INDEX_NAME}`,
                        err
                    );
    
                    message.respond(
                        jsonCodec.encode({
                            error: err
                        })
                    );
                }
            }
        }  
      ]
];
