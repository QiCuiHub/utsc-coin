const {Blockchain, Block, Transaction} = require('../core/structures.js');

// three test users
const walletA = {
'3056301006072a8648ce3d020106052b8104000a0342000481967e9692eb6b082fe9702a5dcc1cebbc71799152d048ae9260a3c30a0cac231d7091954053deddd2ac6b52fc98498b8ba13800ea83908708078e73fc6d1db1':'30740201010420e51bf62561705d2188e83585bdd50a892a3fb1a3fd0395713f5490dc4d85ad16a00706052b8104000aa1440342000481967e9692eb6b082fe9702a5dcc1cebbc71799152d048ae9260a3c30a0cac231d7091954053deddd2ac6b52fc98498b8ba13800ea83908708078e73fc6d1db1',

'3056301006072a8648ce3d020106052b8104000a034200049662721bc3c118681298bbc523ac26e7d6b53b00b617ae94fb6d589cf16938771a7d13782e5c362a71fb4d05f74fd9d38e258afbbda6d65a3960c9904fe22c06':'30740201010420534982152582d748e1deb950565fc856baf90edd6eb47f919b978cfdcb5a746ca00706052b8104000aa144034200049662721bc3c118681298bbc523ac26e7d6b53b00b617ae94fb6d589cf16938771a7d13782e5c362a71fb4d05f74fd9d38e258afbbda6d65a3960c9904fe22c06',

'3056301006072a8648ce3d020106052b8104000a0342000475759ca69587ab833a90aefea1d8365e1120a93eb19deccb4d56f6f32ff85f2c43b0a0e34683842c537b12068795e2997c31d40cfb892a98fd9165c708d33e0d':'30740201010420cda49d6016abafcd506cacfa326e4f9b53237742f26e84a39ebc6a3f42d5ac5aa00706052b8104000aa1440342000475759ca69587ab833a90aefea1d8365e1120a93eb19deccb4d56f6f32ff85f2c43b0a0e34683842c537b12068795e2997c31d40cfb892a98fd9165c708d33e0d'
};

const walletB = {
'3056301006072a8648ce3d020106052b8104000a0342000437b219adabb6da94fde6aeedd5a1e26f14152d112b6b2101d66c78d21dc4dcde59c03bcd22207c47a55adc4807608cc716c98c67fb9a86e73bdbedb9c2df0cae':'30740201010420c871384d8f6278027c35613c052ceca9374b84f457376f741b7e0776b859dc9aa00706052b8104000aa1440342000437b219adabb6da94fde6aeedd5a1e26f14152d112b6b2101d66c78d21dc4dcde59c03bcd22207c47a55adc4807608cc716c98c67fb9a86e73bdbedb9c2df0cae'
};

const walletC = {
'3056301006072a8648ce3d020106052b8104000a03420004fda3a84a416313dfd870b5bd4f56036c686569efc5c7fc5464744622ea3f5e1f848bdaea7d8aae35231b6eb67e025e633fb2cea0bfe57e98ce3aa666cb852b96':'307402010104202f7404648ad74d95fda781c309dffb718a51e3234e96489e395a73f636d4c4c8a00706052b8104000aa14403420004fda3a84a416313dfd870b5bd4f56036c686569efc5c7fc5464744622ea3f5e1f848bdaea7d8aae35231b6eb67e025e633fb2cea0bfe57e98ce3aa666cb852b96'
};

const blockGenesis = new Block({
  transactions: [
    new Transaction({
      input     : [],
      output    : [
        {
          address : Object.keys(walletA)[0],
          value   : 1000
        }
      ],
      publicKey : 'First',
      signature : 'Block',
      type      : 'coinbase'
    })
  ],
  prevHash   : '0',
  height     : 0,
  nonce      : 0
});

// block1:
//  mined by walletC
//  sent 500 coins to wallet B
const block1 = new Block({
  transactions: [
    new Transaction({
      input  : [],
      output : [
        {
          address :  Object.keys(walletC)[0],
          value   :  10
        }
      ],
      publicKey : 'Random',
      signature : 'Data0',
      type      : 'coinbase'
    }),
    new Transaction({
      input : [
        {
          txid : blockGenesis.transactions[0].txid,
          idx  : 0
        } 
      ],
      output : [
        {
          address : Object.keys(walletB)[0],
          value   : 500
        },
        {
          address : Object.keys(walletA)[0],
          value   : 500
        }
      ],
      publicKey : Object.keys(walletA)[0],
      type      : 'transaction'
    }, 
    Object.values(walletA)[0])
  ],
  prevHash: blockGenesis.blockHash,
  height: 1,
  nonce: 0
});

/*
const block2 = new Block({

});

const block3 = new Block({

});

const block4 = new Block({

});
*/

const testChain = new Blockchain({
  blocks: [blockGenesis]
});

module.exports = {
    blockGenesis : blockGenesis,
    block1       : block1,
    testChain    : testChain
}


