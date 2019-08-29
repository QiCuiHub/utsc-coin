var expect = require('expect');
var {Blockchain, Block, Transaction} = require('../core/structures.js');
var {Miner, ProofOfWorkMiner} = require('../core/miner.js')
var testStructs = require('./test-structures.js');

describe('ProofOfWorkMiner', function() {
  describe('#addBlock()', function() {

    let TestMiner, o1, o2, o3, o4, o5, o6;
    
    beforeAll(() => { 
      TestMiner = new ProofOfWorkMiner(
        new Blockchain({blocks: [testStructs.blockGenesis]}),
        null,
        testStructs.walletA,
        3,
        10
      );

      o1 = TestMiner.addBlock(testStructs.block1);
      o2 = TestMiner.addBlock(testStructs.block2);
      o3 = TestMiner.addBlock(testStructs.block3);
      o4 = TestMiner.addBlock(testStructs.blockOrphan);
      o5 = TestMiner.addBlock(testStructs.blockCompete);
      o6 = TestMiner.addBlock(testStructs.blockTransition);
    });

    it('difficulty adjusted', function() {
      expect(TestMiner.difficulty).toBeLessThan(4294967295);
      expect(TestMiner.difficulty).toBeGreaterThan(0);
    });
  });

  describe('#mine', function() {

  });

});
