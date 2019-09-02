const hyperswarm = require('hyperswarm');
const {ProofOfWorkMiner} = require('./miner.js');
const {Blockchain, Block, Transaction} = require('./structures');
const crypto = require('crypto');
const lowdb = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');

require('dotenv').config();
const MINING_INTERVAL = parseInt(process.env.MINING_INTERVAL);

const swarm = hyperswarm();
const connections = new Set();

const topic = crypto.createHash('sha256')
  .update('utsc-miner-network')
  .digest();

const bcDB = lowdb(new FileSync('./blockchain/blockchain.json'));
const utDB = lowdb(new FileSync('./blockchain/utxo.json'));
const wlDB = lowdb(new FileSync('./wallet/keys.json'));

const miner = new ProofOfWorkMiner(
  new Blockchain(bcDB.value()),
  null,
  wlDB.get('keys').value()
);

swarm.join(topic, {
  lookup   : true,
  announce : true
});

const startMining = () => {
  miner.startMining(MINING_INTERVAL, (block) => {
    // broadcast block to every connection
    connections.forEach((socket) => {
      let output = {action: 'newMinedBlock', block: block};
      socket.write(JSON.stringify(output) + '|');
    });
  });

  console.log('Mining Started');
}

swarm.on('connection', (socket, details) => {
  /* establish connection to other nodes */
  connections.add(socket);

  // attach listener to socket
  socket.on('data', (data) => {
    let messages = data.toString().split('|').slice(0, -1);

    for (var idx in messages){
      let body = JSON.parse(messages[idx].toString());
      switch (body.action){

        // if other node height is greater than stored height request for difference
        case 'hello': {
          if (body.height <= miner.blockchain.getHeight()) {
            console.log('Up to date');
            startMining();
            break;
          } else {
            console.log('Found blockchain of height ' + body.height, ', ours is ' + miner.blockchain.getHeight());
            let output = {action: 'requestBlocks', height: miner.blockchain.getHeight()};
            socket.write(JSON.stringify(output) + '|');
            break;
          }
        }

        // received blocks from other node
        case 'sendBlocks': {
          body.blocks.forEach((curr) => {
            let block = new Block(curr);
            if (miner.verifyBlock(block)) miner.addBlock(block);
          });

          startMining();
          break;
        }

        // other node requested download for blocks
        case 'requestBlocks': {
          let blocks = miner.blockchain.getBlocks();
          let output = {action: 'sendBlocks', blocks: blocks};
          socket.write(JSON.stringify(output) + '|');
          break;
        }

        // test
        case 'transact': {
          let transaction = new Transaction(body.transaction);
          if (miner.verifyTX(transaction)) miner.stageTX(transaction);
          break;
        }

        case 'newMinedBlock': {
          let block = new Block(body.block);
          if (miner.verifyBlock(block)) miner.addBlock(block);
        } 

        // error
        default: {
          break;
        }

      }
    }
  })
  .on('close', () => {
    connections.delete(socket);
  })
  .on('error', (err) => {
    if (err.code === 'UTP_ETIMEDOUT') connections.delete(socket);
  });
  
  // send the height of stored blockchain to new incoming node
  if (details.client === false) {
    console.log('Contacting network...');
    let output = {action: 'hello', height: miner.blockchain.getHeight()};
    socket.write(JSON.stringify(output) + '|');
  }

});

process.on('SIGINT', () => {
  connections.forEach((socket) => {
    socket.destroy();
  });

  swarm.leave(topic);
  process.exit(0);
});
