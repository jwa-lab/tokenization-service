"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.close = exports.natsUnsubscribe = exports.registerHandlers = exports.init = void 0;
const ts_nats_1 = require("ts-nats");
const config_1 = require("./config");
let natsClient;
async function init() {
    console.log(`Connecting to NATS server ${config_1.NATS_URL}...`);
    natsClient = await ts_nats_1.connect({
        servers: [config_1.NATS_URL],
    });
}
exports.init = init;
async function registerHandlers(handlers) {
    return await Promise.all(
        handlers.map(([topic, handler]) => natsClient.subscribe(topic, handler))
    );
}
exports.registerHandlers = registerHandlers;
function natsUnsubscribe(natsSubscriptions) {
    natsSubscriptions.forEach((sub) => sub.unsubscribe());
}
exports.natsUnsubscribe = natsUnsubscribe;
function close() {
    console.log(`Closing connection to NATS server ${config_1.NATS_URL}`);
    natsClient.close();
}
exports.close = close;
