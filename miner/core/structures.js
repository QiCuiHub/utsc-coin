const crypto = require('crypto');

class Transaction {
	constructor(input, output, signature, publicKey, type, txid) {
		this.input  = input;
  	this.output = output;
		this.signature = signature;
		this.publicKey = publicKey;
		this.type = type;
		this.txid = txid;
	}

	getID() {
		// sha256 hash
		let hash = crypto.createHash('sha256');

		// id is the hash of all transaction data
		this.input.forEach((curr) => {hash.update(curr + '.', 'utf-8')});
		this.output.forEach((curr) => {hash.update(curr[0] + curr[1] + '.', 'utf-8')});
		hash.update(this.signature + '.', 'utf-8');
		hash.update(this.publicKey + '.', 'utf-8');
		hash.update(this.type + '.', 'utf-8');

		// return in hex
		return hash.digest('hex');
	}

	verify(){
		return this.txid === getID()
	}
}

class Block {
	constructor(txList, prevHash) {
  	this.transactions = txList;
		this.prevHash     = prevHash;
		this.txRootHash = this.getMerkleRoot();
		this.blockHash    = crypto
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
		this.blocks = this.parse(blockchain);
	}

	parse(blockchainJSON){
		return [];
	}

	add(block){
		this.blocks.push(block);
	}

	verifyTX(transaction){

	}

	verifyBlock(block){

	}
}


module.exports = {
	Transaction : Transaction,
	Block       : Block,
	Blockchain  : Blockchain
}
