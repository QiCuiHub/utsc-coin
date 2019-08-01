const hyperswarm = require('hyperswarm');
const {ProofOfWorkMiner} = require('./miner.js');
const {Block, Transaction} = require('./structures');
const crypto = require('crypto');

const swarm = hyperswarm();
const connections = new Set();

const topic = crypto.createHash('sha256')
  .update('utsc-miner-network')
  .digest();

console.log(topic.toString('base64'));

const miner = new ProofOfWorkMiner(
  './blockchain/blockchain.json',
  './blockchain/utxo.json',
  './wallet/keys.json'
);

swarm.join(topic, {
  lookup   : true,
  announce : true
});

swarm.on('connection', (socket, details) => {
  // establish connection to other nodes
  if (details.client === true) {

    // attach listeners to socket
    socket.on('data', (data) => {
      let body = JSON.parse(data.toString());

      switch (body.action){
        // if other node height is greater than stored height request for difference
        case 'hello':
          if (body.height < miner.blockchain.getHeight()) break;
          let output = {action: 'requestBlocks', height: miner.blockchain.getHeight()};
          socket.write(JSON.stringify(output));
          break;

        // received blocks from other node
        case 'sendBlocks': 
          body.blocks.forEach((curr) => {
            let block = new Block(curr);
            if (miner.verifyBlock(block)) miner.addBlock(block);
          });
          break;
        
        // error
        default:
          break;
      }

    })
    .on('close', () => {
      connections.delete(socket);
    })
    .on('error', (err) => {
      if (err.code === 'UTP_ETIMEDOUT') connections.delete(socket);
    });

    // save connection for future reference
    connections.add(socket);
  }

  // new incoming node connections
  else {

    // attach listener
    socket.on('data', (data) => {
      let body = JSON.parse(data.toString());

      switch (body.action){
        // other node requested download for blocks
        case 'requestBlocks':
          let blocks = miner.blockchain.getBlocks(body.height, miner.blockchain.getHeight());
          let output = {action: 'sendBlocks', blocks: blocks};
          socket.write(JSON.stringify(output));
          break;

        // test
        case 'transact':
          let transaction = new Transaction(body.transaction);
          if (miner.verifyTX(transaction)) miner.stageTX(transaction);
          break;

        // error
        default:
          break;
      }
    })
    .on('close', () => {
      connections.delete(socket);
    })
    .on('error', (err) => {
      if (err.code === 'UTP_ETIMEDOUT') connections.delete(socket);
    });
    
    // send the height of stored blockchain to new incoming node
    let output = {action: 'hello', height: miner.blockchain.getHeight()};
    socket.write(JSON.stringify(output));
  }

});

process.on('SIGINT', () => {
  connections.forEach((socket) => {
    socket.destroy();
  });

  swarm.leave(topic);
  process.exit(0);
});

miner.startMining(10000, (block) => {
  // broadcast block to every
  console.log(block);

});
