const crypto = require('crypto');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const ax = require('axios');

const walletDB = new FileSync('keys.json');
const wl = lowdb(walletDB);
const minerHost = '0.0.0.0';

let pri, pub;
let keys = wl.get('keys').value();

// if wallet is empty generate wallet key pair
if (!keys){

	let kp = crypto.createECDH('secp256k1');
	kp.generateKeys();
	
	pri = kp.getPrivateKey('hex');
  pub = kp.getPublicKey('hex');

	wl.defaults({keys : {}})
		.get('keys')
		.assign({[pub] : pri})
		.write();

}else {

	pub = Object.keys(keys)[0];
	pri = keys[pub];

}

console.log(pri, pub);

