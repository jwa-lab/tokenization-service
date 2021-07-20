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

        describe("When I create two inventory contracts", () => {
            let oldInventoryAddress;
            let newInventoryAddress;

            beforeAll(async () => {
                jest.setTimeout(JEST_TIMEOUT);
                oldInventoryResponse = await natsConnection.request(
                    "tokenization-service.create_inventory",
                    undefined,
                    { timeout: JEST_TIMEOUT }
                );

                newInventoryResponse = await natsConnection.request(
                    "tokenization-service.create_inventory",
                    undefined,
                    { timeout: JEST_TIMEOUT }
                );

                oldInventoryAddress = jsonCodec.decode(
                    oldInventoryResponse.data
                ).inventory_address;

                newInventoryAddress = jsonCodec.decode(
                    newInventoryResponse.data
                ).inventory_address;
            });

            describe("When I assign this item to the old inventory", () => {
                beforeAll(async () => {
                    jest.setTimeout(JEST_TIMEOUT);
                    response = await natsConnection.request(
                        "tokenization-service.assign_inventory_item",
                        jsonCodec.encode({
                            inventory_address: oldInventoryAddress,
                            item_id: newItemId,
                            instance_number: 1
                        }),
                        { timeout: JEST_TIMEOUT }
                    );
                });

                it("Then updates the inventory item data", () => {
                    beforeAll(async () => {
                        jest.setTimeout(JEST_TIMEOUT);
                        response = await natsConnection.request(
                            "tokenization-service.update_inventory_item",
                            jsonCodec.encode({
                                instance_number: 1,
                                item_id: newItemId,
                                inventory_address: oldInventoryAddress,
                                data: {
                                    club: "Real Madrid"
                                }
                            }),
                            { timeout: JEST_TIMEOUT }
                        );
                    });
                });

                it("Then transfers the item to the new Inventory", () => {
                    beforeAll(async () => {
                        response = await natsConnection.request(
                            "tokenization-service.transfer_inventory_item",
                            jsonCodec.encode({
                                old_inventory_address: oldInventoryAddress,
                                new_inventory_address: newInventoryAddress,
                                instance_number: 1,
                                item_id: newItemId
                            })
                        );

                        describe("When I retrieve the item from the new inventory", () => {
                            beforeAll(async () => {
                                response = await natsConnection.request(
                                    "tokenization-service.get_inventory_item",
                                    jsonCodec.encode({
                                        inventory_address: newInventoryAddress,
                                        item_id: newItemId,
                                        instance_number: 1
                                    })
                                );
                            });

                            it("Then returns the item data", () => {
                                expect(jsonCodec.decode(response.data)).toEqual(
                                    {
                                        data: { club: "Real Madrid" }
                                    }
                                );
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
