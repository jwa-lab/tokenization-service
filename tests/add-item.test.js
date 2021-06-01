const { connect, JSONCodec } = require("nats");
const { JEST_TIMEOUT = 20000 } = process.env;

describe("Given Tokenization Service is connected to NATS", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    describe("When I add a new item", () => {
        let response;
        let itemId = 24;

        beforeAll(async () => {
            jest.setTimeout(JEST_TIMEOUT);
            response = await natsConnection.request(
                "tokenization-service.add_warehouse_item",
                jsonCodec.encode({
                    data: {
                        XP: "97"
                    },
                    item_id: itemId,
                    name: "Christiano Ronaldo",
                    total_quantity: 1000,
                    available_quantity: 1000
                }),
                { max: 1, timeout: JEST_TIMEOUT }
            );
        });

        it("Then returns the new item", () => {
            expect(jsonCodec.decode(response.data)).toEqual({
                data: {
                    XP: "97"
                },
                item_id: itemId,
                name: "Christiano Ronaldo",
                total_quantity: 1000,
                available_quantity: 1000
            });
        });

        describe("When I add an item with the same id", () => {
            beforeAll(async () => {
                jest.setTimeout(JEST_TIMEOUT);
                response = await natsConnection.request(
                    "tokenization-service.add_warehouse_item",
                    jsonCodec.encode({
                        data: {
                            XP: "97"
                        },
                        item_id: itemId,
                        name: "Christiano Ronaldo",
                        total_quantity: 1000,
                        available_quantity: 1000
                    }),
                    { max: 1, timeout: JEST_TIMEOUT }
                );
            });

            it("then returns an error", () => {
                expect(jsonCodec.decode(response.data).error.message).toBe(
                    "ITEM_ID_ALREADY_EXISTS"
                );
            });
        });

        describe("When I add an item with a Validation Error (a field [name] is missing)", () => {
            beforeAll(async () => {
                jest.setTimeout(JEST_TIMEOUT);
                response = await natsConnection.request(
                    "tokenization-service.add_warehouse_item",
                    jsonCodec.encode({
                        data: {
                            XP: "97"
                        },
                        item_id: itemId,
                        total_quantity: 1000,
                        available_quantity: 1000
                    }),
                    { max: 1, timeout: JEST_TIMEOUT }
                );
            });

            it("then returns an error", () => {
                expect(jsonCodec.decode(response.data).error.message).toEqual(
                    "The name (string) must be provided."
                );
            });
        });

        describe("When I add an item with a Validation Error (a field [total_quantity] is wrong-typed)", () => {
            beforeAll(async () => {
                jest.setTimeout(JEST_TIMEOUT);
                response = await natsConnection.request(
                    "tokenization-service.add_warehouse_item",
                    jsonCodec.encode({
                        data: {
                            XP: "97"
                        },
                        item_id: itemId,
                        name: "Christiano Ronaldo",
                        total_quantity: "aerty",
                        available_quantity: 1000
                    }),
                    { max: 1, timeout: JEST_TIMEOUT }
                );
            });

            it("then returns an error", () => {
                expect(jsonCodec.decode(response.data).error.message).toEqual(
                    "total_quantity must be a number."
                );
            });
        });

        describe("When I retrieve the item by id", () => {
            beforeAll(async () => {
                jest.setTimeout(JEST_TIMEOUT);
                response = await natsConnection.request(
                    "tokenization-service.get_warehouse_item",
                    jsonCodec.encode({
                        item_id: itemId
                    }),
                    { max: 1, timeout: JEST_TIMEOUT }
                );
            });

            it("Then returns the item", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    data: {
                        XP: "97"
                    },
                    item_id: itemId,
                    name: "Christiano Ronaldo",
                    total_quantity: 1000,
                    available_quantity: 1000
                });
            });
        });

        describe("When I update the item", () => {
            beforeAll(async () => {
                jest.setTimeout(JEST_TIMEOUT);
                response = await natsConnection.request(
                    "tokenization-service.update_warehouse_item",
                    jsonCodec.encode({
                        data: {
                            XP: "98"
                        },
                        item_id: itemId,
                        name: "Christiano Ronaldo",
                        total_quantity: 50,
                        available_quantity: 50
                    }),
                    { max: 1, timeout: JEST_TIMEOUT }
                );
            });

            it("Then returns the new item", () => {
                expect(jsonCodec.decode(response.data)).toEqual({
                    data: {
                        XP: "98"
                    },
                    item_id: itemId,
                    name: "Christiano Ronaldo",
                    total_quantity: 50,
                    available_quantity: 50
                });
            });
        });
    });

    afterAll(() => {
        natsConnection.close();
    });
});
