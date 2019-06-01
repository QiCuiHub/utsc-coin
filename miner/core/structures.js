const crypto = require('crypto');

class Transaction {
	constructor(input, output) {
		this.input  = input;
  	this.output = output;
		this.id     = this.getID();
	}

	getID() {
		// id is the hash of all inputs and outputs in order
		let input_str = this.input
			.reduce((acc, curr) => {return acc + curr}, "");

		let output_str = this.output
			.reduce((acc, curr) => {return acc + curr[0] + curr[1]}, "");

		// use sha256
		let hash = crypto
			.createHash('sha256')
			.update(input_str + output_str, 'utf8')
			.digest('hex');

		return hash;
	}

	repr() {
		console.log(this.output);
		return [input : this.input, output: this.output];
	}
}

class Block {
	constructor(txList, prevHash) {
  	this.transactions = txList;
		this.prevHash     = prevHash;
		this.txMerkleHash = this.getMerkleRoot();
		this.blockHash    = "test";
	}

	getMerkleRoot() {
		let txids = this.transactions
			.map((curr) => {return curr.getID()});

		return txids;
	}
}

class BlockChain {
	constructor(blockchain){
		this.blockchain = this.parse(blockchain);
	}

	parse(blockchainJSON){

	}
}


module.exports = {
	Transaction : Transaction,
	Block       : Block,
	Blockchain  : Blockchain
}
