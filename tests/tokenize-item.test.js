const { connect, JSONCodec } = require("nats");

describe("Given Tokenization Service is connected to NATS", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    describe("When I add an existing item", () => {
        let response;

        beforeAll(async () => {
            response = await natsConnection.request(
                "tokenization-service_tokenize_existing_item",
                jsonCodec.encode({
                    item_id: 10
                }),
            );
        });
    });
});