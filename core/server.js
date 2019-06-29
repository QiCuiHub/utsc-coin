const hyperswarm = require('hyperswarm');
const {Miner} = require('./miner.js');

const swarm = hyperswarm();
const topic = crypto.createHash('sha-256')
  .update('utsc-miner-network')
  .digest();

swarm.join(topic, {
  lookup   : true,
  announce : true
});

const miner = new Miner(
  './blockchain/blockchain.json',
  './blockchain/utxo.json',
  './wallet/keys.json'
);

swarm.on('connection', (socket, details) => {
  socket.on('data', (data) => {

  });
});
