const crypto = require('crypto');
const ops = require('./operations.js');

class Transaction {
	constructor(txJSON) {
		this.input  = txJSON.input;
		this.output = txJSON.output;
		this.publicKey = txJSON.publicKey;
		this.type = txJSON.type;
		this.signature = txJSON.signature;
		this.txid = txJSON.txid;
	}

	getID() {
		// sha256 hash
		let hash = crypto.createHash('sha256');

		// id is the hash of all transaction data
		this.input.forEach((curr) => {hash.update(curr + '.', 'utf-8')});
		this.output.forEach((curr) => {hash.update(curr.address + curr.value + '.', 'utf-8')});
		hash.update(this.publicKey + '.', 'utf-8');
		hash.update(this.type + '.', 'utf-8');

		// return in hex
		return hash.digest('hex');
	}

}

class Block {
	constructor(blockJSON) {
		this.transactions = this.parse(blockJSON.transactions);
		this.prevHash     = blockJSON.prevHash;
		this.txRootHash		= blockJSON.txRootHash;
		this.blockHash    = blockJSON.blockHash;
	}

	parse(txList){
		return txList.map((curr) => {
			return new Transaction(curr);
		});
	}

	getBlockHash(){
		return crypto
			.createHash('sha256')
			.update(this.prevHash + this.txMerkleHash, 'utf-8')
			.digest('hex');
	}

	getMerkleRoot() {
		// get transaction ids
		let txids = this.transactions.map((curr) => {return curr.getID()})
		let nodes = []

		// make sure array is even
		let leftover = txids.length % 2 === 0 || txids.length === 1 ? 
			null : txids.pop();

		// hash txid pairs in order until 1 left
		while (txids.length > 1){
			for (i = 0; i < txids.length; i += 2){
				let hash = crypto
					.createHash('sha256')
					.update(txids[i] + txids[i + 1], 'utf-8')
					.digest('hex');

				nodes.push(hash);
			}

			txids = nodes;
			nodes = []
		} 
		
		// hash back if array is odd
		if (leftover) return crypto
			.createHash('sha256')
			.update(leftover + txids[0], 'utf-8')
			.digest('hex');
		else return txids[0]; 
	}
}

class Blockchain {
	constructor(blockchain){
		this.blocks = this.parse(blockchain.blocks);
		this.utxos = this.getUTXOs();
	}

	parse(blockchainJSON){
		return blockchainJSON.map((curr) => {
			return new Block(curr);
		});
	}

	add(block){
		this.blocks.push(block);
	}

	getUTXOs(){
		return this.blocks.reduce((acc, block) => {
			block.transactions.forEach((tx) => {
				tx.output.forEach((curr, idx) => {
					acc[tx.txid + '.' + idx] = curr
				});
			});
			
			return acc;
		}, {});
	}
}

module.exports = {
	Transaction : Transaction,
	Block       : Block,
	Blockchain  : Blockchain
}
