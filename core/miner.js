const {Blockchain, Block, Transaction} = require('./structures.js');
const ops = require('./operations.js');
const crypto = require('crypto');

class Miner {
  constructor(blockchain, utxos){
    this.txPool = new Map();
    this.blockchain = blockchain;
    this.blockUtxos = this.blockchain.getUTXOs();
    this.stageUtxos = {};
    this.spentUtxos = {};
  }

  verifyTX(tx, blockUtxos=this.blockUtxos, stageUtxos=this.stageUtxos, 
    spentUtxos=this.spentUtxos, test=false){
    /* verify payment type transactions */

    // txid must equal getID
    let checkID = tx.txid === tx.getID();

    // signature must be verified
    let checkSig = ops.verify(tx.txid, tx.signature, tx.publicKey);

    // input utxo address must exist and pay to the publicKey
    let checkUtxo = tx.input.every((curr) => {
      let id = curr.txid + '.' + curr.idx;

      // cannot be in spent utxos
      if (id in spentUtxos) return false;

      // must exist and pay to the publicKey
      else {
        let utxo = blockUtxos[id] || stageUtxos[id];
        return utxo ? utxo.address == tx.publicKey : false;
      }
    });

    // input utxo value must be equal to output utxo value
    let inputVal = tx.input.reduce((acc, curr) => {
      let id = curr.txid + '.' + curr.idx;
      let utxo = blockUtxos[id] || stageUtxos[id];
      acc += utxo ? utxo.value : 0;
      return acc;
    }, 0);
 
    let outputVal = tx.output.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);

    if (test) return [checkID, checkSig, checkUtxo, inputVal === outputVal];

    return checkID && checkSig && checkUtxo && inputVal === outputVal;
  }

  verifyBlock(block, test=false){
    // first transaction is a coinbase transactionin
    let checkType = block.transactions[0].type === 'coinbase';

    // coinbase txid cannot be same as previous coinbase txid
    let checkUniq = true;
    this.blockchain.blocks.forEach((val, key) => {
      if (val.transactions[0].txid === block.transactions[0].txid)
        checkUniq = false;
    });

    // coinbase value equal to 10
    let checkReward = block.transactions[0].output.reduce((acc, curr) => {
      acc += curr.value;
      return acc;
    }, 0);
    
    // no transaction doublespend and valid
    let stageTemp = {};
    let spentTemp = {};

    // if attaching to head use this else generate utxos at attach point
    let blockUtxos = block.prevHash === this.blockchain.getLastHash() ? 
      this.blockUtxos : this.blockchain.getUTXOs(block.prevHash); 

    // replay tx, skipping coinbase
    let checkTx = block.transactions.every((tx, idx) => {
      if (idx === 0 || this.verifyTX(tx, blockUtxos, stageTemp, spentTemp)) {
        this.stageTX(tx, stageTemp, spentTemp, true);
        return true;
      } else return false;
    });

    // merkle root matches
    let checkRoot = block.txRootHash === block.getMerkleRoot();

    // blockhash matches
    let checkHash = block.blockHash === block.getBlockHash();

    // max 10 tx per block
    let checkTxLimit = block.transactions.length <= 10;

    if (test) return [checkType, checkUniq, checkTx, checkTxLimit, 
      checkRoot, checkHash, checkReward === 10];

    return checkType && checkUniq && checkTx && checkTxLimit
      && checkRoot && checkHash && checkReward === 10;
  }

  stageTX(tx, stageUtxos=this.stageUtxos, spentUtxos=this.spentUtxos, dryRun=false){
    // add to tx pool
    if (!dryRun) this.txPool.set(tx.txid, tx);

    // add input utxo to spent utxos
    tx.input.forEach((curr) => {
      spentUtxos[curr.txid + '.' + curr.idx] = '';
    });

    // add the output utxos to the staged utxos
    tx.output.forEach((curr, idx) => {
      stageUtxos[tx.txid + '.' + idx] = curr;
    });
  }

  addBlock(block){
    // add block to blockchain
    let orphaned = this.blockchain.add(block);

    // remove transactions from staged transactions and update blockutxo
    block.transactions.forEach((tx, idx) => {
      // remove from pool
      this.txPool.delete(tx.txid);

      // inputs
      tx.input.forEach((curr) => {
        // remove input from spent utxos and delete from blockutxo
        let id = curr.txid + '.' + curr.idx;
        delete this.spentUtxos[id];
        delete this.blockUtxos[id];
      });

      // outputs
      tx.output.forEach((curr, idx) => {
        // remove from stage utxos and add to blockutxo
        let id = tx.txid + '.' + idx;
        delete this.stageUtxos[id];
        this.blockUtxos[id] = curr;
      });
    });

    return orphaned;
  }
}

class ProofOfAuthorityMiner extends Miner{
  mine() {

  }
}

class ProofOfWorkMiner extends Miner{
  constructor(blockchain, utxos, wallet){
    super(blockchain, utxos); 
    this.wallet = wallet;
    this.difficulty = 4294967295;
    this.candidate = null;
    this.newCandidate();
  }

  newCandidate(){
    // select a random key pair in the wallet
    let pub = Object.keys(this.wallet)[0];
    let pri = this.wallet[pub];

    // coinbase transaction to self
    let coinbase = new Transaction({
      input     : [],
      output    : [{address: pub, value: 10}],
      publicKey : pub,
      type      : "coinbase"
    });

    coinbase.txid = coinbase.getID();
    coinbase.signature = crypto.randomBytes(64).toString('hex'); // random data

    // create candidate block
    this.candidate = new Block({
      transactions : [coinbase],
      prevHash     : this.blockchain.getLastHash(),
      nonce        : 0
    });

    this.candidate.txRootHash = this.candidate.getMerkleRoot();
    this.candidate.blockHash = this.candidate.getBlockHash();
  }

  mine(callback) {
    let buf = Buffer.from(this.candidate.blockHash, 'hex');
    let num = buf.readUInt32BE(0);

    // if the block is valid return in a callback
    if (num < this.difficulty){
      callback(this.candidate)
      
    // else increment the nonce
    }else {
      this.candidate.nonce += 1;
    }
  }

  startMining(interval, callback){
    setInterval(() => {this.mine(callback)}, interval);
  }
}

class ProofOfStakeMiner extends Miner{
  miner() {

  }
}

module.exports = {
  Miner                 : Miner,
  ProofOfAuthorityMiner : ProofOfAuthorityMiner,
  ProofOfWorkMiner      : ProofOfWorkMiner,
  ProofOfStakeMiner     : ProofOfStakeMiner
}
