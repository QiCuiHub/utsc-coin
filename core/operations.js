const crypto = require('crypto');

getKeyPair = () => {  
  let {publicKey, privateKey} = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
    publicKeyEncoding : {
      type   : 'spki',
      format : 'der'
    },
    privateKeyEncoding : {
      type   : 'sec1',
      format : 'der'
    }
  });

  return {
    publicKey  : publicKey.toString('hex'),
    privateKey : privateKey.toString('hex')
  }
}

sign = (content, privateKey) => {
  let pri = crypto.createPrivateKey({
    key    : Buffer.from(privateKey, 'hex'),
    format : 'der',
    type   : 'sec1'
  });

  return crypto.createSign('SHA256')
    .update(content, 'utf-8')
    .sign(pri, 'hex');
}

verify = (content, signature, publicKey) => {
  try {

    let pub = crypto.createPublicKey({
      key    : Buffer.from(publicKey, 'hex'), 
      format : 'der',
      type   : 'spki'
    });

  return crypto.createVerify('SHA256')
    .update(content, 'utf-8')
    .verify(pub, signature, 'hex');

  }catch(err) {

    if (err.code === 'ERR_OSSL_ASN1_HEADER_TOO_LONG') return false;
    else if (err.code === 'ERR_OSSL_ASN1_TOO_LONG') return false;
    else throw err;

  }
}

module.exports = {
  getKeyPair : getKeyPair,
  sign       : sign,
  verify     : verify
}
