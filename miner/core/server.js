const express = require('express');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Blockchain, Block, Transaction} = require('./structures.js');
const ops = require('./operations.js');
const {Miner} = require('./miner.js');

// load state from files
const blockchainDB = new FileSync('core/blockchain/blockchain.json');
const utxoDB = new FileSync('core/blockchain/utxo.json');
const walletDB = new FileSync('core/wallet/keys.json');
const bc = lowdb(blockchainDB);
const ut = lowdb(utxoDB);
const wl = lowdb(walletDB);

// app
const app = express();
const blockchain = new Blockchain(bc.value());
const miner = new Miner(blockchain);

// middleware
app.use(express.json());

// endpoints
app.post('/transact', 
  async (req, res) => {
    let transaction = new Transaction(req.body);
    if (miner.verifyTX(transaction)){
      return res.send({tx: 'success'});
    }else{
      return res.send({tx: 'invalid'});
    }
  }
);

app.get('/get_wallet', 
  async (req, res) => {
    let kp = ops.getKeyPair();
    res.send({privateKey : kp.privateKey, publicKey: kp.publicKey});
  }
);

app.get('/init',
  async (req, res) => { 

    // generate wallet key pair
    let kp = ops.getKeyPair();
    pub = kp.publicKey;
    pri = kp.privateKey;

    // reset wallet and save to wallet
    wl.defaults({keys : {}})
      .assign({keys : {}})
      .get('keys')
      .assign({[pub] : pri})
      .write();

    // create coinbase transaction
    let utxoIN = [];
    let utxoOUT = [{address: pub, value: 1000}];
    let signature = 'UTSC COIN'; // coinbase contains random data
    let pubKey = 'IS THE BEST';
    let type = 'coinbase';
    let transaction = new Transaction(utxoIN, utxoOUT, pubKey, type, signature);
    transaction.txid = transaction.getID(); 

    // create genesis block
    let txList = [transaction];
    let prevHash = '0'
    let block = new Block(txList, prevHash);
    block.txRootHash = block.getMerkleRoot();
    block.blockHash = block.getBlockHash();

    // add it to the block chain
    let chain = new Blockchain([]);
    chain.add(block);

    // keep track of utxos
    ut.defaults({utxo : {}})
      .assign({utxo : {}})
      .get('utxo')
      .assign({[transaction.getID()] : transaction.output})
      .write();

    // save blockchain
    bc.assign(chain)
      .write();
      
    res.sendStatus(200);

  }
);

app.get('/clear',
  async (req, res) => { 
      
    res.sendStatus(200);


  }
);


app.listen(80);
