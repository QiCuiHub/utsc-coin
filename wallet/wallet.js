const ax = require('axios');
const lowdb = require('lowdb');
const crypto = require('crypto');
const ops = require('../miner/core/operations.js');
const FileSync = require('lowdb/adapters/FileSync');
const {Transaction, Block, Blockchain} = require('../miner/core/structures.js');

const walletDB = new FileSync('../miner/core/wallet/keys.json');
const blockchainDB = new FileSync('../miner/core/blockchain/blockchain.json');
const wl = lowdb(walletDB);
const bl = lowdb(blockchainDB);

const minerHost = '0.0.0.0';

// get wallet keys
let keys = wl.get('keys').value();
let pub = Object.keys(keys)[0];
let pri = keys[pub];

// get utxos that belong to the public key
let blockchain = new Blockchain(bl.get('blocks').value());
let input_tx = blockchain.blocks[0].transactions[0];
let input = [{txid: input_tx.getID(), idx: 0}];

// pay to another wallet
// private key 3074020101042067176e160e88b15734e8670381082d259a0f5bcf76081979ddbdf26b0dc3cdc8a00706052b8104000aa1440342000444b97abf3c90f5572d88617d523bdd26549f68d31844a752ecc297c903aaafe8e20d396caabba7bed913ab6142711ce530f77a670c664575af983c013d738cab
let address = '3056301006072a8648ce3d020106052b8104000a0342000444b97abf3c90f5572d88617d523bdd26549f68d31844a752ecc297c903aaafe8e20d396caabba7bed913ab6142711ce530f77a670c664575af983c013d738cab';

let output = [{address: address, value: 50}];
let publickey = pub;
let type = 'payment';

let transaction = new Transaction(
	input,
	output,
	publickey,
  type
);

transaction.txid = transaction.getID();
transaction.signature = ops.sign(transaction.txid, pri);

console.log('\nsignature output', transaction.signature)

console.log(blockchain.verifyTX(transaction));
//console.log(transaction);

