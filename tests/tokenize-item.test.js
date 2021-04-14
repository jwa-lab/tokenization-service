const { connect, JSONCodec } = require("nats");

describe("Given Tokenization Service is connected to NATS", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    describe("And there is an existing item", () => {
        let response;
        let newItemId;

        beforeAll(async () => {
            response = await natsConnection.request(
                "item-store.add_warehouse_item",
                jsonCodec.encode({
                    data: {
                        XP: "100"
                    },
                    name: "Leo Messi",
                    total_quantity: 1000,
                    available_quantity: 1000
                })
            );

            newItemId = jsonCodec.decode(response.data).item_id;
        });

        describe("When I tokenize an existing item", () => {
            beforeAll(async () => {
                jest.setTimeout(10000);

                response = await natsConnection.request(
                    "tokenization-service.tokenize_warehouse_item",
                    jsonCodec.encode({
                        item_id: newItemId
                    }),
                    { timeout: 10000 }
                );
            });

            it("Then returns the item", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    item_id: newItemId,
                    data: {
                        XP: "100"
                    },
                    name: "Leo Messi",
                    total_quantity: 1000,
                    available_quantity: 1000
                });
            });
        });
    });

    afterAll(() => {
        natsConnection.close();
    });
});
