const express = require('express');
const lowdb = require('lowdb');
const FileAsync = require('lowdb/adapters/FileAsync');

const app = express();

const bc = new FileAsync('blockchain.json');
const ut = new FileAsync('utxo.json');
const blockchain = lowdb(bc);
const utxodb = lowdb(ut);


app.get('/init',
	(req, res) => {
		
		res.sendStatus(200);


	}
);


app.listen(80);
