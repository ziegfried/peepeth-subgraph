# Peepeth Subgraph

This [subgraph](https://thegraph.com/explorer/subgraph/ziegfried/peepeth) sources events from [Peepeth](https://peepeth.com), the the blockchain-powered social network.

## Example query

```graphql
{
  # 5 lastest peeps
  peeps(first: 5, orderBy: number, orderDirection: desc) {
    number
    content
    timestamp
    # Get some account info from the author of the peep
    account {
      name
      realName
    }
    # Get message this peep is sharing
    share {
      content
      account {
        name
        realName
      }
    }
  }
  # Get total number of accounts and peeps on Peepeth
  peepeth(id: "global") {
    numberOfPeeps
    numberOfAccounts
  }
}
```

## Demo App

Check out the demo app, which uses the subgraph to show some Peepeth accounts, their followers and peeps.

See it live here: [https://peepeth-subgraph.sigi.dev/](https://peepeth-subgraph.sigi.dev/)

<div align="center">
    <img src="./demo-app/screenshot.png" width="550px"</img> 
</div>

Find the sources and some more info in the [/demo-app](/demo-app) folder

## How Peepeth works

For a high-level overview see [https://peepeth.com/how](https://peepeth.com/how).

Basically peepeth uses a [stateless smart contract](https://medium.com/@childsmaidment/stateless-smart-contracts-21830b0cd1b6) where (arguments to) method calls point to JSON blobs on IPFS. The transaction is submitted and signed by the user.

```
  Ethereum Tx                      IPFS File
+---------------------+          +----------------------------+
| createAccount(      |          |{                           |
|   name: "Hugo",     |          |  "realName": "Hugo Foobar",|
|   ipfsHash: "Qm..." +--------->+  "location": "Somewhere",  |
| )                   |          |  ...                       |
+---------------------+          |}                           |
                                 +----------------------------+
```

Most actions can be performed this way, see [ABI](abis/Contract.json) for details. Some actions do not have corresponding JSON data in IPFS (follow/unfollow for example).

### Batched actions

To reduce cost, Peepeth allows the user to batch a number of actions and submit them at once. In this case the ethereum function call points to a JSON blob in IPFS that contains a list of actions (which can in turn point to JSON blobs in IPFS).

```
   Ethereum Tx             IPFS File 1
+-------------------+    +--------------------------------+       IPFS File 2
|saveBatch(         |    |{                               |     +---------------------------+
|  ipfsHash: "Qm..X"+--->+  "batchSaveJSON": [            |     |{                          |
|)                  |    |    { "follow": { "followee": "0|     |  "type": "peep",          |
+-------------------+    |    { "peep": { "ipfs": "Qm...J"+---->+  "content": "hello world",|
                         |  ]                             |     |  ...                      |
                         |}                               |     |}                          |
                         +--------------------------------+     +---------------------------+
```

### Signed actions

See

- [https://peepeth.com/a/free](https://peepeth.com/a/free)
- [https://medium.com/coinmonks/evolution-of-decentralised-social-media-dfe567d23e54](https://medium.com/coinmonks/evolution-of-decentralised-social-media-dfe567d23e54)

Basically allows users to perform actions for free. User sign action(s) and a central service submits signed batches for all users to the blockchain.

Similar to regular batch, signed actions are stored in JSON documents on IPFS, pointing to other IPFS hashes. The user creates a signature of the IPFS hash of the actual action document using ethereum-style elliptic curve cryptography (`eth_sign`).

## Known issues

- Not not all peeps, accounts, followers are recorded correctly by the subgraph in cases when IPFS reads time out: [graph-node issue](https://github.com/graphprotocol/graph-node/issues/963)
- Signatures from signed actions are currently not verified, since there is no easy way to perform this in assembly script: [graph-ts issue](https://github.com/graphprotocol/graph-ts/issues/63)
- `changeName` actions are currently ignored due to some transactions in mainnet causing the subgraph to crash: [graph-node issue](https://github.com/graphprotocol/graph-node/issues/932)
