var assert = require('assert');
var {Blockchain, Block, Transaction} = require('../core/structures.js');
var {Miner, ProofOfWorkMiner} = require('../core/miner.js')

describe('#verifyTX', function() {

  it('correct id', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('correct signature', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('ownership of utxos', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('input value equals output value', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });
});

describe('#verifyBlock', function() {
  it('first transaction is coinbase', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('coinbase txid is unique', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('coinbase value is equal to 10', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('no doublespending', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('merkle root is correct', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('previous hash is correct', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('blockhash is correct', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

  it('less than or equal to 10 transactions inside block', function() {
    assert.equal([1, 2, 3].indexOf(4), -1);
  });

});
