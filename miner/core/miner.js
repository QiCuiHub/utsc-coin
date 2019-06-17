class Miner {
  constructor(blockchain){
    this.txPool = [];
    this.blockchain = blockchain;
    this.utxo = blockchain.getUTXOs();
  }

  verifyTX(transaction){
    
  }

  verifyBlock(block){

  }
}

module.exports = {
  Miner : Miner
}
