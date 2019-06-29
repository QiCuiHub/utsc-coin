const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Blockchain, Block, Transaction} = require('./core/structures.js');
const ops = require('./core/operations.js');

// load files
const blockchainDB = new FileSync('./blockchain/blockchain.json');
const utxoDB = new FileSync('./blockchain/utxo.json');
const walletDB = new FileSync('./wallet/keys.json');
const bc = lowdb(blockchainDB);
const ut = lowdb(utxoDB);
const wl = lowdb(walletDB);

// generate wallet key pair
let kp = ops.getKeyPair();
pub = kp.publicKey;
pri = kp.privateKey;

// reset wallet and save to wallet
wl.defaults({keys : {}})
  .assign({keys : {}})
  .get('keys')
  .assign({[pub] : pri})
  .write();

// create coinbase transaction
let utxoIN = [];
let utxoOUT = [{address: pub, value: 1000}];
let signature = 'UTSC COIN'; // coinbase contains random data
let pubKey = 'IS THE BEST';
let type = 'coinbase';
let transaction = new Transaction(utxoIN, utxoOUT, pubKey, type, signature);
transaction.txid = transaction.getID(); 

// create genesis block
let txList = [transaction];
let prevHash = '0'
let block = new Block(txList, prevHash);
block.txRootHash = block.getMerkleRoot();
block.blockHash = block.getBlockHash();

// add it to the block chain
let chain = new Blockchain([]);
chain.add(block);

// keep track of utxos
ut.defaults({utxo : {}})
  .assign({utxo : {}})
  .get('utxo')
  .assign({[transaction.getID()] : transaction.output})
  .write();

// save blockchain
bc.assign(chain)
  .write();

