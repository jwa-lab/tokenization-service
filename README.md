# Tokenization Service

Service for CRUD operations on NFTs using a user-friendly interface

## What is it?

Provides an easy to use API (REST-like or message-based) that triggers calls to a dApp.
The current implementation is a Node.js server using `@taquito` to translate `NATS.io` messages into calls to the [Tezos Smart Contract]
Reads are often performed on a Tezos indexer instead of running a Smart Contract function.

[tezos smart contract]: git@github.com:jwa-lab/tokenization-service-contracts.git

## How to setup Dev environment:

1. Start a minilab locally: https://github.com/jwa-lab/minilab
2. Install this service's contract: https://github.com/jwa-lab/tokenization-service-contracts
3. Then build this service

```
./run build
```

To run the service, you need to locate the newly deployed contract's KT1 address:

```
# After deploying the smart contract, find the Kt1 address here:

2_warehouse_migration.js
========================

   Deploying 'Warehouse'
   ---------------------
   > operation hash:      ooF629Q1rK4KUnP4GHNKitMbKJPB2Nb5tWuD4D8vEmiN53TP5ad
   > Blocks: 0            Seconds: 12
   > contract address:    KT1RedbZ6vuAgTqBeJMiHGcvhkMLCUBKVGN9
   > block number:        15
   > block timestamp:     2021-01-25T04:08:37Z
   > account:             tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb
   > balance:             1999997.88266
   > gas used:            49158
   > storage used:        1397 bytes
   > fee spent:           6.571 mtz
   > burn cost:           1.654 tez
   > value sent:          0 XTZ
   > total cost:          1.660571 XTZ


   > Saving migration to chain.
   > Saving artifacts
   -------------------------------------
   > Total cost:            1.660571 XTZ
```

And edit the `./run` script, set `WAREHOUSE_CONTRACT_ADDRESS=KT1RedbZ6vuAgTqBeJMiHGcvhkMLCUBKVGN9`

```
./run start
```

### Develop

To run this service in `develop` mode, simply run

```
./run dev
```

This will run a `nodemon` checking when files change and automatically restarting the recompiled Typescript sources.

### Test

To test this service, follow the steps listed in `How to setup Dev environment`

Then:

```
node tests/test.js
```

It should create a new item and output it back after creation.
