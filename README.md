# Tokenization Service

Service for CRUD operations on NFTs using a user-friendly interface

## What is it?

The current implementation is a Node.js server using `@taquito` to translate `NATS.io` messages into calls to the [Tokenization Service Contracts]
Reads and Writes directly to and from the blockchain. For faster CRUD operations on items you may want to use the [Item Store], which is backed by an Elastic Search database and offers fast and free operations. Durable storage in the blockchain could be delayed based on business rules.

[tokenization service contracts]: git@github.com:jwa-lab/tokenization-service-contracts.git
[item store]: https://github.com/jwa-lab/item-store

## How to setup Dev environment:

1. Start a minilab locally: https://github.com/jwa-lab/minilab
2. Start the supporting services (item-store, elasticsearch) by running `docker-compose up` in this folder
3. Start the service in dev mode which will automatically deploy a new Smart Contract for you upon startp. This should only be used in development mode and not in production!

```
./run dev
```

To use an existing Smart Contract instead:

4. Deploy this service's contract: https://github.com/jwa-lab/tokenization-service-contracts

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

On your machine, set the `WAREHOUSE_CONTRACT_ADDRESS` environment variable:

```
export WAREHOUSE_CONTRACT_ADDRESS=KT1RedbZ6vuAgTqBeJMiHGcvhkMLCUBKVGN9
```

```
./run dev
```

### Test

To test this service, follow the steps listed in `How to setup Dev environment`

Then:

```
npm run test
```

It will run our beautiful JEST test suite.
