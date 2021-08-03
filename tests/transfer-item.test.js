const { connect, JSONCodec } = require("nats");
const { JEST_TIMEOUT = 20000 } = process.env;

describe("Given a warehouse item is assigned to an inventory", () => {
    let natsConnection;
    let jsonCodec = JSONCodec();
    let newItemId = 28;
    let oldInventoryAddress;
    let oldInventoryResponse;

    beforeAll(async () => {
        jest.setTimeout(JEST_TIMEOUT);

        natsConnection = await connect();
        
        await natsConnection.request(
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
                    club: "Real Madrid"
                }
            }),
            { max: 1, timeout: JEST_TIMEOUT }
        );
    });

    describe("When I transfer the inventory item to a new user", () => {
        let newInventoryAddress;
        let newInventoryResponse;
        let response;

        beforeAll(async () => {
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
                    new_inventory_address: newInventoryAddress,
                    instance_number: 1,
                    item_id: newItemId
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
        
        it("Then the item has been transfered to the new inventory", () => {
            expect(jsonCodec.decode(response.data)).toEqual({ 
                club: "Real Madrid" 
            });
        });
    });

    afterAll(async () => {
        await natsConnection.close();
    });
});
