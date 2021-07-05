import { Subscription } from "nats";

import { getConnection, jsonCodec, PublicNatsHandler } from "../services/nats";

export const warehousePublicHandlers: PublicNatsHandler[] = [
    [
        "GET",
        "warehouse.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const urlParameter = String(message.subject).split(".")[2];


                    const response = await natsConnection.request(
                        "tokenization-service.get_warehouse_item",
                        jsonCodec.encode({
                            item_id: urlParameter
                        })
                    );

                    message.respond(response.data);
                } catch (err) {
                    console.error(err);

                    message.respond(
                        jsonCodec.encode({
                            error: err.message
                        })
                    );
                }
            }
        }
    ]
];
