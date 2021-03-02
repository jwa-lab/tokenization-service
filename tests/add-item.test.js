const { connect, JSONCodec } = require("nats");

describe("Given Tokenization Service is connected to NATS", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    describe("When I add a new item", () => {
        let response;

        beforeAll(async () =>{
            jest.setTimeout(10000);
            response = await natsConnection.request(
                "tokenization-service_get_item_from_item-store",
                jsonCoded.enconde({
                    item_id: 10
                })
            )
        });

        beforeAll(async () => {
            jest.setTimeout(10000);
            response = await natsConnection.request(
                "tokenization-service_add_item",
                jsonCodec.encode({
                    data: {
                        XP: "97"
                    },
                    item_id: 10,
                    quantity: 0
                }),
                { max: 1, timeout: 10000 }
            );
        });

        it("Then returns the new item id", () => {
            expect(jsonCodec.decode(response.data).item_id).toBe(10);
        });

        describe("When I add an item with the same id", () => {
            beforeAll(async () => {
                jest.setTimeout(10000);
                response = await natsConnection.request(
                    "tokenization-service_add_item",
                    jsonCodec.encode({
                        data: {
                            XP: "97"
                        },
                        item_id: 10,
                        quantity: 0
                    }),
                    { max: 1, timeout: 10000 }
                );
            });

            it("then returns an error", () => {
                expect(jsonCodec.decode(response.data).error.message).toBe(
                    "ITEM_ID_ALREADY_EXISTS"
                );
            });
        });

        describe("When I retrieve the item by id", () => {
            beforeAll(async () => {
                response = await natsConnection.request(
                    "tokenization-service_get_item",
                    jsonCodec.encode({
                        item_id: 10
                    }),
                    { max: 1, timeout: 1000 }
                );
            });

            it("Then returns the item", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    data: {
                        XP: "97"
                    },
                    item_id: 10,
                    quantity: 0
                });
            });
        });
    });

    afterAll(() => {
        natsConnection.close();
    });
});
