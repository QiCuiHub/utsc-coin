const crypto = require('crypto');

//BlockChain = {
//	
//
//}

class Block {
	constructor() {
		this.blockHash    = null;
		this.prevHash     = null;
		this.txMerkleHash = null;
  	this.transactions = [];
	}

	getMerkleRoot() {
		let txids = this.transactions
			.map((curr) => {return curr.getID()});

		return txids;
	}
}

class Transaction {
	constructor() {
		this.input  = [];
  	this.output = [];
	}

	getID() {
		if (this.id === undefined){

			// id is the hash of all inputs and outputs
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
		else return this.id;

	}

	repr() {
		console.log(this.output);
		return {input : this.input, output: this.output};
	}
}


module.exports = {
	Block       : Block,
	Transaction : Transaction
}
