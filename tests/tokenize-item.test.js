const { connect, JSONCodec } = require("nats");

describe("Given Tokenization Service is connected to NATS", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    describe("And there is an existing item", () => {
        let response;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store_add_item",
                jsonCodec.encode({
                    item_id: 11,
                    data: {
                        XP: "100"
                    },
                    name: "Leo Messi",
                    quantity: 1000
                })
            );
        });

        describe("When I tokenize an existing item", () => {
            beforeAll(async () => {
                jest.setTimeout(10000);

                response = await natsConnection.request(
                    "tokenization-service_tokenize_existing_item",
                    jsonCodec.encode({
                        item_id: 11
                    }),
                    { timeout: 10000 }
                );
            });

            it("Then returns the item", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    item_id: 11,
                    data: {
                        XP: "100"
                    },
                    name: "Leo Messi",
                    quantity: 1000
                });
            });
        });
    });

    afterAll(() => {
        natsConnection.close();
    });
});
