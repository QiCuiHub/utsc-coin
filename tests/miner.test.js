var expect = require('expect');
var {Blockchain, Block, Transaction} = require('../core/structures.js');
var {Miner, ProofOfWorkMiner} = require('../core/miner.js')
var testStructs = require('./test-structures.js');

let TestMiner = new Miner(
  testStructs.testChain,
  null
);

describe('Verify new block', function() {

  let verify = TestMiner.verifyBlock(testStructs.block1, true);

  it('first block is coinbase', function() {
    expect(verify[0]).toBe(true);
  });

  it('unique coinbase txid', function() {
    expect(verify[1]).toBe(true);
  });

  it('no transaction doublespend', function() {
    expect(verify[2]).toBe(true);
  });

  it('less than or equal to 10 tx per block', function() {
    expect(verify[3]).toBe(true);
  });

  it('merkle root matches', function() {
    expect(verify[4]).toBe(true);
  });

  it('previous hash matches', function() {
    expect(verify[5]).toBe(true);
  });

  it('blockhash matches', function() {
    expect(verify[6]).toBe(true);
  });

  it('coinbase reward is 10 coins', function() {
    expect(verify[7]).toBe(true);
  });
});
/*
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
*/
