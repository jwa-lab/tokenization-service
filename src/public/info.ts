import { Subscription } from "nats";

import { jsonCodec, PublicNatsHandler } from "../services/nats";
import { getWarehouseContract } from "../services/warehouse";

export const infoPublicHandlers: PublicNatsHandler[] = [
    [
        "GET",
        "info",
        async (subscription: Subscription): Promise<void> => {
            for await (const message of subscription) {
                try {
                    message.respond(
                        jsonCodec.encode({
                            warehouse_address: getWarehouseContract().address
                        })
                    );
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
