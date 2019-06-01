const express = require('express');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');
const {Block, Transaction} = require('./structures.js');
const crypto = require('crypto');

const app = express();

const blockchainDB = new FileAsync('core/blockchain/blockchain.json');
const utxoDB = new FileAsync('core/blockchain/utxo.json');
const walletDB = new FileAsync('core/wallet/keys.json');

const blockchain = lowdb(blockchainDB);
const utxo = lowdb(utxoDB);
const wallet = lowdb(walletDB);

app.get('/init',
	async (req, res) => {	

		// generate wallet key pair
		let wl = await wallet;
			
		let kp = crypto.createECDH('secp256k1');
		kp.generateKeys();
	
		let pri = kp.getPrivateKey('hex');
		let pub = kp.getPublicKey('hex');

		// save to wallet
		wl.defaults({0 : {privateKey : pri, publicKey: pub}})
			.assign({0 : {privateKey : pri, publicKey: pub}})
			.write()

		// create genesis block transaction
		let utxo_in = [];
		let utxo_out = [[pub, 1000]];
		let transaction = new Transaction(utxo_in, utxo_out); 	

		// create genesis block
		let txList = [transaction];
		let prevHash = "000000000000000000000000000000000000000000000000000000000000000";
		let block = new Block(txList, prevHash);

		// add it to the block chain


		//await db.defaults({ 0 : [], user: {}, count: 0 })
  	//	.write()
			
		res.sendStatus(200);


	}
);

app.get('/clear',
	async (req, res) => {	
			
		res.sendStatus(200);


	}
);


app.listen(80);
