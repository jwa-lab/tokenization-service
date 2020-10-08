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
3. The build this service

```
./run build
```

To run the service, you need to locate the newly deployed contract's KT1 address:

```
# After deploying the smart contract, find the Kt1 address here:

2_registry_migration.js
=======================

   Replacing 'Registry'
   --------------------
   > operation hash:      opCjc7Wz9vTfRGte8zwRCrW3P9daESUyaTj6hK9ypEVYo5AeaEq
   > Blocks: 0            Seconds: 8
   > contract address:    _KT1WpVpKdDs3o3PUcwyapJX4N2XGyJUV9YMm_
   > block number:        5
   > block timestamp:     2020-10-08T15:39:12Z
   > account:             tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb
   > balance:             1999998.559226
   > gas used:            28348
   > storage used:        725 bytes
   > fee spent:           3.804 mtz
   > burn cost:           0.982 tez
   > value sent:          0 XTZ
   > total cost:          0.985804 XTZ

   > Saving artifacts
   -------------------------------------
   > Total cost:            0.985804 XTZ
```

And edit the `./run` script

```
./run start
````