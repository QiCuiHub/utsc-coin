const lowdb = require('lowdb');
const crypto = require('crypto');
const hyperswarm = require('hyperswarm');
const ops = require('../core/operations.js');
const FileSync = require('lowdb/adapters/FileSync');
const {Transaction, Block, Blockchain} = require('../core/structures.js');

const walletDB = new FileSync('./keys.json');
const blockchainDB = new FileSync('../blockchain/blockchain.json');
const wl = lowdb(walletDB);
const bl = lowdb(blockchainDB);

const swarm = hyperswarm();
const connections = new Set();
const peerWait = 1;

const topic = crypto.createHash('sha256')
  .update('utsc-miner-network')
  .digest();

// get wallet keys
let keys = wl.get('keys').value();
let pub = Object.keys(keys)[0];
let pri = keys[pub];

// get utxos that belong to the public key
let blockchain = new Blockchain(bl.value());
let input_tx = blockchain.blocks[0].transactions[0];
let input = [{txid: input_tx.getID(), idx: 0}];

// pay to another wallet
// private key 3074020101042067176e160e88b15734e8670381082d259a0f5bcf76081979ddbdf26b0dc3cdc8a00706052b8104000aa1440342000444b97abf3c90f5572d88617d523bdd26549f68d31844a752ecc297c903aaafe8e20d396caabba7bed913ab6142711ce530f77a670c664575af983c013d738cab
let address = '3056301006072a8648ce3d020106052b8104000a0342000444b97abf3c90f5572d88617d523bdd26549f68d31844a752ecc297c903aaafe8e20d396caabba7bed913ab6142711ce530f77a670c664575af983c013d738cab';

let output = [{address: address, value: 50}, {address: pub, value: 950}];
let publickey = pub;
let type = 'payment';

let transaction = new Transaction({
	input     : input,
	output    : output,
	publicKey : publickey,
  type      : type
});

transaction.txid = transaction.getID();
transaction.signature = ops.sign(transaction.txid, pri);

swarm.join(topic, {
  lookup   : true,
  announce : true
});

let numConn = 0;

// spend n seconds to connect to other peers
console.log('Connecting to peers...');
let connectStart = process.hrtime();

swarm.on('connection', (socket, details) => {
  if (details.client === true){
    let diff = process.hrtime(connectStart)[0];

    if (diff < peerWait) {
      numConn += 1;
      connections.add(socket);
    }
  }
});

// after n seconds communicate with peers
setTimeout(() => {
  console.log('Found ' + numConn + ' peers');

  connections.forEach((socket) => {
    let out = {action: 'transact', transaction: transaction};
    socket.write(JSON.stringify(out));
    socket.destroy();
  });

  swarm.leave(topic);
  process.exit(0);
}, peerWait * 1000 + 100);
