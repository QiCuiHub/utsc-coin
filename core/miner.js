const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Blockchain, Block, Transaction} = require('./structures.js');
const ops = require('./operations.js');


class Miner {
  constructor(bcPath, utxoPath, walletPath){
    // first load any state from files
    this.bcDB = lowdb(new FileSync(bcPath));
    this.utDB = lowdb(new FileSync(utxoPath));
    this.wlDB = lowdb(new FileSync(walletPath));

    this.txPool = [];
    this.blockchain = new Blockchain(this.bcDB.value());
    this.utxos = this.blockchain.getUTXOs();
  }

  verifyTX(tx){
    /* verify payment type transactions */

    // txid must equal getID
    let checkID = tx.txid === tx.getID();

    // signature must be verified
    let checkSig = ops.verify(tx.txid, tx.signature, tx.publicKey);

    // input utxo address must exist and pay to the publicKey
    let checkUtxo = tx.input.every((curr) => {
      let utxo = this.utxos[curr.txid + '.' + curr.idx];
      return utxo ? utxo.address === tx.publicKey : false;
    });

    // input utxo value must be equal to output utxo value
    let inputVal = tx.input.reduce((acc, curr) => { 
      let utxo = this.utxos[curr.txid + '.' + curr.idx];
      acc += utxo ? utxo.value : 0;
      return acc;
    }, 0);
 
    let outputVal = tx.output.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);

    return checkID && checkSig && checkUtxo && inputVal === outputVal;
  }

  verifyBlock(block){
    // first transaction is a coinbase transactionin
    let checkType = block.transactions[0].type === 'coinbase';

    // coinbase txid cannot be same as previous coinbase txid
    let checkUniq = this.blockchain.blocks.every((curr) => {
      return curr.transactions[0].txid !== block.transactions[0].txid;
    });

    // no transaction doublespend and valid
    let checkTx = false;

    // merkle root matches
    let checkRoot = block.txRootHash === block.getMerkleRoot();

    // prevhash matches
    let checkPrev = block.prevHash === this.blockchain.getLastHash();

    // blockhash matches
    let checkHash = block.blockHash === block.getBlockHash();

    console.log(checkType, checkUniq, checkRoot, checkPrev, checkHash);

    return checkType && checkUniq && checkTx 
      && checkRoot && checkPrev && checkHash;
  }

  stageTX(tx){
    this.txPool.push(tx);
    
    // remove the input utxos from the utxo pool
    tx.input.forEach((curr) => {
       delete this.utxos[curr.txid + '.' + curr.idx];
    });

    // add the output utxos to the utxo pool
    tx.output.forEach((curr, idx) => {
      this.utxos[tx.txid + '.' + idx] = curr;
    });
  }

  addBlock(block){

  }
}

class ProofOfAuthorityMiner extends Miner{

}

class ProofOfWorkMiner extends Miner{

}

class ProofOfStakeMiner extends Miner{

}

module.exports = {
  Miner : Miner
}
