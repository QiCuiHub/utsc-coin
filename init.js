const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const {Blockchain, Block, Transaction} = require('./core/structures.js');
const ops = require('./core/operations.js');
const program = require('commander');


program
  .option('-i, --init', 'Write new initial conditions')
  .option('-k, --keys', 'Output a wallet key value pair')
  .parse(process.argv);


if (process.argv.length < 3) {
  program.help();

}else if (program.init){
  // load files
  const blockchainDB = new FileSync('./blockchain/blockchain.json');
  const utxoDB = new FileSync('./blockchain/utxo.json');
  const walletDB = new FileSync('./wallet/keys.json');
  const bc = lowdb(blockchainDB);
  const ut = lowdb(utxoDB);
  const wl = lowdb(walletDB);

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
  let transaction = new Transaction({
    input     : [], 
    output    : [{address: pub, value: 1000}],
    signature : 'UTSC COIN',
    publicKey : 'IS THE BEST',
    type      : 'coinbase'
  });

  // create genesis block
  let block = new Block({
    transactions : [transaction],
    prevHash     : '0',
    nonce        : 0,
    height       : 0
  });

  let blockchain = {
    blocks: [block]
  }

  // save blockchain
  bc.assign(blockchain)
    .write();
 
  console.log('Success');

}else if (program.keys) {
  let kp = ops.getKeyPair();
  console.log('Public Key: ', kp.publicKey);
  console.log('Private Key: ', kp.privateKey);
}


