const ops = require('./operations.js');

class Miner {
  constructor(blockchain){
    this.txPool = [];
    this.blockchain = blockchain;
    this.utxo = blockchain.getUTXOs();
  }

	verifyTX(tx){
    /* verify payment type transactions */

		if (
		  // txid must equal getID
      tx.txid === tx.getID()

      // signature must be verified
      && ops.verify(tx.txid, tx.signature, tx.publicKey)

      // input utxo
      && tx.input.every((curr) => {
        return ( 
          // input utxo must be unspent
          curr.txid in this.utxo &&
        
          // input utxo must belong to the pub key
          this.utxo[curr.txid][curr.idx].address === tx.publicKey
        )
      })

      // output utxo value must be equal to input utxo value
      && tx.input.reduce((acc, curr) => {
        acc += this.utxo[curr.txid][curr.idx].value;
        return acc;
      }, 0)

      === tx.output.reduce((acc, curr) => {
        acc += curr.value;
        return acc;
      }, 0)

    ) 
    return true;
    else return false;
	}

  verifyBlock(block){

  }
}

module.exports = {
  Miner : Miner
}
