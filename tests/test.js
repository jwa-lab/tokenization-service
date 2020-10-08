const { connect } = require('ts-nats')

// temporary test, needs ugprade to actual test suite
async function init() {
    const natsClient = await connect()

    // natsClient.publish('add_token', JSON.stringify({
    //         decimals: 0,
    //         extras: {
    //             "XP": "97"
    //         },
    //         name: "CR7",
    //         symbol: "JWA-CR7",
    //         token_id: 0
    //     }));

    natsClient.publish('get_token', "1");

}

init()