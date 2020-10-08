"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.update_token = exports.add_token = void 0;
async function add_token(contract, collectible) {
    return await contract.methods.add_token(...collectible.toMichelsonArguments()).send();
}
exports.add_token = add_token;
async function update_token(contract, collectible) {
    return await contract.methods.update_token(...collectible.toMichelsonArguments()).send();
}
exports.update_token = update_token;
