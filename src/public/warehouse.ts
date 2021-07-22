import { Subscription } from "nats";

import { getConnection, jsonCodec, PublicNatsHandler } from "../services/nats";
import { itemIdValidator } from "../utils/validators";

export const warehousePublicHandlers: PublicNatsHandler[] = [
    [
        "GET",
        "warehouse.*",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    const natsConnection = getConnection();
                    const item_id = Number(message.subject.split(".")[2]);

                    await itemIdValidator.validate(item_id);

                    const response = await natsConnection.request(
                        "tokenization-service.get_warehouse_item",
                        jsonCodec.encode({
                            item_id
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
