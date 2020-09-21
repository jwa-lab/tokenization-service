# Tokenization Service

Service for CRUD operations on NFTs using a user-friendly interface

## What is it?

Provides an easy to use API (REST-like or message-based) that triggers calls to a dApp.
The current implementation is a Node.js server using `@taquito` to translate `NATS.io` messages into calls to the [Tezos Smart Contract]
Reads are often performed on a Tezos indexer instead of running a Smart Contract function.

[tezos smart contract]: git@github.com:jwa-lab/tokenization-service-contracts.git
