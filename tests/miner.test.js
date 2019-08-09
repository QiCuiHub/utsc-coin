var expect = require('expect');
var {Blockchain, Block, Transaction} = require('../core/structures.js');
var {Miner, ProofOfWorkMiner} = require('../core/miner.js')
var testStructs = require('./test-structures.js');


describe('Verify block1', function() {

  let TestMiner, verify;

  beforeAll(() => { 
    TestMiner = new Miner(
      testStructs.testChain,
      null
    );

    verify = TestMiner.verifyBlock(testStructs.block1, true);
  });

  it('first block is coinbase', function() {
    expect(verify[0]).toBe(true);
  });

  it('unique coinbase txid', function() {
    expect(verify[1]).toBe(true);
  });

  it('valid transactions and no doublespend', function() {
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

describe('Add block1', function() {

  let TestMiner;
  
  beforeAll(() => { 
    TestMiner = new Miner(
      testStructs.testChain,
      null
    );

    TestMiner.addBlock(testStructs.block1);
  });


  it('head updated correctly', function() {
    expect(TestMiner.blockchain.head.blockHash)
      .toBe(testStructs.block1.blockHash);

    expect(TestMiner.blockchain.head.prevHash)
      .toBe(testStructs.blockGenesis.blockHash);
  });

  it('utxos updated correctly', function() {
    // coinbase to walletC
    let tidx = testStructs.block1.transactions[0].txid + '.0';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

    // pay 500 to walletB
    tidx = testStructs.block1.transactions[1].txid + '.0';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletB)[0], value: 500});

    // leftover 500 to self
    tidx = testStructs.block1.transactions[1].txid + '.1';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletA)[0], value: 500});

    // no more 1000 coin utxo
    tidx = testStructs.blockGenesis.transactions[0].txid + '.0';
    expect(TestMiner.blockUtxos[tidx]).toBeUndefined();
  });
});

describe('Verify block2', function() {
  
  let TestMiner, verify;

  beforeAll(() => { 
    TestMiner = new Miner(
      testStructs.testChain,
      null
    );

    TestMiner.addBlock(testStructs.block1);
    verify = TestMiner.verifyBlock(testStructs.block2, true);
  });

  it('first block is coinbase', function() {
    expect(verify[0]).toBe(true);
  });

  it('unique coinbase txid', function() {
    expect(verify[1]).toBe(true);
  });

  it('valid transactions and no doublespend', function() {
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

describe('Add block2', function() {

  let TestMiner;
  
  beforeAll(() => { 
    TestMiner = new Miner(
      testStructs.testChain,
      null
    );

    TestMiner.addBlock(testStructs.block1);
    TestMiner.addBlock(testStructs.block2);
  });

  it('head updated correctly', function() {
    expect(TestMiner.blockchain.head.blockHash)
      .toBe(testStructs.block2.blockHash);

    expect(TestMiner.blockchain.head.prevHash)
      .toBe(testStructs.block1.blockHash);
  });

  it('utxos updated correctly', function() {

    // coinbase to walletC
    let tidx = testStructs.block2.transactions[0].txid + '.0';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});
    
    tidx = testStructs.block1.transactions[0].txid + '.0';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

    // pay 250 to walletB
    tidx = testStructs.block2.transactions[1].txid + '.0';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletB)[0], value: 250});

    // leftover 250 to self
    tidx = testStructs.block2.transactions[1].txid + '.1';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletA)[0], value: 250});

    // 500 coin utxo to wallet B still exists
    // if not potential hashing issue 
    tidx = testStructs.block1.transactions[1].txid + '.0';
    expect(TestMiner.blockUtxos[tidx])
      .toStrictEqual({address: Object.keys(testStructs.walletB)[0], value: 500});

    // no more 500 coin utxo to self
    tidx = testStructs.block1.transactions[1].txid + '.1';
    expect(TestMiner.blockUtxos[tidx]).toBeUndefined();
  });
});
