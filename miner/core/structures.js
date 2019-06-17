const crypto = require('crypto');
const ops = require('./operations.js');

class Transaction {
	constructor(input, output, publicKey, type, signature, txid) {
		this.input  = input;
		this.output = output;
		this.publicKey = publicKey;
		this.type = type;
		this.signature = signature;
		this.txid = txid;
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
	constructor(txList, prevHash, txRootHash, blockHash) {
		this.transactions = this.parse(txList);
		this.prevHash     = prevHash;
		this.txRootHash		= txRootHash;
		this.blockHash    = blockHash;
	}

	parse(txList){
		return txList.map((curr) => {
			return new Transaction(
				curr.input,
				curr.output,
				curr.publicKey,
				curr.type,
				curr.signature,
				curr.txid,
			);
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
		this.blocks = this.parse(blockchain);
		this.utxos = this.getUTXOs();
	}

	parse(blockchainJSON){
		return blockchainJSON.map((curr) => {
			return new Block(
				curr.transactions,
				curr.prevHash,
				curr.txRootHash,
				curr.blockHash
			);
		});
	}

	add(block){
		this.blocks.push(block);
	}

	verifyTX(transaction){
		// txid must equal getID
		if (transaction.txid != transaction.getID()) 
			return false

		// payment
		// signature must be verified
		if (!ops.verify(transaction.txid, transaction.signature, transaction.publicKey))
			return false

		// input utxos must be unspent
			transaction.input.every

		// input utxos must belong to the pub key
		// output utxo value must be equal to input utxo value

		// coinbase
		// txid must be unique
		// value is _ coins
	}

	verifyBlock(block){

	}

	getUTXOs(){
		return this.blocks.reduce((acc, block) => {
			block.transactions.forEach((tx) => {
				acc[tx.getID()] = tx.output;
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
