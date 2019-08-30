# UTSC-COIN
## Running

To start a mining node, use
```
npm start
```
To start the node in development node with nodemon, use
``` 
npm run dev
```
To run unit tests, use
``` 
npm test
```
## init.js

To initialize the blockchain with a genesis block and a initial wallet , run with 
```
node init.js -i, --init
```
init.js can also generate wallet key value pairs using
```
node init.js -k, --keys
```
## Core
| File | Description |
|--|--|
| `structures.js` | Contains all the blockchain data structures |
| `miner.js` | Contains the mining node classes which implement specific aspects of a cryptocurrency, for example block and transaction verification |
| `server.js` | Contains peer-to-peer networking code that connects a mining node to other mining nodes |
| `operations.js` | Contains utility functions for cryptographic signing and verifying  |

## Other Files and Folders
| Folder | Description |
|--|--|
| `blockchain` | Stores the blockchain in a JSON file, UTXO storage is currently not in use |
| `wallet` | Stores wallet key value pairs in a JSON file, with format `{publicKey: privateKey}`, also contains `wallet.js`, a test tool to communicate with miner nodes |
|`tests` | Stores unit tests suites, `test-structures.js` contains block and wallet data structures to build a test blockchain

## UTXOs
UTXOs inside a miner are tracked by 3 different variables
<table>
  <tr>
    <th>Variable </th> <th>Description </th>
  </tr>
  <tr>
    <td><code>blockUtxos</code></td>
    <td> Keeps track of UTXOs that are part of the blockchain, only updated when the primary blockchain is extended</td>
  </tr>
<tr>
  <td><code>stageUtxos</code></td>
  <td>Keeps track of UTXOs that are not part of the blockchain <ul><li>UTXOs are added when a   valid transaction is registered </li><li>UTXOs are moved to `blockUtxos` when the transaction is incorporated into the blockchain</li><li>UTXOs are removed when a valid transaction consumes them</li></ul> </td>
</tr>
<tr>
  <td><code>spentUtxos</code></td>
  <td> Keeps track of UTXOs that have been consumed as result of a valid transaction <ul><li>UTXOs are added when a valid transaction is registered </li><li>UTXOs are removed when the transaction is incorporated into the blockchain</li></ul></td>
</tr>
</table>

These variables store UTXOs in the format `{<txid.index>:{address:<publicKey>, value:<value>}}` 
For example:
```
  'd93cdc4dc1604c0c5aa7315900516c63cc97096c42662a9bbc01151244f6fc80.0': {
        address: '3056301006072a8648ce3d020106052b8104000a03420004fda3a84a416313dfd870b5bd4f56036c686569efc5c7fc5464744622ea3f5e1f848bdaea7d8aae35231b6eb67e025e633fb2cea0bfe57e98ce3aa666cb852b96',
        value: 10
      }
```
When there is a chain transition event, 
 - `blockUtxos` is repopulated from the new primary chain
 - `stageUtxos` is cleared of UTXOs that are in `blockUtxos`, and transactions in orphaned blocks are added back
 - `spentUtxos` is cleared of UTXOs that are part of the new primary chain, and transactions in orphaned blocks are added 
