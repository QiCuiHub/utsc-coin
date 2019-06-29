const hyperswarm = require('hyperswarm');
const {Miner} = require('./miner.js');
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
    socket
      .on('data', (data) => {
        let body = JSON.parse(data.toString());

        // if node height is greater than stored height
        if (body.action === 'hello' && body.height > miner.blockchain.getHeight()){
          // request for the difference in blocks
          let output = {action: 'requestBlocks', height: miner.blockchain.getHeight()};
          socket.write(JSON.stringify(output));

        // receive the difference in blocks
        }else if (body.action === 'sendBlocks'){
          console.log(data.toString());
        }
      })
      .on('close', () => {
        connections.delete(socket);
      });

    // save connection for future reference
    //connections.add(socket);
  }

  // new incoming node connections
  else {
    
    // listen for replys from node
    socket.on('data', (data) => {
        let body = JSON.parse(data.toString());

        // node requests for download
        if (body.action === 'requestBlocks'){
          let blocks = miner.blockchain.blocks.slice(body.height);
          let output = {action: 'sendBlocks', blocks: blocks};
          socket.write(JSON.stringify(output));
        }

    });
    
    // send the height of stored blockchain to the node
    let output = {action: 'hello', height: miner.blockchain.getHeight()};
    socket.write(JSON.stringify(output));
  }

});

process.on('SIGINT', () => {
  swarm.leave(topic);
  process.exit(0);
});
