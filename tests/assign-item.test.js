const { connect, JSONCodec } = require("nats");
const { JEST_TIMEOUT = 20000 } = process.env;

describe("Given Tokenization Service is connected to NATS", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    describe("And there is an available item", () => {
        let response;
        let newItemId = 27;

        beforeAll(async () => {
            jest.setTimeout(JEST_TIMEOUT);
            response = await natsConnection.request(
                "tokenization-service.add_warehouse_item",
                jsonCodec.encode({
                    data: {
                        XP: "97"
                    },
                    item_id: newItemId,
                    name: "Karim Benzema",
                    total_quantity: 9,
                    available_quantity: 9
                }),
                { max: 1, timeout: JEST_TIMEOUT }
            );
        });

        describe("When I create a new inventory contract", () => {
            let inventoryAddress;

            beforeAll(async () => {
                jest.setTimeout(JEST_TIMEOUT);
                response = await natsConnection.request(
                    "tokenization-service.create_inventory",
                    undefined,
                    { timeout: JEST_TIMEOUT }
                );

                inventoryAddress = jsonCodec.decode(response.data)
                    .inventory_address;
            });

            it("Then returns the new inventory address", () => {
                expect(typeof inventoryAddress).toBe("string");
            });

            describe("When I try to assign this item to the new inventory but with a Validation Error (a field [inventory_address] is missing)", () => {
                beforeAll(async () => {
                    jest.setTimeout(JEST_TIMEOUT);
                    response = await natsConnection.request(
                        "tokenization-service.assign_inventory_item",
                        jsonCodec.encode({
                            item_id: newItemId,
                            instance_number: 1
                        }),
                        { timeout: JEST_TIMEOUT }
                    );
                });

                it("Then returns an error", () => {
                    expect(jsonCodec.decode(response.data).error).toEqual(
                        "The inventory_address (string) must be provided."
                    );
                });

                describe("When I try to assign this item to the new inventory but with a Validation Error (a field [instance_number] is wrong-typed)", () => {
                    beforeAll(async () => {
                        jest.setTimeout(JEST_TIMEOUT);
                        response = await natsConnection.request(
                            "tokenization-service.assign_inventory_item",
                            jsonCodec.encode({
                                inventory_address: inventoryAddress,
                                item_id: newItemId,
                                instance_number: "azerty"
                            }),
                            { timeout: JEST_TIMEOUT }
                        );
                    });

                    it("Then returns an error", () => {
                        expect(jsonCodec.decode(response.data).error).toEqual(
                            "instance_number must be a number."
                        );
                    });

                    describe("When I assign this item to the new inventory", () => {
                        beforeAll(async () => {
                            jest.setTimeout(JEST_TIMEOUT);
                            response = await natsConnection.request(
                                "tokenization-service.assign_inventory_item",
                                jsonCodec.encode({
                                    inventory_address: inventoryAddress,
                                    item_id: newItemId,
                                    instance_number: 1
                                }),
                                { timeout: JEST_TIMEOUT }
                            );
                        });

                        it("Then reflects the request back", () => {
                            expect(jsonCodec.decode(response.data)).toEqual({
                                inventory_address: inventoryAddress,
                                item_id: newItemId,
                                instance_number: 1
                            });
                        });

                        describe("When I retrieve the item from the inventory", () => {
                            beforeAll(async () => {
                                response = await natsConnection.request(
                                    "tokenization-service.get_inventory_item",
                                    jsonCodec.encode({
                                        inventory_address: inventoryAddress,
                                        item_id: newItemId,
                                        instance_number: 1
                                    })
                                );
                            });

                            it("Then returns the item data", () => {
                                expect(jsonCodec.decode(response.data)).toEqual(
                                    {}
                                );
                            });
                        });

                        describe("And I update this item", () => {
                            beforeAll(async () => {
                                jest.setTimeout(JEST_TIMEOUT);
                                response = await natsConnection.request(
                                    "tokenization-service.update_inventory_item",
                                    jsonCodec.encode({
                                        instance_number: 1,
                                        item_id: newItemId,
                                        inventory_address: inventoryAddress,
                                        data: {
                                            club: "Real Madrid"
                                        }
                                    }),
                                    { timeout: JEST_TIMEOUT }
                                );
                            });

                            it("Then reflects the request back", () => {
                                expect(jsonCodec.decode(response.data)).toEqual(
                                    {
                                        instance_number: 1,
                                        item_id: newItemId,
                                        inventory_address: inventoryAddress,
                                        data: {
                                            club: "Real Madrid"
                                        }
                                    }
                                );
                            });

                            describe("When I retrieve the item from the inventory", () => {
                                beforeAll(async () => {
                                    response = await natsConnection.request(
                                        "tokenization-service.get_inventory_item",
                                        jsonCodec.encode({
                                            inventory_address: inventoryAddress,
                                            item_id: newItemId,
                                            instance_number: 1
                                        })
                                    );
                                });

                                it("Then returns the item data", () => {
                                    expect(
                                        jsonCodec.decode(response.data)
                                    ).toEqual({
                                        club: "Real Madrid"
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

    afterAll(() => {
        natsConnection.close();
    });
});
