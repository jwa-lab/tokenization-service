const { connect, JSONCodec } = require("nats");

const items = [];

async function init() {
    const jsconCodec = new JSONCodec();

    const nc = await connect({ servers: "localhost:4222" });

    const addWarehouseItemSub = nc.subscribe("item-store.add_warehouse_item");
    const getWarehouseItemSub = nc.subscribe("item-store.get_warehouse_item");

    (async () => {
        for await (const message of addWarehouseItemSub) {
            const item = jsconCodec.decode(message.data);

            const item_id = items.length;

            items.push({
                ...item,
                item_id
            });

            console.log(`[MOCK-ITEM-STORE] adding item ${item_id}`);

            message.respond(
                jsconCodec.encode({
                    item_id
                })
            );
        }
    })().then();

    (async () => {
        for await (const message of getWarehouseItemSub) {
            const item_id = jsconCodec.decode(message.data).item_id;

            console.log(`[MOCK-ITEM-STORE] getting item ${item_id}`);

            message.respond(
                jsconCodec.encode({
                    item: items[item_id]
                })
            );
        }
    })().then();
}

init();
