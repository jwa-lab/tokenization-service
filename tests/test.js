const { connect } = require("nats");

// temporary test, needs ugprade to actual test suite
async function init() {
    const natsClient = await connect();

    natsClient.request(
        "add_item",
        '{"data":{"XP":"200"},"item_id":10, "quantity":0}',
        { max: 1, timeout: 1000 },
        () => {
            natsClient.request(
                "get_item",
                "10",
                { max: 1, timeout: 1000 },
                (msg) => {
                    console.log(`Item 1: ${msg} `);
                }
            );
        }
    );
}

init();
