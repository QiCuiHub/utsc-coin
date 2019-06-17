class Miner {
  constructor(blockchain){
    this.txPool = [];
    this.blockchain = blockchain;
    this.utxo = blockchain.getUTXOs();
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
}

module.exports = {
  Miner : Miner
}
