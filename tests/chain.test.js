var expect = require('expect');
var {Blockchain, Block, Transaction} = require('../core/structures.js');
var {Miner, ProofOfWorkMiner} = require('../core/miner.js')
var testStructs = require('./test-structures.js');

describe('Chain 1', function() {
  describe('Verify block1', function() {

    let TestMiner, verify;

    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
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

    it('blockhash matches', function() {
      expect(verify[5]).toBe(true);
    });

    it('coinbase reward is 10 coins', function() {
      expect(verify[6]).toBe(true);
    });
  });

  describe('Add block1', function() {

    let TestMiner;
    
    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
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
        new Blockchain({blocks: [testStructs.blockGenesis]}),
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

    it('blockhash matches', function() {
      expect(verify[5]).toBe(true);
    });

    it('coinbase reward is 10 coins', function() {
      expect(verify[6]).toBe(true);
    });
  });

  describe('Add block2', function() {

    let TestMiner;
    
    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
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

  describe('Verify block3', function() {
    
    let TestMiner, verify;

    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      TestMiner.addBlock(testStructs.block1);
      TestMiner.addBlock(testStructs.block2);
      verify = TestMiner.verifyBlock(testStructs.block3, true);
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

    it('blockhash matches', function() {
      expect(verify[5]).toBe(true);
    });

    it('coinbase reward is 10 coins', function() {
      expect(verify[6]).toBe(true);
    });
  });

  describe('Add block3', function() {

    let TestMiner;
    
    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      TestMiner.addBlock(testStructs.block1);
      TestMiner.addBlock(testStructs.block2);
      TestMiner.addBlock(testStructs.block3);
    });

    it('head updated correctly', function() {
      expect(TestMiner.blockchain.head.blockHash)
        .toBe(testStructs.block3.blockHash);

      expect(TestMiner.blockchain.head.prevHash)
        .toBe(testStructs.block2.blockHash);
    });

    it('utxos updated correctly', function() {

      // coinbase to walletC
      let tidx = testStructs.block3.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});
      
      tidx = testStructs.block2.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

      tidx = testStructs.block1.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

      // walletB no more utxos
      tidx = testStructs.block2.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx]).toBeUndefined();

      tidx = testStructs.block1.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx]).toBeUndefined();

      // pay 750 coins to walletC
      tidx = testStructs.block3.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 750});
    });
  });
});


