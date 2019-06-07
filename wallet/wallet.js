const ax = require('axios');
const lowdb = require('lowdb');
const crypto = require('crypto');
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


console.log(blockchain);

