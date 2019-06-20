const ops = require('./operations.js');

class Miner {
  constructor(blockchain){
    this.txPool = [];
    this.blockchain = blockchain;
    this.utxo = blockchain.getUTXOs();
  }

	verifyTX(tx){
    /* verify payment type transactions */

		// txid must equal getID
    let checkID = tx.txid === tx.getID();

    // signature must be verified
    let checkSig = ops.verify(tx.txid, tx.signature, tx.publicKey);

    // input utxo address must exist and pay to the publicKey
    let checkUtxo = tx.input.every((curr) => {
      return this.utxo[curr.txid + '.' + curr.idx].address === tx.publicKey
    });

    // input utxo value must be equal to output utxo value
    let inputVal = tx.input.reduce((acc, curr) => {
      acc += this.utxo[curr.txid + '.' + curr.idx].value;
      return acc;
    }, 0); 
    let outputVal = tx.output.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);

		return checkID && checkSig && checkUtxo && inputVal === outputVal;
	}

  verifyBlock(block){

  }

  stageTX(tx){
    this.txPool.push(tx);
    
    // remove the input utxos from the utxo pool
    tx.input.forEach((curr) => {
       delete this.utxo[curr.txid + '.' + curr.idx];
    });

    // add the output utxos to the utxo pool
    tx.output.forEach((curr, idx) => {
      this.utxo[tx.txid + '.' + idx] = curr;
    });
  }
}

module.exports = {
  Miner : Miner
}
