var expect = require('expect');
var {Blockchain, Block, Transaction} = require('../core/structures.js');
var {Miner, ProofOfWorkMiner} = require('../core/miner.js')
var testStructs = require('./test-structures.js');

describe('Miner', function() {
  describe('#getBlocks()', function() {

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

    it('return the correct blocks', function() {
      expect(TestMiner.blockchain.getBlocks(10))
        .toStrictEqual([
          testStructs.blockTransition,
          testStructs.blockCompete,
          testStructs.blockOrphan,
          testStructs.block1,
          testStructs.blockGenesis
        ]);
    });
  });
});
