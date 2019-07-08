const hyperswarm = require('hyperswarm');
const {Miner} = require('./miner.js');
const {Block, Transaction} = require('./structures');
const crypto = require('crypto');

const swarm = hyperswarm();
const connections = new Set();

const topic = crypto.createHash('sha256')
  .update('utsc-miner-network')
  .digest();

const miner = new Miner(
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
          if (body.height < miner.blockchain.getHeight()) return;
          let output = {action: 'requestBlocks', height: miner.blockchain.getHeight()};
          socket.write(JSON.stringify(output));
          break;

        // received blocks from other node
        case 'sendBlocks': 
          body.blocks.forEach((curr) => {
            let block = new Block(curr);
            if (miner.verifyBlock(block)) miner.blockchain.add(block);
          });
          break;
        
        // error
        default:
          break;
      }

    }).on('close', () => {
      connections.delete(socket);
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
          let blocks = miner.blockchain.blocks.slice(body.height);
          let output = {action: 'sendBlocks', blocks: blocks};
          socket.write(JSON.stringify(output));
          break;

        // test
        case 'test':
          let transaction = new Transaction(body.transaction);
          console.log(miner.verifyTX(transaction));
          break;

        // error
        default:
          break;
      }
    });
    
    // send the height of stored blockchain to the node
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
