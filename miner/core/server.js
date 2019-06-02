const express = require('express');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Blockchain, Block, Transaction} = require('./structures.js');
const crypto = require('crypto');

const app = express();

const blockchainDB = new FileSync('core/blockchain/blockchain.json');
const utxoDB = new FileSync('core/blockchain/utxo.json');
const walletDB = new FileSync('core/wallet/keys.json');

const bc = lowdb(blockchainDB);
const ut = lowdb(utxoDB);
const wl = lowdb(walletDB);


app.post('/transact', 
	async (req, res) => {
		let input = req.input;
		let output = req.output;
	
		console.log(input, output);
	}
);

app.get('/get_wallet', 
	async (req, res) => {
		let kp = crypto.createECDH('secp256k1');
		kp.generateKeys();
	
		let pri = kp.getPrivateKey('hex');
		let pub = kp.getPublicKey('hex');

		res.send({privateKey: pri, publicKey: pub});
	}
);


app.get('/init',
	async (req, res) => {	

		// generate wallet key pair
		let kp = crypto.createECDH('secp256k1');
		kp.generateKeys();
	
		let pri = kp.getPrivateKey('hex');
		let pub = kp.getPublicKey('hex');

		// save to wallet
		wl.defaults({0 : {privateKey : pri, publicKey: pub}})
			.assign({0 : {privateKey : pri, publicKey: pub}})
			.write();

		// create coinbase transaction
		let utxoIN = [];
		let utxoOUT = [[pub, 1000]];
		let transaction = new Transaction(utxoIN, utxoOUT); 	

		// create genesis block
		let txList = [transaction];
		let prevHash = "000000000000000000000000000000000000000000000000000000000000000";
		let block = new Block(txList, prevHash);

		// add it to the block chain
		let chain = new Blockchain();
		chain.add(block);

		// save blockchain
		bc.assign(chain)
			.write();
			
		res.sendStatus(200);


	}
);

app.get('/clear',
	async (req, res) => {	
			
		res.sendStatus(200);


	}
);


app.listen(80);
