const { connect } = require("nats");

// temporary test, needs ugprade to actual test suite
async function init() {
    const natsClient = await connect();

    natsClient.request("add_item", 
        '{"data":{"XP":"97"},"item_id":1,"quantity":0}',
        { max: 1, timeout: 1000 },
        () => {
            natsClient.request('get_item', '1', { max: 1, timeout: 1000 }, (msg) => {
                console.log(`Item 1: ${msg} `);
            });
        });
}

init();
