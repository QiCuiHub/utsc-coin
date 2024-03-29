const crypto = require('crypto');
const ops = require('./operations.js');

class Transaction {
  constructor(txJSON, privateKey=null) {
    // read transaction JSON
    this.input     = txJSON.input;
    this.output    = txJSON.output;
    this.publicKey = txJSON.publicKey;
    this.type      = txJSON.type;
    this.signature = txJSON.signature;
    this.txid      = txJSON.txid;

    // automatically populate missing information
    if (!this.txid) this.txid = this.getID();
    if (privateKey) this.signature = ops.sign(this.txid, privateKey);
  }

  getID() {
    // sha256 hash
    let hash = crypto.createHash('sha256');

    // id is the hash of all transaction data
    this.input.forEach((curr) => {hash.update(
      curr.txid + '.' + 
      curr.idx  + '.', 'utf-8')});
    this.output.forEach((curr) => {hash.update(
      curr.address + '.' +
      curr.value   + '.', 'utf-8')});
    hash.update(this.publicKey + '.', 'utf-8');
    hash.update(this.type + '.', 'utf-8');

    // return in hex
    return hash.digest('hex');
  }

}

class Block {
  constructor(blockJSON) {
    // read block JSON
    this.transactions = this.parse(blockJSON.transactions);
    this.prevHash     = blockJSON.prevHash;
    this.txRootHash   = blockJSON.txRootHash;
    this.blockHash    = blockJSON.blockHash;
    this.height       = blockJSON.height;
    this.nonce        = blockJSON.nonce;
    this.status       = blockJSON.status;
    this.timestamp    = blockJSON.timestamp;

    // automatically populate missing information
    if (!this.timestamp) this.timestamp = (new Date).getTime();
    if (!this.txRootHash) this.txRootHash = this.getMerkleRoot();
    if (!this.blockHash) this.blockHash = this.getBlockHash();
  }

  parse(txList){
    return txList.map((curr) => {
      return new Transaction(curr);
    });
  }

  getBlockHash(){
    return crypto
      .createHash('sha256')
      .update(this.prevHash + '.', 'utf-8')
      .update(this.txRootHash + '.', 'utf-8')
      .update(this.nonce.toString() + '.', 'utf-8')
      .update(this.timestamp.toString() + '.', 'utf-8')
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
      for (var i = 0; i < txids.length; i += 2){
        let hash = crypto
          .createHash('sha256')
          .update(txids[i] + '.' + txids[i + 1] + '.', 'utf-8')
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
  constructor(blockchainJSON){
    this.blocks = new Map();
    this.head   = null;

    this.parse(blockchainJSON.blocks);
  }

  parse(blocks){
    if (blocks) blocks.forEach((curr, idx) => {
      let block = new Block(curr);

      // genesis block is hardcoded
      if (block.prevHash === '0'){
        this.blocks.set(block.blockHash, block);   
        this.head = block;
      }else this.add(block);
      
    });
  }

  add(block){
    let orphanList = [];
    let height = this.blocks.get(block.prevHash).height + 1;

    // if the height of the new chain is longer than the current one
    if (height > this.head.height){
      
      // if the block is not an extension of the old head
      if (block.prevHash !== this.head.blockHash){

        // mark the new chain as temp
        let currHash = block.prevHash;
      
        while (currHash !== '0'){
          let currBlock = this.blocks.get(currHash);
          currBlock.status = 'temp';
          currHash = currBlock.prevHash;
        }

        // record the old main chain as orphaned blocks
        this.blocks.forEach((curr) => {
          if (curr.status === 'main'){
            orphanList.push(curr);
            curr.status = 'orphan';
          }
        })

        // mark the new chain as the main chain
        currHash = block.prevHash;
        while (currHash !== '0'){
          let currBlock = this.blocks.get(currHash);
          currBlock.status = 'main';
          currHash = currBlock.prevHash;
        }
      }

      // update the head of the blockchain
      block.status = 'main';
      this.head = block;
      this.head.height = height;

    // else the block extends an orphan chain
    } else {
      block.status = 'orphan';
      block.height = height;
    }

    // update the blockchain and return a list of blocks orphaned in the process
    this.blocks.set(block.blockHash, block);
    return orphanList;
  }

  getUTXOs(blockHash=this.head.blockHash){
    /* replay transactions in the blockchain */

    let unspent = {}
    let spent = new Set();
    let currBlock = blockHash;

    // traverse from specifed block to the genesis block
    while (currBlock !== '0'){
      let block = this.blocks.get(currBlock);

      block.transactions.forEach((tx) => {
        // add the output utxos to unspent if not in spent
        tx.output.forEach((curr, idx) => {
          let id = tx.txid + '.' + idx;
          if (!spent.has(id)) unspent[id] = curr;
        });

        // add the inputs to the set of spent utxos
        tx.input.forEach((curr) => {
          spent.add(curr.txid + '.' + curr.idx);
        });
      });

      currBlock = block.prevHash;
    }

    return unspent;
  }

  getBlocks(traversalLength=this.head.height, startBlock=this.head){
    /* return blocks from the blockchain, ordered from low to high height
       don't get genesis block by default
    */

    let out = [];
    let currBlock = startBlock;

    // dont overflow
    if (traversalLength > this.head.height + 1) traversalLength = this.head.height + 1;

    // traverse towards root block
    for (var i = 0; i < traversalLength; i++){
      out.push(currBlock);
      currBlock = this.blocks.get(currBlock.prevHash);
    }

    return out.reverse();
  }

  getLastHash(){
    return this.head.blockHash;
  }

  getHeight(){
    return this.head.height;
  }
}

module.exports = {
  Transaction : Transaction,
  Block       : Block,
  Blockchain  : Blockchain
}
