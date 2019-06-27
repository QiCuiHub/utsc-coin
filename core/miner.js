const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Blockchain, Block, Transaction} = require('./structures.js');
const ops = require('./operations.js');
const ax = require('axios');


class Miner {
  constructor(bcPath, utxoPath, walletPath){
    // first load any state from files
    this.bcDB = lowdb(new FileSync(bcPath));
    this.utDB = lowdb(new FileSync(utxoPath));
    this.wlDB = lowdb(new FileSync(walletPath));

    this.txPool = [];
    this.blockchain = new Blockchain(this.bcDB.value());
    this.utxos = this.blockchain.getUTXOs();
    this.peers = new Set();
  }

  async update(){
    // contact seed server and get blockchain height
    let height = await axios.post('http://localhost:8000');
    // if stored height is the same, use stored blockchain

    // else download missing blocks

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

    //console.log(checkID, checkSig, checkUtxo);
    return checkID && checkSig && checkUtxo && inputVal === outputVal;
  }

  verifyBlock(block){

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
}

module.exports = {
  Miner : Miner
}
