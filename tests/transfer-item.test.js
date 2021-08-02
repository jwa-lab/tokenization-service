const { connect, JSONCodec } = require("nats");
const { JEST_TIMEOUT = 20000 } = process.env;

describe("Given Tokenization service is connected to NATS", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();

    beforeAll(async () => {
        natsConnection = await connect();
    });

    describe("Given an item is assigned to an inventory", () => {
        let newItemId = 30;
        let oldInventoryResponse;
        let oldInventoryAddress;

        beforeAll(async () =>{
            jest.setTimeout(JEST_TIMEOUT);
            await natsConnection.request(
                "tokenization-service.add_warehouse_item",
                jsonCodec.encode({
                    data: {
                        XP: "97"
                    },
                    item_id: newItemId,
                    name: "Lionel Messi",
                    total_quantity: 1000,
                    available_quantity: 1000
                }),
                { max: 1, timeout: JEST_TIMEOUT }
            );

            oldInventoryResponse = await natsConnection.request(
                "tokenization-service.create_inventory",
                undefined,
                { max: 1, timeout: JEST_TIMEOUT }
            );

            oldInventoryAddress = jsonCodec.decode(
                oldInventoryResponse.data
            ).inventory_address;

            await natsConnection.request(
                "tokenization-service.assign_inventory_item",
                jsonCodec.encode({
                    inventory_address: oldInventoryAddress,
                    item_id: newItemId,
                    instance_number: 1
                }),
                { max: 1, timeout: JEST_TIMEOUT }
            );

            await natsConnection.request(
                "tokenization-service.update_inventory_item",
                jsonCodec.encode({
                    instance_number: 1,
                    item_id: newItemId,
                    inventory_address: oldInventoryAddress,
                    data: {
                        club: "Olympique de Marseille"
                    }
                }),
                { max: 1, timeout: JEST_TIMEOUT }
            );
        });

        describe("When i transfer the assigned item to the new inventory", () => {
            let newInventoryResponse;
            let newInventoryAddress;
            let response;

            beforeAll(async () =>{
                jest.setTimeout(JEST_TIMEOUT);
                
                newInventoryResponse = await natsConnection.request(
                    "tokenization-service.create_inventory",
                    undefined,
                    { max: 1, timeout: JEST_TIMEOUT }
                );

                newInventoryAddress = jsonCodec.decode(
                    newInventoryResponse.data
                ).inventory_address;

                await natsConnection.request(
                    "tokenization-service.transfer_inventory_item",
                    jsonCodec.encode({
                        old_inventory_address: oldInventoryAddress,
                        instance_number: 1,
                        item_id: newItemId,
                        new_inventory_address: newInventoryAddress
                    }),
                    { max: 1, timeout: JEST_TIMEOUT }
                );
                
                response = await natsConnection.request(
                    "tokenization-service.get_inventory_item",
                    jsonCodec.encode({
                        inventory_address: newInventoryAddress,
                        item_id: newItemId,
                        instance_number: 1
                    }),
                    { max: 1, timeout: JEST_TIMEOUT }
                );
            });

            it("Then transfers the item to the new inventory", () =>{
                expect(jsonCodec.decode(response.data)).toEqual({
                    club: "Olympique de Marseille"
                });
            });
        });
    });
    afterAll(() => {
        natsConnection.close();
    });
});