describe('Chain 2', function() {
  describe('Verify orphan block', function() {
    
    let TestMiner, verify;

    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      TestMiner.addBlock(testStructs.block1);
      TestMiner.addBlock(testStructs.block2);
      TestMiner.addBlock(testStructs.block3);

      verify = TestMiner.verifyBlock(testStructs.blockOrphan, true);
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

    it('blockhash matches', function() {
      expect(verify[5]).toBe(true);
    });

    it('coinbase reward is 10 coins', function() {
      expect(verify[6]).toBe(true);
    });
  });

  describe('Add orphan block', function() {

    let TestMiner;
    
    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      TestMiner.addBlock(testStructs.block1);
      TestMiner.addBlock(testStructs.block2);
      TestMiner.addBlock(testStructs.block3);
    });

    it('head updated correctly', function() {
      expect(TestMiner.blockchain.head.blockHash)
        .toBe(testStructs.block3.blockHash);

      expect(TestMiner.blockchain.head.prevHash)
        .toBe(testStructs.block2.blockHash);
    });

    it('utxos updated correctly', function() {

      // coinbase to walletC
      let tidx = testStructs.block3.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});
      
      tidx = testStructs.block2.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

      tidx = testStructs.block1.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

      // walletB no more utxos
      tidx = testStructs.block2.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx]).toBeUndefined();

      tidx = testStructs.block1.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx]).toBeUndefined();

      // pay 750 coins to walletC
      tidx = testStructs.block3.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 750});
    });
  });

  describe('Verify competing block', function() {
    
    let TestMiner, verify;

    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      TestMiner.addBlock(testStructs.block1);
      TestMiner.addBlock(testStructs.block2);
      TestMiner.addBlock(testStructs.block3);
      TestMiner.addBlock(testStructs.blockOrphan);

      verify = TestMiner.verifyBlock(testStructs.blockCompete, true);
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

    it('blockhash matches', function() {
      expect(verify[5]).toBe(true);
    });

    it('coinbase reward is 10 coins', function() {
      expect(verify[6]).toBe(true);
    });
  });

  describe('Add competing block', function() {

    let TestMiner;
    
    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      TestMiner.addBlock(testStructs.block1);
      TestMiner.addBlock(testStructs.block2);
      TestMiner.addBlock(testStructs.block3);
      TestMiner.addBlock(testStructs.blockOrphan);
      TestMiner.addBlock(testStructs.blockCompete);
    });

    it('head updated correctly', function() {
      expect(TestMiner.blockchain.head.blockHash)
        .toBe(testStructs.block3.blockHash);

      expect(TestMiner.blockchain.head.prevHash)
        .toBe(testStructs.block2.blockHash);
    });

    it('utxos updated correctly', function() {

      // coinbase to walletC
      let tidx = testStructs.block3.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});
      
      tidx = testStructs.block2.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

      tidx = testStructs.block1.transactions[0].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 10});

      // walletB no more utxos
      tidx = testStructs.block2.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx]).toBeUndefined();

      tidx = testStructs.block1.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx]).toBeUndefined();

      // pay 750 coins to walletC
      tidx = testStructs.block3.transactions[1].txid + '.0';
      expect(TestMiner.blockUtxos[tidx])
        .toStrictEqual({address: Object.keys(testStructs.walletC)[0], value: 750});
    });
  });

  describe('Verify transition block', function() {
    
    let TestMiner, verify;

    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      TestMiner.addBlock(testStructs.block1);
      TestMiner.addBlock(testStructs.block2);
      TestMiner.addBlock(testStructs.block3);
      TestMiner.addBlock(testStructs.blockOrphan);
      TestMiner.addBlock(testStructs.blockCompete);

      verify = TestMiner.verifyBlock(testStructs.blockTransition, true);
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

    it('blockhash matches', function() {
      expect(verify[5]).toBe(true);
    });

    it('coinbase reward is 10 coins', function() {
      expect(verify[6]).toBe(true);
    });
  });

  describe('Add transition block', function() {

    let TestMiner, o1, o2, o3, o4, o5, o6;
    
    beforeAll(() => { 
      TestMiner = new Miner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null
      );

      o1 = TestMiner.addBlock(testStructs.block1);
      o2 = TestMiner.addBlock(testStructs.block2);
      o3 = TestMiner.addBlock(testStructs.block3);
      o4 = TestMiner.addBlock(testStructs.blockOrphan);
      o5 = TestMiner.addBlock(testStructs.blockCompete);
      o6 = TestMiner.addBlock(testStructs.blockTransition);
    });

    it('head updated correctly', function() {
      expect(TestMiner.blockchain.head.blockHash)
        .toBe(testStructs.blockTransition.blockHash);

      expect(TestMiner.blockchain.head.prevHash)
        .toBe(testStructs.blockCompete.blockHash);
    });

    it('found the correct orphaned blocks', function() {
      expect(o1).toStrictEqual([]);
      expect(o2).toStrictEqual([]);
      expect(o3).toStrictEqual([]);
      expect(o4).toStrictEqual([]);
      expect(o5).toStrictEqual([]);

      expect(o6[0].blockHash)
        .toBe(testStructs.block2.blockHash);
      
      expect(o6[1].blockHash)
        .toBe(testStructs.block3.blockHash);

    });

    it('transactions return to txpool', function() {
      expect(o1).toStrictEqual([]);
      expect(o2).toStrictEqual([]);
      expect(o3).toStrictEqual([]);
      expect(o4).toStrictEqual([]);
      expect(o5).toStrictEqual([]);

      expect(o6[0].blockHash)
        .toBe(testStructs.block2.blockHash);
      
      expect(o6[1].blockHash)
        .toBe(testStructs.block3.blockHash);

    });
  });
});
