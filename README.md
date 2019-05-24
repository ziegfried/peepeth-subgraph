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
    account {
      name
      realName
    }
    replyTo {
      content
      account {
        name
        realName
      }
    }
    share {
      content
      account {
        name
        realName
      }
    }
  }
  peepeth(id: "global") {
    numberOfPeeps
    numberOfAccounts
  }
}
```

## Demo App

...

<div align="center">
    <img src="./demo-app/screenshot.png" width="400px"</img> 
</div>

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

> More details TODO
